import { motion } from "framer-motion";

export default function GameIntro({ onStart }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-700 via-pink-600 to-red-500 text-white">
      <motion.h1
        className="text-5xl font-extrabold mb-6"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        🎭 Catch Me If You Can 🎭
      </motion.h1>

      <motion.p
        className="text-lg mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        A Multiplayer Raja–Rani Challenge 👑
      </motion.p>

      <motion.button
        onClick={onStart}
        className="px-8 py-3 rounded-2xl bg-white text-purple-700 font-bold text-lg shadow-lg hover:scale-105 hover:bg-gray-100 transition"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        🚀 Start Game
      </motion.button>
    </div>
  );
}
