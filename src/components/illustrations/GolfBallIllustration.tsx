"use client";
import { motion, useReducedMotion } from "framer-motion";
import { SVGProps } from "react";

export function GolfBallIllustration({ className, delay = 0, size = 64, color = "var(--text-primary)", ...props }: { delay?: number, size?: number, color?: string } & SVGProps<SVGSVGElement>) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      animate={shouldReduceMotion ? {} : { y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay }}
      {...props as any}
    >
      <circle cx="50" cy="50" r="40" fill={color} fillOpacity={0.9} stroke="var(--border-subtle)" strokeWidth="2" />
      {/* Dimples */}
      <circle cx="35" cy="35" r="4" fill="var(--bg-elevated)" fillOpacity={0.3} />
      <circle cx="50" cy="30" r="4" fill="var(--bg-elevated)" fillOpacity={0.3} />
      <circle cx="65" cy="35" r="4" fill="var(--bg-elevated)" fillOpacity={0.3} />
      <circle cx="30" cy="50" r="4" fill="var(--bg-elevated)" fillOpacity={0.3} />
      <circle cx="45" cy="45" r="4" fill="var(--bg-elevated)" fillOpacity={0.3} />
      <circle cx="60" cy="48" r="4" fill="var(--bg-elevated)" fillOpacity={0.3} />
      <circle cx="75" cy="50" r="4" fill="var(--bg-elevated)" fillOpacity={0.3} />
      <circle cx="40" cy="65" r="4" fill="var(--bg-elevated)" fillOpacity={0.3} />
      <circle cx="55" cy="62" r="4" fill="var(--bg-elevated)" fillOpacity={0.3} />
      
      {/* Motion lines */}
      <path d="M 20 80 Q 5 95, -10 80" stroke="var(--border-subtle)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 40 85 Q 25 105, 5 95" stroke="var(--border-subtle)" strokeWidth="3" fill="none" strokeLinecap="round" />
    </motion.svg>
  );
}
