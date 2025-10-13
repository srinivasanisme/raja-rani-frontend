// src/RajaRaniGame.jsx
import { useContext, useEffect, useState } from "react";
import { SocketContext } from "./SocketContext.jsx";
import { useBlinkingEmoji } from "./utils/uniqueEmoji.js";
import RoleList from "./RoleList.jsx";
import { useRef } from "react";
import "./styles.css";

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
  const [feedback, setFeedback] = useState("");        // input value
  const [feedbackList, setFeedbackList] = useState([]); // all feedback
  const [open, setOpen] = useState(false);
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
  if (!socket) return;

  const handleNewFeedback = (msg) => {
    setFeedbackList((prev) => [...prev, msg]);
  };

  socket.on("newFeedback", handleNewFeedback);

  return () => {
    socket.off("newFeedback", handleNewFeedback);
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


  const sendFeedback = () => {
  if (!feedback.trim()) return;
  socket.emit("sendFeedback", { player: myName, text: feedback });
  setFeedback(""); // clear input locally
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

<div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 overflow-hidden">
  {/* Main Game Title */}
  <h1 className="relative text-7xl md:text-9xl font-extrabold text-center tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 drop-shadow-[0_0_25px_rgba(255,255,255,0.8)] animate-pulse">
                   🫣👀 CatchMe 🙋 IfUCan 🎭
  </h1>

  {/* Subtitle */}
  <p className="mt-6 md:mt-8 text-yellow-300 text-2xl md:text-3xl font-bold uppercase text-center drop-shadow-[0_0_15px_rgba(255,255,150,0.9)] animate-pulse">
    The Ultimate Hide & Seek Challenge
  </p>

  {/* Extra glowing effect */}
  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-10 animate-animate-glow pointer-events-none"></div>
</div>
 




   {/* 🎮 Join as Admin / Player */}
{!added && (
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
)}


<div
  style={{
    position: "relative", // Needed for absolute positioning of round
    marginBottom: "20px",
    padding: "10px 12px",
    background: "#0f172a",
    borderRadius: "12px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.35)",
    border: "1px solid #1e293b",
    color: "#fff",
  }}
>
  {/* ⬆ Round Display Badge */}
  <div
    style={{
      position: "absolute",
      top: "-14px",
      left: "50%",
      transform: "translateX(-50%)",
      fontSize: "14px",
      fontWeight: "700",
      padding: "6px 10px",
      borderRadius: "10px",
      background: roundActive
        ? "linear-gradient(90deg, #38bdf8, #0ea5e9)"
        : "linear-gradient(90deg, #facc15, #eab308)",
      color: "#f0f9ff",
      border: "2px solid",
      borderColor: roundActive ? "#0ea5e9" : "#eab308",
      boxShadow: roundActive
        ? "0 0 10px rgba(14,165,233,0.6)"
        : "0 0 10px rgba(251,191,24,0.6)",
      textAlign: "center",
      whiteSpace: "nowrap",
    }}
  >
    🏁 Round: {round} {roundActive ? "(ACTIVE)" : "(WAITING)"}
  </div>

  <strong
  style={{
    fontSize: "14px",
    marginBottom: "8px",
    display: "block",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    color: "#38bdf8",
    textAlign: "left",      // <-- Changed from center
    paddingLeft: "8px",     // <-- Optional, adds a bit of margin from left edge
  }}
>
  💥 Players ({players.length}/10)
</strong>

  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "6px",
      justifyContent: "center",
    }}
  >
    {players.map((p) => {
      const isYou = p.name === myName;
      const isAdminPlayer = p.name === adminName;

      let bg = "#334155";
      let text = "#e2e8f0";
      if (isAdminPlayer) {
        bg = "linear-gradient(135deg, #f59e0b, #fbbf24)";
        text = "#fff";
      } else if (isYou) {
        bg = "linear-gradient(135deg, #3b82f6, #06b6d4)";
        text = "#fff";
      }

      return (
        <div
          key={p.name}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "6px 10px",
            borderRadius: "999px",
            background: bg,
            color: text,
            fontWeight: isYou ? "700" : isAdminPlayer ? "600" : "500",
            fontSize: "12px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
            transition: "transform 0.2s ease",
            cursor: "default",
            maxWidth: "100%",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
            {isAdminPlayer && "🥷"} {p.name} {isYou && "🫵"}
          </span>
          {p.inactive && <span style={{ fontWeight: "bold" }}>✅</span>}
        </div>
      );
    })}
  </div>
</div>


{/* 💬 Feedback Line — Centered, single line, full-width if needed */}
<div
  style={{
    display: "block",
    maxWidth: "100%",         // allow full width on web
    minWidth: "200px",        // optional: don't shrink too small
    margin: "10px auto",      // center horizontally
    padding: "8px 16px",
    textAlign: "center",
    fontFamily: "'Orbitron', sans-serif",
    fontSize: "14px",
    fontWeight: "700",
    borderRadius: "8px",
    background: latestFeedback
      ? latestFeedback.type === "error"
        ? "#7f1d1d"
        : latestFeedback.type === "success"
        ? "#14532d"
        : "#1e3a8a"
      : "#0f172a",
    color: "#f1f5f9",
    border: latestFeedback
      ? latestFeedback.type === "error"
        ? "2px solid #ef4444"
        : latestFeedback.type === "success"
        ? "2px solid #22c55e"
        : "2px solid #3b82f6"
      : "2px dashed #64748b",
    boxShadow:
      latestFeedback?.type === "error"
        ? "0 0 8px #ef4444"
        : latestFeedback?.type === "success"
        ? "0 0 8px #22c55e"
        : "0 0 8px #3b82f6",
    whiteSpace: "nowrap",     // keep single line
    overflow: "hidden",
    textOverflow: "ellipsis", // show '...' if text too long
  }}
>
  {latestFeedback ? latestFeedback.text || latestFeedback : "No feedback yet"}
</div>




{/* 🌟 Admin Controls + Timer + Active Player */}
<div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    fontFamily: "'Orbitron', sans-serif",
    maxWidth: "360px",
    margin: "0 auto",
  }}
>
  {/* 🔹 Admin Buttons */}
  {isAdmin && (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "8px",
        width: "100%",
      }}
    >
      {!roundActive && (
        <button
          onClick={startRound}
          style={{
            flex: "1 1 120px",
            padding: "8px 12px",
            fontSize: "14px",
            fontWeight: "600",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            background: "linear-gradient(90deg, #3b82f6, #06b6d4)",
            color: "#fff",
            boxShadow: "0 3px 10px rgba(59,130,246,0.4)",
            transition: "all 0.2s ease",
          }}
        >
          ▶ Start Round
        </button>
      )}
      {roundActive && (
        <button
          onClick={forceEnd}
          style={{
            flex: "1 1 120px",
            padding: "8px 12px",
            fontSize: "14px",
            fontWeight: "600",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            background: "linear-gradient(90deg, #ef4444, #f97316)",
            color: "#fff",
            boxShadow: "0 3px 10px rgba(239,68,68,0.4)",
            transition: "all 0.2s ease",
          }}
        >
          ❌ Force End
        </button>
      )}
    </div>
  )}


   {/* Timer + Active Player — Side by side */}
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "8px",
      flexWrap: "wrap",
    }}
  >
    {/* Timer */}
    {turnTimeLeft > 0 && activePlayer?.name?.trim() === myName.trim() && (
      <div
        style={{
          flex: "1 1 45%",
          textAlign: "center",
          padding: "6px 8px",
          fontSize: "14px",
          fontWeight: "700",
          color: turnTimeLeft <= 5 ? "#b91c1c" : "#1e3a8a",
          background: turnTimeLeft <= 5 ? "#fee2e2" : "#e0e7ff",
          border: `2px solid ${turnTimeLeft <= 5 ? "#ef4444" : "#6366f1"}`,
          borderRadius: "10px",
          boxShadow:
            turnTimeLeft <= 5
              ? "0 0 6px rgba(239,68,68,0.7)"
              : "0 0 5px rgba(99,102,241,0.5)",
          animation: turnTimeLeft <= 5 ? "pulse 1s infinite" : "none",
        }}
      >
        🕒 Your turn: {Math.ceil(turnTimeLeft)}s
      </div>
    )}
 </div>

{/* 🎮 Active Player + Role List — Unified Game Panel */}
<div
  style={{
    maxWidth: "360px",
    margin: "16px auto",
    padding: "12px",
    borderRadius: "12px",
    background: "linear-gradient(145deg, #0f172a, #1e293b)",
    border: "2px solid #38bdf8",
    boxShadow: "0 0 15px rgba(56,189,248,0.5)",
    textAlign: "center",
    fontFamily: "'Orbitron', sans-serif",
  }}
>
  {/* Active Player */}
  {activePlayer && (
    <div
      style={{
        marginBottom: "12px",
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: "15px",
          fontWeight: "900",
          letterSpacing: "1px",
          textTransform: "uppercase",
          color: "#f1f5f9",
          textShadow: "0 0 4px #64748b",
          marginBottom: "8px",
        }}
      >
  <span style={{ fontSize: "24px" }}>🎮</span>Active Player
      </h3>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        {/* Emoji */}
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "22px",
            boxShadow: "0 0 8px #38bdf8",
          }}
        >
          {(() => {
            const role = rolesPublic[activePlayer.name] || "?????";
            switch (role) {
              case "Raja": return "👑";
              case "Rani": return "👸";
              case "PM": return "🏛️";
              case "CM": return "🏢";
              case "D-CM": return "🧑‍💼";
              case "Minister": return "🎩";
              case "MP": return "📜";
              case "MLA": return "🧾";
              case "Police": return "👮";
              case "Thief": return "🕵️";
              default: return "👻";
            }
          })()}
        </div>

        {/* Name + Role */}
        <div style={{ textAlign: "left" }}>
          <div
            style={{
              fontSize: "13px",
              fontWeight: "700",
              color: "#f1f5f9",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {activePlayer.name}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "#94a3b8",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {rolesPublic[activePlayer.name] || "?????"}
          </div>
        </div>
      </div>
    </div>
  )}

  {/* Role List */}
  <div
    style={{
      paddingTop: "8px",
      borderTop: "1px solid rgba(56,189,248,0.3)",
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "8px",
      color: "#f1f5f9",
      fontWeight: "600",
      fontSize: "14px",
    }}
  >
    <RoleList />
  </div>
</div>
</div>


{/* 🌟 Compact Active Player + Role Section - Mobile Friendly */}
<div
  style={{
    marginTop: "10px",
    marginBottom: "14px",
    padding: "10px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
    border: "2px solid #38bdf8",
    boxShadow:
      "0 0 10px rgba(56, 189, 248, 0.6), 0 0 20px rgba(56, 189, 248, 0.4)",
    textAlign: "center",
    color: "white",
    fontFamily: "'Orbitron', sans-serif",
    animation: "activeGlow 2s ease-in-out infinite",
  }}
>
  {/* 🎭 Your Role - Compact Style */}
  {myRole && (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        padding: "8px 10px",
        background: "linear-gradient(135deg, #0f172a, #1e293b)",
        border: "2px solid #38bdf8",
        borderRadius: "12px",
        color: "white",
        fontFamily: "'Orbitron', sans-serif",
        fontSize: "14px",
        fontWeight: "600",
        boxShadow:
          "0 0 10px rgba(56, 189, 248, 0.6), 0 0 20px rgba(56, 189, 248, 0.4)",
        textAlign: "center",
        animation: "roleGlow 2s ease-in-out infinite",
      }}
    >
      <span
        style={{
          fontSize: "14px",
          letterSpacing: "0.5px",
          textTransform: "uppercase",
          color: "#38bdf8",
          textShadow: "0 0 6px #38bdf8",
        }}
      >
        Your Role
      </span>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "16px",
        }}
      >
        {/* Icon */}
        <span
          style={{
            fontSize: "22px",
            filter: "drop-shadow(0 0 6px rgba(255, 255, 255, 0.7))",
          }}
        >
          {(() => {
            switch (myRole) {
              case "Raja":
                return "👑";
              case "Rani":
                return "👸";
              case "PM":
                return "🏛️";
              case "CM":
                return "🏢";
              case "D-CM":
                return "🧑‍💼";
              case "Minister":
                return "🎩";
              case "MP":
                return "📜";
              case "MLA":
                return "🧾";
              case "Police":
                return "👮";
              case "Thief":
                return "🕵️";
              default:
                return "❓";
            }
          })()}
        </span>

        {/* Role Text */}
        <span
          style={{
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            fontWeight: "700",
          }}
        >
          {myRole}
        </span>
      </div>

      {/* Inline keyframes */}
      <style>
        {`
          @keyframes roleGlow {
            0% {
              box-shadow: 0 0 8px rgba(56, 189, 248, 0.6),
                          0 0 18px rgba(56, 189, 248, 0.4);
            }
            50% {
              box-shadow: 0 0 14px rgba(56, 189, 248, 1),
                          0 0 28px rgba(56, 189, 248, 0.7);
            }
            100% {
              box-shadow: 0 0 8px rgba(56, 189, 248, 0.6),
                          0 0 18px rgba(56, 189, 248, 0.4);
            }
          }
        `}
      </style>
    </div>
  )}


{/* 🟠 Target Selection - Centered Horizontal Scroll */}
{activePlayer?.name === myName && (
  <div style={{ marginTop: 14, textAlign: "center" }}>
    <h3
      style={{
        fontSize: "16px",
        fontWeight: "800",
        marginBottom: "8px",
        color: "#e9df12",
        letterSpacing: "0.5px",
        textShadow: "0 0 6px rgba(59,130,246,0.6)",
        fontFamily: "'Orbitron', sans-serif",
      }}
    >
      🎯 Choose Your Target
    </h3>

    <div
      style={{
        display: "flex",
        justifyContent: "center", // Center horizontally
        overflowX: "auto",
        gap: "6px",
        padding: "4px",
        scrollbarWidth: "none", // Firefox
        msOverflowStyle: "none", // IE / Edge
      }}
    >
      {/* Hide scrollbar for Webkit */}
      <style>
        {`
          div::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>

      {players
        .filter((p) => p.name !== myName)
        .map((p) => (
          <button
            key={p.name}
            onClick={() => attemptCatch(p.name)}
            style={{
              flex: "0 0 auto",
              padding: "6px 10px",
              background: "linear-gradient(135deg, #60a5fa, #3b82f6)",
              border: "2px solid #1e40af",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "700",
              fontSize: "12px",
              color: "#fff",
              whiteSpace: "nowrap",
              boxShadow:
                "0 2px 6px rgba(59,130,246,0.4), inset 0 -2px 5px rgba(0,0,0,0.3)",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow =
                "0 4px 10px rgba(59,130,246,0.6), inset 0 -2px 5px rgba(0,0,0,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow =
                "0 2px 6px rgba(59,130,246,0.4), inset 0 -2px 5px rgba(0,0,0,0.3)";
            }}
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


<div className="chat-floating">
  <div className="chat-header">💬 Chat</div>
  <div className="chat-messages">
    {feedbackList.map((f, idx) => (
      <div key={idx} className="chat-message">
        <span className="player-name">{f.player}:</span> {f.text}
      </div>
    ))}
  </div>
  <div className="chat-input">
    <input
      type="text"
      placeholder="Type..."
      value={feedback}
      onChange={(e) => setFeedback(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && sendFeedback()}
    />
    <button onClick={sendFeedback}>➤</button>
  </div>
</div>




{/* 🌟 Ultra-Compact Mobile Scoreboard */}
<div
  style={{
    marginTop: 12,
    padding: "10px",
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
    borderRadius: "12px",
    boxShadow: "0 3px 12px rgba(0,0,0,0.25)",
    textAlign: "center",
    border: "2px solid #38bdf8",
    fontFamily: "'Orbitron', sans-serif",
  }}
>
  <h2
    style={{
      fontSize: "16px",
      fontWeight: "700",
      marginBottom: "8px",
      letterSpacing: "1px",
      color: "#38bdf8",
      textTransform: "uppercase",
      textShadow: "0 0 8px rgba(56,189,248,0.8)",
      display: "inline-block",
      paddingBottom: "2px",
      borderBottom: "2px solid #38bdf8",
    }}
  >
    🏆 Scoreboard
  </h2>

  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "6px",
      marginTop: "6px",
    }}
  >
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
              flexDirection: "column",
              alignItems: "center",
              minWidth: "90px",
              maxWidth: "120px",
              background: isYou
                ? "linear-gradient(135deg, #1e40af, #2563eb)"
                : "linear-gradient(135deg, #1e293b, #334155)",
              padding: "6px 8px",
              borderRadius: "10px",
              color: isYou ? "#fff" : "#e2e8f0",
              fontWeight: isYou ? "700" : "500",
              border: isYou ? "2px solid #facc15" : "1px solid #475569",
              boxShadow: isYou
                ? "0 0 10px rgba(250,204,21,0.6)"
                : "0 0 5px rgba(56,189,248,0.3)",
              textAlign: "center",
              transition: "all 0.2s ease",
            }}
          >
            {/* Name + Position */}
            <span
              style={{
                fontSize: "12px",
                fontWeight: "600",
                wordBreak: "break-word",
                marginBottom: "2px",
              }}
            >
              #{index + 1} {p.name}
            </span>

            {/* Score + Star if You */}
            <span
              style={{
                fontSize: "13px",
                fontWeight: "700",
                display: "inline-flex",
                alignItems: "center",
                gap: "2px",
              }}
            >
              {p.score || 0} {isYou && "⭐"}
            </span>
          </div>
        );
      })}
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
          .map((p, index) => {
            let medal = "";
            if (index === 0) medal = " 🥇";
            else if (index === 1) medal = " 🥈";
            else if (index === 2) medal = " 🥉";

            return (
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
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {index + 1}. {p.name} — {p.score || 0} pts
                <span>{medal}</span>
              </li>
            );
          })}
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
