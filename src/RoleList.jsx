// src/RoleList.jsx
import { useState } from "react";

export default function RoleList() {
  const [showRoles, setShowRoles] = useState(false);

  const roles = [
    { name: "Raja->", points: 10000 },
    { name: "Rani->", points: 9000 },
    { name: "PM->", points: 8000 },
    { name: "CM->", points: 7000 },
    { name: "D-CM->", points: 6000 },
    { name: "Minister->", points: 5000 },
    { name: "MP->", points: 3500 },
    { name: "MLA->", points: 2000 },
    { name: "Police->", points: 1000 },
    { name: "Thief->", points: 0 },
  ];

  const getEmoji = (role) => {
    switch (role) {
      case "Raja->":
        return "👑";
      case "Rani->":
        return "👸";
      case "PM->":
        return "🏛️";
      case "CM->":
        return "🏢";
      case "D-CM->":
        return "🧑‍💼";
      case "Minister->":
        return "🎩";
      case "MP->":
        return "📜";
      case "MLA->":
        return "🧾";
      case "Police->":
        return "👮";
      case "Thief->":
        return "🕵️";
      default:
        return "❓";
    }
  };

  return (
    <div className="text-center mt-6 md:mt-10">
      {/* 🌟 Toggle Button */}
      <button
  onClick={() => setShowRoles(!showRoles)}
  className="px-6 py-2 rounded-xl 
             bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500
             text-white font-bold text-sm md:text-base
             shadow-[0_0_15px_rgba(147,51,234,0.8),0_0_30px_rgba(236,72,153,0.6)]
             hover:scale-110 hover:shadow-[0_0_25px_rgba(236,72,153,0.9)]
             transition-all duration-300 tracking-wide"
>
  {showRoles ? "✖ Hide Roles" : "🎭 View Roles"}
</button>

      {/* 🎮 Role Panel */}
      {showRoles && (
        <div
          className="mt-5 mx-auto max-w-2xl p-4 rounded-2xl 
                     bg-[#0b0f1a]/80 backdrop-blur-sm 
                     border border-purple-500/50 
                     shadow-[0_0_20px_rgba(147,51,234,0.4),0_0_40px_rgba(236,72,153,0.3)]"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 justify-items-center">
            {roles.map((role, index) => (
              <div
                key={role.name}
                className={`relative px-3 py-2 rounded-xl 
                           bg-gradient-to-br from-[#1e2230] to-[#0b0f1a]
                           border ${
                             index % 2 === 0
                               ? "border-pink-400/60"
                               : "border-purple-400/60"
                           }
                           shadow-[0_0_8px_rgba(236,72,153,0.6)]
                           text-white flex items-center gap-1 w-full max-w-[150px]
                           hover:scale-105 hover:shadow-[0_0_15px_rgba(236,72,153,0.9)]
                           transition-transform duration-300`}
              >
                <span className="text-base md:text-xl">{getEmoji(role.name)}</span>
                <span className="text-[12px] md:text-sm font-bold truncate">
                  {role.name}
                </span>
                <span className="ml-auto text-yellow-300 text-[11px] md:text-sm font-semibold">
                  {role.points}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
