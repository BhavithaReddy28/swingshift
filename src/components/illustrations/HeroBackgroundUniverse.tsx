"use client";
import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";

// Helper components for the minimal shapes
const MinimalGolfBall = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="45" fill="var(--bg-elevated)" stroke="var(--border-subtle)" strokeWidth="4" />
    <circle cx="35" cy="35" r="4" fill="var(--text-muted)" fillOpacity="0.3" />
    <circle cx="65" cy="35" r="4" fill="var(--text-muted)" fillOpacity="0.3" />
    <circle cx="50" cy="50" r="4" fill="var(--text-muted)" fillOpacity="0.3" />
    <circle cx="35" cy="65" r="4" fill="var(--text-muted)" fillOpacity="0.3" />
    <circle cx="65" cy="65" r="4" fill="var(--text-muted)" fillOpacity="0.3" />
    <circle cx="50" cy="20" r="4" fill="var(--text-muted)" fillOpacity="0.3" />
    <circle cx="50" cy="80" r="4" fill="var(--text-muted)" fillOpacity="0.3" />
    <circle cx="20" cy="50" r="4" fill="var(--text-muted)" fillOpacity="0.3" />
    <circle cx="80" cy="50" r="4" fill="var(--text-muted)" fillOpacity="0.3" />
  </svg>
);

const MinimalTee = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 30 Q50 40 80 30" stroke="var(--text-muted)" strokeWidth="6" strokeLinecap="round" />
    <path d="M45 35 L55 35 L52 80 L48 80 Z" fill="var(--text-muted)" />
  </svg>
);

const MinimalHeart = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M50 88C50 88 15 62 15 35C15 22 25 12 38 12C45 12 50 16 50 16C50 16 55 12 62 12C75 12 85 22 85 35C85 62 50 88 50 88Z"
      fill="currentColor"
    />
  </svg>
);

const MinimalStar = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M50 10 L60 40 L90 50 L60 60 L50 90 L40 60 L10 50 L40 40 Z"
      fill="currentColor"
    />
  </svg>
);

export function HeroBackgroundUniverse() {
  const shouldReduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Mouse tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Springs for smooth parallax
  const smoothOptions = { damping: 50, stiffness: 400, mass: 0.5 };
  const smoothX = useSpring(mouseX, smoothOptions);
  const smoothY = useSpring(mouseY, smoothOptions);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to -1 to 1 based on center of screen
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      mouseX.set(x);
      mouseY.set(y);
    };

    if (!shouldReduceMotion) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY, shouldReduceMotion]);

  // Foreground objects move more than background objects, opposite to mouse
  const fgX = useTransform(smoothX, [-1, 1], [30, -30]);
  const fgY = useTransform(smoothY, [-1, 1], [30, -30]);
  
  const mgX = useTransform(smoothX, [-1, 1], [15, -15]);
  const mgY = useTransform(smoothY, [-1, 1], [15, -15]);

  const bgX = useTransform(smoothX, [-1, 1], [5, -5]);
  const bgY = useTransform(smoothY, [-1, 1], [5, -5]);

  if (!mounted) return null;

  // Reduced object count on mobile
  const particleCount = isMobile ? 15 : 30;
  const objects = [
    // --- FOREGROUND (Around extreme edges) ---
    { id: 1, type: "golf", layer: "fg", size: 48, top: "15%", left: "5%", color: "", duration: 15, delay: 0 },
    { id: 2, type: "heart", layer: "fg", size: 32, top: "25%", left: "85%", color: "text-[#FF5A3D]", duration: 12, delay: 1 },
    { id: 3, type: "star", layer: "fg", size: 40, top: "75%", left: "90%", color: "text-[#B8F52B]", duration: 18, delay: 0.5 },
    { id: 4, type: "tee", layer: "fg", size: 36, top: "80%", left: "10%", color: "", duration: 14, delay: 2 },
    
    // --- MIDDLE (Further in but keeping center clear) ---
    { id: 5, type: "golf", layer: "mg", size: 24, top: "35%", left: "12%", color: "", duration: 20, delay: 1.5 },
    { id: 6, type: "heart", layer: "mg", size: 20, top: "60%", left: "8%", color: "text-[#6C5CE7]", duration: 16, delay: 3 },
    { id: 7, type: "star", layer: "mg", size: 16, top: "15%", left: "75%", color: "text-[#A9B5FF]", duration: 22, delay: 4 },
    { id: 8, type: "golf", layer: "mg", size: 30, top: "85%", left: "70%", color: "", duration: 19, delay: 2.5 },
    { id: 9, type: "tee", layer: "mg", size: 20, top: "45%", left: "88%", color: "", duration: 25, delay: 5 },
  ];

  // We only show middle/foreground objects on mobile if we want to, but we'll trim a few.
  const activeObjects = isMobile ? objects.filter(o => o.layer === 'fg' || o.id === 5 || o.id === 8) : objects;

  const renderShape = (type: string, size: number, color: string) => {
    switch (type) {
      case "golf": return <MinimalGolfBall className={`w-[${size}px] h-[${size}px]`} />;
      case "heart": return <MinimalHeart className={`w-[${size}px] h-[${size}px] ${color}`} />;
      case "tee": return <MinimalTee className={`w-[${size}px] h-[${size}px]`} />;
      case "star": return <MinimalStar className={`w-[${size}px] h-[${size}px] ${color}`} />;
      default: return null;
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      
      {/* 1. ATMOSPHERIC RADIAL GRADIENTS (Base gradient moved to body in globals.css) */}
      <motion.div 
        className="absolute inset-0 opacity-60"
        style={{ x: bgX, y: bgY }}
      >
        {/* Subtle purple glow left/center */}
        <div 
          className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full blur-[120px] mix-blend-screen opacity-30" 
          style={{ background: 'radial-gradient(circle, #6C5CE7 0%, transparent 70%)' }} 
        />
        {/* Coral glow near CTA / bottom right */}
        <div 
          className="absolute top-[40%] right-[10%] w-[50vw] h-[50vw] rounded-full blur-[140px] mix-blend-screen opacity-20" 
          style={{ background: 'radial-gradient(circle, #FF5A3D 0%, transparent 70%)' }} 
        />
        {/* Lime glow right edge */}
        <div 
          className="absolute -top-[10%] -right-[5%] w-[40vw] h-[40vw] rounded-full blur-[100px] mix-blend-screen opacity-15" 
          style={{ background: 'radial-gradient(circle, #B8F52B 0%, transparent 70%)' }} 
        />
        {/* Secondary indigo depth layer */}
        <div 
          className="absolute top-[20%] left-[30%] w-[60vw] h-[60vw] rounded-full blur-[150px] mix-blend-overlay opacity-40" 
          style={{ background: 'radial-gradient(circle, #101329 0%, transparent 80%)' }} 
        />
      </motion.div>

      {/* 2. SUBTLE PARTICLE FIELD (Background Layer) */}
      <motion.div className="absolute inset-0" style={{ x: bgX, y: bgY }}>
        {Array.from({ length: particleCount }).map((_, i) => {
          const size = Math.random() * 3 + 1;
          return (
            <motion.div
              key={`particle-${i}`}
              className="absolute rounded-full bg-white"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: size,
                height: size,
                opacity: Math.random() * 0.3 + 0.1,
              }}
              animate={shouldReduceMotion ? {} : {
                y: [0, -20, 0],
                opacity: [0.1, 0.4, 0.1],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 5,
              }}
            />
          );
        })}
      </motion.div>

      {/* 3. MIDDLE LAYER (Slower parallax) */}
      <motion.div className="absolute inset-0" style={{ x: mgX, y: mgY }}>
        {activeObjects.filter(o => o.layer === 'mg').map((obj) => (
          <motion.div
            key={`mg-${obj.id}`}
            className="absolute opacity-40 mix-blend-screen"
            style={{ top: obj.top, left: obj.left, width: obj.size, height: obj.size }}
            animate={shouldReduceMotion ? {} : {
              y: [0, -15, 0],
              x: [0, 10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: obj.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: obj.delay,
            }}
          >
            {renderShape(obj.type, obj.size, obj.color)}
          </motion.div>
        ))}
      </motion.div>

      {/* 4. FOREGROUND LAYER (Faster parallax, interactive hover) */}
      <motion.div className="absolute inset-0 pointer-events-auto" style={{ x: fgX, y: fgY }}>
        {activeObjects.filter(o => o.layer === 'fg').map((obj) => (
          <motion.div
            key={`fg-${obj.id}`}
            className="absolute opacity-70 cursor-pointer"
            style={{ top: obj.top, left: obj.left, width: obj.size, height: obj.size }}
            animate={shouldReduceMotion ? {} : {
              y: [0, -25, 0],
              rotate: [0, 15, -5, 0]
            }}
            transition={{
              duration: obj.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: obj.delay,
            }}
            whileHover={{
              scale: 1.2,
              filter: "brightness(1.5) drop-shadow(0 0 10px rgba(255,255,255,0.3))",
              opacity: 1
            }}
          >
            {renderShape(obj.type, obj.size, obj.color)}
          </motion.div>
        ))}
      </motion.div>

      {/* DARK VIGNETTE / EDGES */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_#080A18_100%)] opacity-80" />
      
    </div>
  );
}
