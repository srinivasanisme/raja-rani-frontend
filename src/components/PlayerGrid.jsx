import React from "react";
import PlayerCard from "./PlayerCard";

export default function PlayerGrid({ players, activePlayer, pointsMap }) {
  return (
    <div className="grid grid-cols-5 gap-4 p-4">
      {players.map((p) => (
        <PlayerCard
          key={p.name}
          player={p}
          isActive={activePlayer?.name === p.name}
          pointsAdded={pointsMap[p.name] || 0}
        />
      ))}
    </div>
  );
}
