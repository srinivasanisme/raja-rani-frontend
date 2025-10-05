import React from "react";
import { motion } from "framer-motion";

export default function CatchAnimation({ fromPos, toPos, success }) {
  if (!fromPos || !toPos) return null;

  const lineColor = success ? "green" : "red";

  return (
    <motion.div
      initial={{ x: fromPos.x, y: fromPos.y, opacity: 1 }}
      animate={{ x: toPos.x, y: toPos.y }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      style={{
        position: "absolute",
        width: 20,
        height: 20,
        borderRadius: "50%",
        backgroundColor: lineColor,
        zIndex: 50,
      }}
    />
  );
}
