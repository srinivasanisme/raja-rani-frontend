import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Map roles to emojis
const ROLE_EMOJI = {
  Raja: "👑",
  Rani: "👸",
  PM: "🏛️",
  CM: "🏢",
  "D-CM": "📜",
  Minister: "🎩",
  MP: "🗳️",
  MLA: "🧑‍⚖️",
  Police: "👮",
  Thief: "🦹",
};

export default function PlayerCard({ player, isActive, pointsAdded }) {
  const [showPoints, setShowPoints] = useState(0);

  // Trigger points animation whenever pointsAdded changes
  useEffect(() => {
    if (pointsAdded > 0) {
      setShowPoints(pointsAdded);
      const timer = setTimeout(() => setShowPoints(0), 1200);
      return () => clearTimeout(timer);
    }
  }, [pointsAdded]);

  return (
    <div
      className={`relative p-4 rounded-xl border ${
        isActive ? "border-yellow-400 shadow-lg animate-pulse" : "border-gray-300"
      } bg-white ${
        player.inactive ? "opacity-50 grayscale" : "opacity-100"
      } flex flex-col items-center justify-center text-center`}
      style={{ minHeight: 120 }}
    >
      {/* Role Emoji */}
      <div style={{ fontSize: 32, marginBottom: 6 }}>
        {player.role ? ROLE_EMOJI[player.role] : "❓"}
      </div>

      {/* Name */}
      <div style={{ fontWeight: "bold" }}>{player.name}</div>

      {/* Score */}
      <div>{player.score || 0} pts</div>

      {/* Points added animation */}
      <AnimatePresence>
        {showPoints > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: -20 }}
            exit={{ opacity: 0, y: -30 }}
            style={{
              position: "absolute",
              top: 0,
              fontWeight: "bold",
              color: "green",
            }}
          >
            +{showPoints}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
