// src/RajaRaniGame.jsx
import { useContext, useEffect, useState } from "react";
import { SocketContext } from "./SocketContext.jsx";
import { useBlinkingEmoji } from "./utils/uniqueEmoji.js";

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

  useEffect(() => {
   if (!socket) return;

    const onConnect = () => {
      console.log("✅ Connected to backend", socket.id);
      setSocketConnected(true);
    };
    const onConnectError = (err) => {
      console.error("❌ Connection error:", err);
      setSocketConnected(false);
    };

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
    };
  }, []);
   
 useEffect(() => {
    if (!socket) return;

  const handleState = (s) => {
    setPlayers(s.players || []);
    setRolesPublic(s.rolesPublic || {});
    setActivePlayer(s.activePlayer || null);
    setHistory(s.history || []);
    setRound(s.round || 0);
    setRoundActive(!!s.roundActive);

    if (added) {
      socket.emit("requestRole", myName);
    }
  };

  const handleYourRole = ({ role }) => setMyRole(role);
  const handleRoundSummary = ({ round: r, summary }) => setSummary({ round: r, summary });
  const handleErrorMsg = (msg) => {
    setError(msg);
    setTimeout(() => setError(""), 3500);
  };

  socket.on("state", handleState);
  socket.on("yourRole", handleYourRole);
  socket.on("roundSummary", handleRoundSummary);
  socket.on("errorMsg", handleErrorMsg);

  return () => {
    socket.off("state", handleState);
    socket.off("yourRole", handleYourRole);
    socket.off("roundSummary", handleRoundSummary);
    socket.off("errorMsg", handleErrorMsg);
  };
}, [added, myName]);

  useBlinkingEmoji(
  myName,
  activePlayer?.name === myName
    ? "yourTurn"
    : activePlayer
    ? "othersTurn"
    : "waiting"
);
  const addMe = () => {
  const name = myName.trim();
  if (!name) return setError("Enter a valid name");

  if (!socket.connected) {
    return setError("Socket not connected yet. Try again in a moment.");
  }

  socket.emit("addPlayer", name, (res) => {
    if (res?.success) {
      setAdded(true);
      setError(""); // clear any previous error
    } else {
      setError(res?.error || "Failed to add");
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
    <div style={{ padding: 18, maxWidth: 900, margin: "auto", fontFamily: "Arial, sans-serif" }}>
      {/* 🔙 Back button added here */}
      <div style={{ marginBottom: 12 }}>
        <button
         onClick={() => {
        if (window.confirm("Are you sure you want to exit the game?")) {
          onExit();
         }
        }}
          style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              background: "#f4f4f4",
              cursor: "pointer",
             }}
>
         ⬅ Back to Home
       </button>

      </div>

      <h1>🎭 Raja Rani Multiplayer (10 Roles)</h1>

      {!added ? (
        <div style={{ marginBottom: 12 }}>
        <input
          placeholder="Enter your name"
          value={myName}
          onChange={(e) => setMyName(e.target.value)}
         />
        <button
          onClick={addMe}
          disabled={added || !myName.trim() || !socketConnected}
        >
          {added ? "Joined" : socketConnected ? "Join Game" : "Connecting..."}
        </button>
      </div>
      ) : (
        <div style={{ marginBottom: 12 }}>
          <strong>Logged in as:</strong> {myName}
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <strong>Players ({players.length}/10):</strong>{" "}
        {players.map((p) => p.name).join(", ")}
      </div>

      <div style={{ marginBottom: 12 }}>
        <button
          onClick={startRound}
          disabled={!added || players.length !== 10 || roundActive}
        >
          Start Round
        </button>
        <button onClick={forceEnd} style={{ marginLeft: 8 }}>
          Force End
        </button>
        {error && <span style={{ color: "red", marginLeft: 12 }}>{error}</span>}
      </div>

      <div style={{ border: "1px solid #ddd", padding: 12, marginBottom: 12 }}>
        <div>
          <strong>Round:</strong> {round} {roundActive ? "(active)" : "(waiting)"}
        </div>

        <div style={{ marginTop: 8 }}>
          <strong>Public Player List:</strong>
          <ol>
            {players.map((p) => (
              <li key={p.name}>
                {p.name} —{" "}
                {rolesPublic[p.name] || "?????"}{" "}
                {p.inactive ? "✅ Done" : ""}
              </li>
            ))}
          </ol>
        </div>

        <div style={{ marginTop: 8 }}>
          {activePlayer ? (
            <div>
              <strong>Active:</strong> {activePlayer.name}{" "}
              {activePlayer.name === myName ? "(Your turn)" : ""}
            </div>
          ) : (
            <div>
              <strong>No active player</strong>
            </div>
          )}
        </div>
      </div>

      {myRole && (
        <div style={{ marginBottom: 12 }}>
          <strong>Your role:</strong> {myRole}
        </div>
      )}

      {activePlayer?.name === myName && (
        <div style={{ marginBottom: 12 }}>
          <strong>Choose a target:</strong>
          <br />
          {players
            .filter((p) => p.name !== myName)
            .map((p) => (
              <button
                key={p.name}
                onClick={() => attemptCatch(p.name)}
                style={{ margin: 4 }}
              >
                Catch {p.name}
              </button>
            ))}
        </div>
      )}

      {!(activePlayer?.name === myName) && (
        <div style={{ marginBottom: 12 }}>
          <em>Waiting for {activePlayer?.name || "round start"}...</em>
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <h3>Scoreboard</h3>
        <ol>
          {players
            .slice()
            .sort((a, b) => (b.score || 0) - (a.score || 0))
            .map((p) => (
              <li key={p.name}>
                {p.name} — {p.score || 0} pts {p.inactive ? "✅" : ""}
              </li>
            ))}
        </ol>
      </div>

      <div style={{ marginBottom: 12 }}>
        <h3>History</h3>
        <div
          style={{
            maxHeight: 200,
            overflow: "auto",
            background: "#fafafa",
            padding: 8,
            border: "1px solid #eee",
          }}
        >
          {history.slice().reverse().map((h, i) => (
            <div key={i} style={{ marginBottom: 6 }}>{h}</div>
          ))}
        </div>
      </div>

      {summary && (
        <div
          style={{
            position: "fixed",
            left: "50%",
            top: "20%",
            transform: "translateX(-50%)",
            background: "#fff",
            padding: 20,
            border: "2px solid #333",
            zIndex: 9999,
            maxWidth: "90%",
          }}
        >
          <h3>Round {summary.round} Summary</h3>
          <ol>
            {summary.summary.map((s) => (
              <li key={s.name}>
                {s.name} — {s.role} — {s.score} pts
              </li>
            ))}
          </ol>
          <button onClick={() => setSummary(null)}>Close</button>
        </div>
      )}
    </div>
  );
}
