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
    <div className="text-center mt-10">
      {/* 🌟 Neon Arcade Button */}
      <button
        onClick={() => setShowRoles(!showRoles)}
        className="w-fit px-8 py-3 rounded-3xl 
                   bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400
                   text-white font-extrabold text-lg
                   shadow-[0_0_20px_rgba(255,0,255,0.7),0_0_40px_rgba(255,0,255,0.5)]
                   hover:scale-110 hover:shadow-[0_0_30px_rgba(255,0,255,0.9),0_0_50px_rgba(255,0,255,0.7)]
                   transition-all duration-300 animate-pulse"
      >
        {showRoles ? "Hide Roles" : "View Roles"}
      </button>

      {/* 🎮 Role Cards Grid */}
      {showRoles && (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-6 justify-items-center">
          {roles.map((role, index) => (
            <div
              key={role.name}
              className={`bg-gradient-to-br ${
                index % 2 === 0
                  ? "from-blue-500 via-purple-500 to-pink-500"
                  : "from-green-400 via-yellow-400 to-orange-400"
              } text-white p-5 rounded-2xl shadow-2xl 
                 shadow-pink-400/50 flex flex-col items-center 
                 w-36 transform hover:scale-110 transition-transform duration-300`}
            >
              {/* ✨ Emoji Bounce */}
              <span className="text-5xl animate-bounce">{getEmoji(role.name)}</span>
              {/* 🏷️ Role Name */}
              <span className="font-extrabold mt-3 text-lg drop-shadow-lg">{role.name}</span>
              {/* 💰 Points */}
              <span className="text-yellow-300 font-bold mt-1 text-lg">{role.points}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
