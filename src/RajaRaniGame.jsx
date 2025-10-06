// src/RajaRaniGame.jsx
import { useContext, useEffect, useState } from "react";
import { SocketContext } from "./SocketContext.jsx";
import { useBlinkingEmoji } from "./utils/uniqueEmoji.js";
import { useRef } from "react";

export default function RajaRaniGame({ onExit }) {
  const { socket, connected: socketConnected } = useContext(SocketContext);
  const [myName, setMyName] = useState("");
  const [added, setAdded] = useState(false);
  const [players, setPlayers] = useState([]);
  const [rolesPublic, setRolesPublic] = useState({});
  const [activePlayer, setActivePlayer] = useState(null);
  const [history, setHistory] = useState([]);
  const [round, setRound] = useState(0);
  const [roundActive, setRoundActive] = useState(false);
  const [myRole, setMyRole] = useState(null);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);
  const [latestFeedback, setLatestFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [roleTimeLeft, setRoleTimeLeft] = useState(0);
  const [turnTimeLeft, setTurnTimeLeft] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminId, setAdminId] = useState(null);
  const [adminName, setAdminName] = useState(null);
  const [turnInterval, setTurnInterval] = useState(null);
  const [showScoreboardPopup, setShowScoreboardPopup] = useState(false);
  // ---------------- SOCKET EFFECT ----------------
useEffect(() => {
  if (!socket) return;

  // ---------------- HANDLE GAME STATE ----------------
  const handleState = (s) => {
    setPlayers(s.players || []);
    setRolesPublic(s.rolesPublic || {});
    setActivePlayer(s.activePlayer || null);
    setHistory(s.history || []);
    setRound(s.round || 0);
    setRoundActive(!!s.roundActive);
    setIsAdmin(s.admin === socket.id);
    setAdminId(s.admin || null);
    setAdminName(s.adminName || null);

    if (added) socket.emit("requestRole", myName);
  };

  const handleYourRole = ({ role }) => setMyRole(role);

  const handleRoundSummary = ({ round: r, summary }) => {
      setTurnTimeLeft(0);

      // Show scoreboard popup after short delay
      setTimeout(() => {
        setShowScoreboardPopup(true);
      }, 1000);
    };

  // ---------------- TIMER HANDLERS ----------------
  // Called whenever a new player's turn starts
const handleTimerStart = ({ timeLeft, player }) => {
  setTurnTimeLeft(Math.ceil(timeLeft / 1000));

  if (player === myName) {
    setLatestFeedback({ text: "🎯 Your Turn!", type: "success" });
    setTimeout(() => setLatestFeedback(null), 1800);
  }
};

// Called every second to update countdown
  const handleTimerUpdate = ({ timeLeft, player }) => {
  if (player === myName) setTurnTimeLeft(Math.ceil(timeLeft / 1000));
};

  const handleRoleTimerUpdate = ({ remaining }) => {
    setRoleTimeLeft(Math.ceil(remaining / 1000));
  };

  const handleTurnTimerUpdate = ({ remaining, player }) => {
    if (player === myName) setTurnTimeLeft(Math.ceil(remaining / 1000));
  };

  // ---------------- SOCKET LISTENERS ----------------
  socket.on("state", handleState);
  socket.on("yourRole", handleYourRole);
  socket.on("roundSummary", handleRoundSummary);
  socket.on("timerStart", handleTimerStart);
  socket.on("timerUpdate", handleTimerUpdate);
  socket.on("roleTimerUpdate", handleRoleTimerUpdate);
  socket.on("turnTimerUpdate", handleTurnTimerUpdate);
  socket.on("errorMsg", (msg) => {
    setError(msg);
    setTimeout(() => setError(""), 3500);
  });

  // Cleanup listeners
  return () => {
    socket.off("state", handleState);
    socket.off("yourRole", handleYourRole);
    socket.off("roundSummary", handleRoundSummary);
    socket.off("timerStart", handleTimerStart);
    socket.off("timerUpdate", handleTimerUpdate);
    socket.off("roleTimerUpdate", handleRoleTimerUpdate);
    socket.off("turnTimerUpdate", handleTurnTimerUpdate);
  };
}, [socket, added, myName]);

  useEffect(() => {
  console.log("activePlayer:", activePlayer?.name, "myName:", myName, "turnTimeLeft:", turnTimeLeft);
}, [activePlayer, myName, turnTimeLeft]);

  // ---------------- ADMIN START/END EFFECT ----------------
useEffect(() => {
  if (!socket) return;

  const handleGameUpdate = (g) => {
    setPlayers(g.players);
    setIsAdmin(g.admin === socket.id);
  };

  const handleGameStarted = (g) => {
    setPlayers(g.players);
    setRoundActive(true);
  };

  const handleGameEnded = (g) => {
    setPlayers(g.players);
    setRoundActive(false);
  };

  socket.on("gameUpdate", handleGameUpdate);
  socket.on("gameStarted", handleGameStarted);
  socket.on("gameEnded", handleGameEnded);

  return () => {
    socket.off("gameUpdate", handleGameUpdate);
    socket.off("gameStarted", handleGameStarted);
    socket.off("gameEnded", handleGameEnded);
  };
}, [socket]);


    useEffect(() => {
      if (history.length > 0) {
      setLatestFeedback(history[history.length - 1]);
    }
  }, [history]);

  useEffect(() => {
  // Clear any existing interval
  if (turnInterval) {
    clearInterval(turnInterval);
    setTurnInterval(null);
  }

  // Only start timer if it's our turn
  if (activePlayer?.name === myName && turnTimeLeft > 0) {
    const interval = setInterval(() => {
      setTurnTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setTurnInterval(interval);
  }

  return () => {
    if (turnInterval) clearInterval(turnInterval);
  };
}, [activePlayer, myName, turnTimeLeft]);

  useBlinkingEmoji(
  myName,
  activePlayer?.name === myName
    ? "yourTurn"
    : activePlayer
    ? "othersTurn"
    : "waiting"
);

 const handleJoin = (isAdmin) => {
  const name = myName.trim();
  if (!name) return setError("Enter a valid name");

  if (!socket || !socket.connected) {
    return setError("Socket not connected yet. Try again in a moment.");
  }

  socket.emit("joinGame", { name, isAdmin }, (response) => {
    if (response?.success) {
      setAdded(true);
      setIsAdmin(isAdmin);
      setError("");
    } else {
      setError(response?.error || "Name taken");
    }
  });
};

  const startRound = () => {
    socket.emit("startRound", (res) => {
      if (res && !res.success) setError(res.error || "Can't start round");
    });
  };

  const attemptCatch = (targetName) => {
    if (!added) return setError("Join first");
    if (!activePlayer || activePlayer.name !== myName)
      return setError("Not your turn");

    socket.emit("attemptCatch", { catcherName: myName, targetName }, (res) => {
      if (res && !res.success) setError(res.error || "Failed catch");
    });
  };

  const forceEnd = () => {
    socket.emit("forceEnd", (res) => {
      if (res && !res.success) setError(res.error || "Can't force end");
    });
  };

 

  return (
    <div
  style={{
    padding: 16,
    maxWidth: 900,
    margin: "auto",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  }}
>
  {/* 🔙 Back button */}
  <div style={{ marginBottom: 16 }}>
    <button
      onClick={() => {
        if (window.confirm("Are you sure you want to exit the game?")) {
          onExit();
        }
      }}
      style={{
        padding: "8px 14px",
        borderRadius: "8px",
        border: "none",
        background: "linear-gradient(90deg, #f43f5e, #ec4899)",
        color: "#fff",
        fontWeight: "600",
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(236, 72, 153, 0.4)",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.05)";
        e.currentTarget.style.boxShadow = "0 6px 16px rgba(236,72,153,0.6)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(236,72,153,0.4)";
      }}
    >
      ⬅ Back to Home
    </button>
  </div>
<h1>🎭 Raja Rani Multiplayer (10 Roles)</h1>


    {/* 🎮 Join as Admin / Player */}
{!added ? (
  <div style={{ marginBottom: 16, textAlign: "center" }}>
    <input
      placeholder="Enter your name"
      value={myName}
      onChange={(e) => setMyName(e.target.value)}
      style={{
        padding: "8px 12px",
        borderRadius: 8,
        border: "1px solid #ccc",
        fontSize: 16,
        width: 200,
        marginRight: 12,
      }}
    />

    <button
      onClick={() => handleJoin(true)}
      disabled={!myName.trim() || added}
      style={{
        padding: "8px 16px",
        borderRadius: 10,
        border: "none",
        background: "linear-gradient(90deg, #facc15, #f97316)",
        color: "#fff",
        fontWeight: 700,
        fontSize: 15,
        cursor: "pointer",
        marginRight: 8,
        boxShadow: "0 4px 12px rgba(250, 204, 21, 0.4)",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.05)";
        e.currentTarget.style.boxShadow = "0 6px 16px rgba(250,204,21,0.6)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(250,204,21,0.4)";
      }}
    >
      🕹️ Join as Admin
    </button>

    <button
      onClick={() => handleJoin(false)}
      disabled={!myName.trim() || added}
      style={{
        padding: "8px 16px",
        borderRadius: 10,
        border: "none",
        background: "linear-gradient(90deg, #3b82f6, #06b6d4)",
        color: "#fff",
        fontWeight: 700,
        fontSize: 15,
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(59,130,246,0.4)",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.05)";
        e.currentTarget.style.boxShadow = "0 6px 16px rgba(59,130,246,0.6)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(59,130,246,0.4)";
      }}
    >
      🎮 Join as Player
    </button>
  </div>
) : (
  <div style={{ marginBottom: 12, textAlign: "center", fontWeight: 600 }}>
    <span>Socket connected: </span>
    <span style={{ color: socketConnected ? "#22c55e" : "#ef4444" }}>
      {socketConnected ? "✅ Yes" : "❌ No"}
    </span>
  </div>
)}


     <div
  style={{
    marginBottom: 16,
    padding: "12px 16px",
    background: "#f9f9f9",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    border: "1px solid #e5e5e5",
  }}
>
  <strong style={{ fontSize: "16px", marginBottom: "8px", display: "block" }}>
    Players ({players.length}/10):
  </strong>

  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
    {players.map((p) => {
      const isYou = p.name === myName;
      const isAdminPlayer = p.name === adminName;
      return (
        <li
          key={p.name}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 12px",
            marginBottom: "6px",
            borderRadius: "10px",
            background: isYou
              ? "linear-gradient(90deg, #3b82f6, #06b6d4)"
              : isAdminPlayer
              ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
              : "#ffffff",
            color: isYou || isAdminPlayer ? "#fff" : "#333",
            fontWeight: isYou ? "700" : isAdminPlayer ? "600" : "500",
            boxShadow:
              isYou || isAdminPlayer ? "0 4px 10px rgba(0,0,0,0.15)" : "none",
            transition: "all 0.2s ease",
          }}
        >
          <span>
            {p.name} {isAdminPlayer && "🕹️"} {isYou && "(YOU)"}
          </span>
          {p.inactive && <span style={{ fontWeight: "bold" }}>✅ Done</span>}
        </li>
      );
    })}
  </ul>
</div>

{/* 🌟 Admin Controls / Round Buttons */}
<div
  style={{
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "12px",
  }}
>
  {/* Start Round */}
  {isAdmin && !roundActive && (
    <button
      onClick={startRound}
      style={{
        padding: "10px 18px",
        fontWeight: "600",
        borderRadius: "12px",
        border: "none",
        cursor: "pointer",
        background: "linear-gradient(90deg, #3b82f6, #06b6d4)",
        color: "#fff",
        boxShadow: "0 4px 12px rgba(59,130,246,0.4)",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 6px 18px rgba(59,130,246,0.6)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.boxShadow = "0 4px 12px rgba(59,130,246,0.4)")
      }
    >
      ▶ Start Round
    </button>
  )}

  {/* Force End */}
  {isAdmin && roundActive && (
    <button
      onClick={forceEnd}
      style={{
        padding: "10px 18px",
        fontWeight: "600",
        borderRadius: "12px",
        border: "none",
        cursor: "pointer",
        background: "linear-gradient(90deg, #ef4444, #f97316)",
        color: "#fff",
        boxShadow: "0 4px 12px rgba(239,68,68,0.4)",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 6px 18px rgba(239,68,68,0.6)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.boxShadow = "0 4px 12px rgba(239,68,68,0.4)")
      }
    >
      ❌ Force End
    </button>
)}
  
  {/* 🌈 Stylish Feedback + Round Display */}
<div
  style={{
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "12px",
    background: "#f0f4f8",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    border: "2px solid #d1d5db",
  }}
>
  {/* 💬 Latest Feedback */}
  {latestFeedback ? (
    <div
      style={{
        marginBottom: "10px",
        padding: "8px 12px",
        borderRadius: "10px",
        fontWeight: "bold",
        fontSize: "16px",
        textAlign: "center",
        color:
          latestFeedback.type === "error"
            ? "#b91c1c"
            : latestFeedback.type === "success"
            ? "#16a34a"
            : "#1e3a8a",
        background:
          latestFeedback.type === "error"
            ? "#fee2e2"
            : latestFeedback.type === "success"
            ? "#d1fae5"
            : "#dbeafe",
        border:
          latestFeedback.type === "error"
            ? "2px solid #f87171"
            : latestFeedback.type === "success"
            ? "2px solid #34d399"
            : "2px solid #3b82f6",
        boxShadow:
          latestFeedback.type === "error"
            ? "0 0 8px rgba(239,68,68,0.5)"
            : latestFeedback.type === "success"
            ? "0 0 8px rgba(22,163,74,0.5)"
            : "0 0 8px rgba(59,130,246,0.5)",
        transition: "all 0.3s ease",
      }}
    >
      {latestFeedback.text || latestFeedback}
    </div>
  ) : error ? (
    <div
      style={{
        marginBottom: "10px",
        padding: "8px 12px",
        borderRadius: "10px",
        fontWeight: "bold",
        fontSize: "16px",
        textAlign: "center",
        color: "#b91c1c",
        background: "#fee2e2",
        border: "2px solid #f87171",
        boxShadow: "0 0 8px rgba(239,68,68,0.5)",
      }}
    >
      {error}
    </div>
  ) : (
    <div
      style={{
        marginBottom: "10px",
        padding: "8px 12px",
        borderRadius: "10px",
        fontWeight: "bold",
        fontSize: "16px",
        textAlign: "center",
        color: "#6b7280",
        fontStyle: "italic",
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
      }}
    >
      No feedback yet
    </div>
  )}

  {/* 🏁 Round Display */}
  <div
    style={{
      textAlign: "center",
      fontSize: "18px",
      fontWeight: "600",
      padding: "10px 14px",
      borderRadius: "12px",
      background: roundActive ? "#e0f2fe" : "#fef3c7",
      color: roundActive ? "#0369a1" : "#b45309",
      border: roundActive ? "2px solid #38bdf8" : "2px solid #fbbf24",
      boxShadow: roundActive
        ? "0 0 12px rgba(14,165,233,0.5)"
        : "0 0 12px rgba(251,191,24,0.5)",
      transition: "all 0.3s ease",
    }}
  >
    Round: {round} {roundActive ? "(active)" : "(waiting)"}
  </div>
</div>


     {/* ⏰ Stylish Timer Display */}
{turnTimeLeft > 0 && activePlayer?.name?.trim() === myName.trim() && (
  <div
    style={{
      marginTop: 10,
      display: "inline-block",
      padding: "10px 18px",
      fontSize: "20px",
      fontWeight: "bold",
      color: turnTimeLeft <= 5 ? "#b91c1c" : "#1e3a8a",
      background: turnTimeLeft <= 5 ? "#fee2e2" : "#e0e7ff",
      border: `3px solid ${turnTimeLeft <= 5 ? "#ef4444" : "#6366f1"}`,
      borderRadius: "12px",
      boxShadow:
        turnTimeLeft <= 5
          ? "0 0 12px rgba(239, 68, 68, 0.8)"
          : "0 0 10px rgba(99, 102, 241, 0.6)",
      textAlign: "center",
      transition: "all 0.3s ease",
      animation: turnTimeLeft <= 5 ? "pulse 1s infinite" : "none",
    }}
  >
    🕒 Your turn: {Math.ceil(turnTimeLeft)}s
  </div>
)}


     {/* 🌟 Public Player List Section */}
<div
  style={{
    marginTop: 16,
    marginBottom: 16,
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    padding: "16px",
    border: "1px solid #e5e5e5",
  }}
>
  <h3
    style={{
      marginTop: 0,
      marginBottom: 12,
      textAlign: "center",
      fontSize: "18px",
      fontWeight: "600",
      color: "#333",
      letterSpacing: "0.5px",
    }}
  >
    👥 Public Player List
  </h3>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "8px",
    }}
  >
    {players.map((p) => {
      const role = rolesPublic[p.name] || "?????";
      return (
        <div
          key={p.name}
          style={{
            background: p.inactive ? "#f0fdf4" : "#f9fafb",
            border: p.inactive ? "1px solid #86efac" : "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "8px 10px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          <div>
            <span style={{ color: "#111827" }}>{p.name}</span>
            <span style={{ color: "#6b7280" }}> — {role}</span>
          </div>
          {p.inactive && (
            <span
              style={{
                fontSize: "14px",
                color: "#16a34a",
                fontWeight: "600",
              }}
            >
              ✅
            </span>
          )}
        </div>
      );
    })}
  </div>
</div>


       {/* 🌟 Active Player + Role + Target Section */}
<div
  style={{
    marginTop: 12,
    marginBottom: 16,
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    padding: "16px",
    border: "1px solid #e5e5e5",
  }}
>
  {/* 🧍 Active Player Display */}
  <div
    style={{
      fontSize: "18px",
      fontWeight: "600",
      color: activePlayer?.name === myName ? "#0a7cff" : "#333",
      textAlign: "center",
      marginBottom: "10px",
    }}
  >
    {activePlayer ? (
      <>
        <span>Active Player: </span>
        <span>
          {activePlayer.name}{" "}
          {activePlayer.name === myName && (
            <span style={{ color: "#0a7cff", fontWeight: "700" }}>
              (Your Turn)
            </span>
          )}
        </span>
      </>
    ) : (
      <span style={{ color: "#999" }}>No active player yet</span>
    )}
  </div>

  {/* 🎭 Your Role */}
  {myRole && (
    <div
      style={{
        textAlign: "center",
        marginBottom: 12,
        padding: "8px 12px",
        background: "#f9f9f9",
        border: "1px dashed #ccc",
        borderRadius: "8px",
        display: "inline-block",
        fontWeight: "500",
      }}
    >
      <strong>Your Role:</strong> {myRole}
    </div>
  )}

  {/* 🟠 Target Selection */}
  {activePlayer?.name === myName && (
    <div style={{ marginTop: 12, textAlign: "center" }}>
      <strong style={{ display: "block", marginBottom: 8 }}>
        Choose a Target:
      </strong>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        {players
          .filter((p) => p.name !== myName)
          .map((p) => (
            <button
              key={p.name}
              onClick={() => attemptCatch(p.name)}
              style={{
                padding: "8px 14px",
                background: "#f0f0f0",
                border: "1px solid #ccc",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "500",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#e8e8e8")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#f0f0f0")
              }
            >
              {p.name}
            </button>
          ))}
      </div>
    </div>
  )}

  {/* ⏳ Waiting message */}
  {activePlayer?.name !== myName && (
    <div
      style={{
        textAlign: "center",
        marginTop: 12,
        fontStyle: "italic",
        color: "#666",
      }}
    >
      Waiting for {activePlayer?.name || "round start"}...
    </div>
  )}
</div>
</div>

      {/* 🌟 Special Clean Scoreboard (Bottom) */}
<div
  style={{
    marginTop: 20,
    padding: "16px",
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    textAlign: "center",
    border: "1px solid #e5e5e5",
  }}
>
  <h2
    style={{
      fontSize: "20px",
      fontWeight: "600",
      marginBottom: "12px",
      letterSpacing: "0.5px",
      color: "#333",
      borderBottom: "2px solid #ddd",
      display: "inline-block",
      paddingBottom: "4px",
    }}
  >
    Scoreboard
  </h2>

  <div style={{ maxWidth: 400, margin: "0 auto" }}>
    {players
      .slice()
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .map((p, index) => {
        const isYou = p.name === myName;
        return (
          <div
            key={p.name}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 12px",
              marginBottom: "6px",
              borderRadius: "8px",
              background: isYou ? "#f0f9ff" : "#f9f9f9",
              border: "1px solid #eee",
              fontWeight: isYou ? "600" : "400",
              color: isYou ? "#0056b3" : "#444",
              transition: "background 0.3s",
            }}
          >
            <span>{index + 1}. {p.name} {isYou && "(You)"}</span>
            <span>{p.score || 0} pts</span>
          </div>
        );
      })}
  </div>
</div>

    
     <div style={{ marginBottom: 12 }}>
  <h3>Feedback</h3>

  <div
    style={{
      maxHeight: 80,
      minHeight: 50,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#fafafa",
      padding: 8,
      border: "1px solid #eee",
      fontWeight: "bold",
      fontSize: "16px",
      textAlign: "center",
    }}
  >
    {latestFeedback ? (
      <div
        className={`new-log ${latestFeedback.type || "neutral"}`}
        style={{
          color:
            latestFeedback.type === "error"
              ? "red"
              : latestFeedback.type === "success"
              ? "green"
              : "black",
        }}
      >
        {latestFeedback.text || latestFeedback}
      </div>
    ) : (
      <span style={{ color: "#999", fontStyle: "italic" }}>
        No feedback yet
      </span>
    )}
  </div>
</div>
    
   {/* 🏆 Special Scoreboard Popup after round ends */}
{showScoreboardPopup && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0, 0, 0, 0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10000,
      animation: "fadeIn 0.4s ease",
    }}
  >
    <div
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%)",
        padding: "30px 40px",
        borderRadius: "16px",
        boxShadow: "0 8px 25px rgba(0,0,0,0.4)",
        textAlign: "center",
        maxWidth: "400px",
        width: "90%",
        position: "relative",
        animation: "scaleIn 0.3s ease",
      }}
    >
      <h2 style={{ fontSize: "26px", marginBottom: "15px" }}>🏆 Round Over!</h2>
      <p style={{ marginBottom: "15px", fontSize: "16px", color: "#555" }}>
        Here’s the latest <strong>Scoreboard</strong> 👇
      </p>

      <ol style={{ textAlign: "left", paddingLeft: "20px", marginBottom: "20px" }}>
        {players
          .slice()
          .sort((a, b) => (b.score || 0) - (a.score || 0))
          .map((p, index) => (
            <li
              key={p.name}
              style={{
                fontWeight: index === 0 ? "bold" : "normal",
                color:
                  index === 0
                    ? "#d4af37" // 🥇 gold
                    : index === 1
                    ? "#c0c0c0" // 🥈 silver
                    : index === 2
                    ? "#cd7f32" // 🥉 bronze
                    : "#333",
                fontSize: index < 3 ? "18px" : "15px",
                marginBottom: "6px",
              }}
            >
              {index + 1}. {p.name} — {p.score || 0} pts {p.inactive ? "✅" : ""}
            </li>
          ))}
      </ol>

      {/* ✅ Admin Start Next Round button */}
      {isAdmin && (
        <button
          onClick={() => {
            setShowScoreboardPopup(false);
            startRound();
          }}
          style={{
            marginTop: 8,
            marginRight: 8,
            padding: "8px 14px",
            background: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          ▶ Start Next Round
        </button>
      )}

      <button
        onClick={() => setShowScoreboardPopup(false)}
        style={{
          marginTop: 8,
          padding: "8px 14px",
          background: "#444",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "14px",
        }}
      >
        Close
      </button>
    </div>
  </div>
  )}
  </div>
 );
}

