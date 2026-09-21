"use client";
import { motion, useReducedMotion } from "framer-motion";
import { SVGProps } from "react";

export function TrophyIllustration({ className, delay = 0, size = 64, color = "var(--accent-secondary)", ...props }: { delay?: number, size?: number, color?: string } & SVGProps<SVGSVGElement>) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      animate={shouldReduceMotion ? {} : { y: [0, -15, 0], rotate: [0, -3, 3, 0] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay }}
      {...props as any}
    >
      {/* Base */}
      <path d="M 35 85 L 65 85 L 60 95 L 40 95 Z" fill="var(--bg-elevated)" stroke="var(--border-subtle)" strokeWidth="2" />
      <path d="M 45 75 L 55 75 L 55 85 L 45 85 Z" fill="var(--bg-elevated)" stroke="var(--border-subtle)" strokeWidth="2" />
      
      {/* Cup */}
      <path d="M 25 35 Q 25 75, 50 75 Q 75 75, 75 35 Z" fill={color} fillOpacity={0.9} stroke={color} strokeWidth="2" />
      <path d="M 25 35 Q 50 45, 75 35 Q 50 25, 25 35" fill="var(--accent-secondary-glow)" fillOpacity={0.6} />
      
      {/* Handles */}
      <path d="M 25 45 C 10 45, 10 60, 30 65" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
      <path d="M 75 45 C 90 45, 90 60, 70 65" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
      
      {/* Star sparkle */}
      <path d="M 70 15 L 75 25 L 85 30 L 75 35 L 70 45 L 65 35 L 55 30 L 65 25 Z" fill="var(--text-primary)" fillOpacity={0.8} />
    </motion.svg>
  );
}
