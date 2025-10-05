import React, { useEffect } from "react";

export default function GameIntro({ onStart }) {
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Enter") onStart();
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [onStart]);

  return (
    <div className="flex items-center justify-center w-screen h-screen bg-black text-white">
      <div className="text-center px-4">
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold mb-8 leading-tight">
          🎮 CATCH ME IF YOU CAN 🎮
        </h1>
        <p className="text-xl sm:text-2xl md:text-3xl mb-12 text-gray-300">
          A Multiplayer Raja–Rani Challenge
        </p>
        <button
          onClick={onStart}
          className="px-14 py-5 rounded-3xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-2xl transition-all"
        >
          🚀 START GAME
        </button>
        <p className="mt-6 text-gray-500 text-lg">
          👉 Press <span className="font-bold text-white">Enter</span> to start
        </p>
      </div>
    </div>
  );
}
