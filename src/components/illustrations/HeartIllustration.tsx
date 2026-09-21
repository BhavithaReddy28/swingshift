"use client";
import { motion, useReducedMotion } from "framer-motion";
import { SVGProps } from "react";

export function HeartIllustration({ className, delay = 0, size = 64, color = "var(--accent-primary)", ...props }: { delay?: number, size?: number, color?: string } & SVGProps<SVGSVGElement>) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      animate={shouldReduceMotion ? {} : { y: [0, -12, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay }}
      {...props as any}
    >
      <path
        d="M50 88C50 88 15 62 15 35C15 22 25 12 38 12C45 12 50 16 50 16C50 16 55 12 62 12C75 12 85 22 85 35C85 62 50 88 50 88Z"
        fill={color}
        fillOpacity={0.9}
        stroke={color}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Glossy highlight */}
      <path d="M28 35 C 28 25, 38 18, 42 18" stroke="white" strokeOpacity={0.4} strokeWidth="4" strokeLinecap="round" fill="none" />
    </motion.svg>
  );
}
