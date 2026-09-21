"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

export function ConfettiBackground({ count = 20, className = "" }: { count?: number, className?: string }) {
  const shouldReduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const shapes = Array.from({ length: count }).map((_, i) => {
    const isCoin = i % 3 === 0;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const size = Math.random() * 10 + 5;
    const delay = Math.random() * 5;
    const duration = Math.random() * 10 + 10;

    return (
      <motion.div
        key={i}
        className="absolute"
        style={{
          left: `${x}%`,
          top: `${y}%`,
          width: size,
          height: size,
          opacity: 0.15,
        }}
        animate={shouldReduceMotion ? {} : {
          y: ["-10%", "10%", "-10%"],
          x: ["-5%", "5%", "-5%"],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
          delay,
        }}
      >
        {isCoin ? (
          <div className="w-full h-full rounded-full bg-secondary" />
        ) : (
          <div className="w-full h-full bg-primary" style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }} />
        )}
      </motion.div>
    );
  });

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {shapes}
    </div>
  );
}
