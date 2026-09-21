"use client";
import { motion, useReducedMotion } from "framer-motion";
import { SVGProps } from "react";

export function MascotIllustration({ className, delay = 0, size = 120, color = "var(--accent-primary)", ...props }: { delay?: number, size?: number, color?: string } & SVGProps<SVGSVGElement>) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      animate={shouldReduceMotion ? {} : { y: [0, -8, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay }}
      {...props as any}
    >
      {/* Shadow */}
      <ellipse cx="60" cy="110" rx="30" ry="5" fill="var(--bg-elevated)" fillOpacity={0.6} />
      
      {/* Body */}
      <rect x="40" y="40" width="40" height="50" rx="20" fill={color} fillOpacity={0.9} />
      
      {/* Face/Visor */}
      <rect x="45" y="45" width="30" height="20" rx="10" fill="var(--bg-card)" />
      
      {/* Eyes */}
      <motion.circle cx="53" cy="55" r="3" fill="var(--accent-secondary)" animate={shouldReduceMotion ? {} : { scaleY: [1, 1, 0.1, 1, 1] }} transition={{ duration: 4, repeat: Infinity, times: [0, 0.9, 0.95, 0.98, 1] }} />
      <motion.circle cx="67" cy="55" r="3" fill="var(--accent-secondary)" animate={shouldReduceMotion ? {} : { scaleY: [1, 1, 0.1, 1, 1] }} transition={{ duration: 4, repeat: Infinity, times: [0, 0.9, 0.95, 0.98, 1] }} />
      
      {/* Golf club being swung */}
      <motion.path 
        d="M 80 70 L 110 30" 
        stroke="var(--border-subtle)" 
        strokeWidth="4" 
        strokeLinecap="round"
        animate={shouldReduceMotion ? {} : { rotate: [0, -10, 0], transformOrigin: "80px 70px" }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <circle cx="110" cy="30" r="6" fill="var(--text-muted)" />
      
      {/* Arms */}
      <path d="M 40 60 Q 25 70, 30 85" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
      <path d="M 80 60 Q 95 60, 80 70" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
      
    </motion.svg>
  );
}
