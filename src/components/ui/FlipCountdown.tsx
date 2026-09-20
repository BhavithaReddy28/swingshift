"use client";

import { useState, useEffect } from "react";

interface FlipCountdownProps {
  targetDate?: string;
  size?: "sm" | "lg";
}

export function FlipCountdown({ targetDate, size = "lg" }: FlipCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 10,
    hours: 14,
    minutes: 32,
    seconds: 45,
  });

  useEffect(() => {
    // Calculate target (1st of next month if no date provided)
    const calculateTarget = () => {
      if (targetDate) return new Date(targetDate).getTime();
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();
    };

    const targetTime = calculateTarget();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, targetTime - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const pad = (n: number) => String(n).padStart(2, "0");

  const isSmall = size === "sm";

  return (
    <div className={`flex items-center gap-2 ${isSmall ? "scale-90" : ""}`}>
      {/* Days */}
      <div className="flex flex-col items-center">
        <div className="flip-tile px-3 py-2 font-display font-extrabold text-vermillion text-xl sm:text-3xl tracking-wider">
          {pad(timeLeft.days)}
        </div>
        <span className="text-[10px] text-periwinkle-muted uppercase font-bold tracking-wider mt-1">Days</span>
      </div>

      <span className="text-vermillion font-bold text-xl -mt-4">:</span>

      {/* Hours */}
      <div className="flex flex-col items-center">
        <div className="flip-tile px-3 py-2 font-display font-extrabold text-vermillion text-xl sm:text-3xl tracking-wider">
          {pad(timeLeft.hours)}
        </div>
        <span className="text-[10px] text-periwinkle-muted uppercase font-bold tracking-wider mt-1">Hours</span>
      </div>

      <span className="text-vermillion font-bold text-xl -mt-4">:</span>

      {/* Minutes */}
      <div className="flex flex-col items-center">
        <div className="flip-tile px-3 py-2 font-display font-extrabold text-vermillion text-xl sm:text-3xl tracking-wider">
          {pad(timeLeft.minutes)}
        </div>
        <span className="text-[10px] text-periwinkle-muted uppercase font-bold tracking-wider mt-1">Mins</span>
      </div>

      <span className="text-vermillion font-bold text-xl -mt-4">:</span>

      {/* Seconds */}
      <div className="flex flex-col items-center">
        <div className="flip-tile px-3 py-2 font-display font-extrabold text-chartreuse text-xl sm:text-3xl tracking-wider animate-pulse">
          {pad(timeLeft.seconds)}
        </div>
        <span className="text-[10px] text-periwinkle-muted uppercase font-bold tracking-wider mt-1">Secs</span>
      </div>
    </div>
  );
}
