"use client";

import { motion } from "framer-motion";

/**
 * Decorative animated background: soft moving gradient orbs + subtle grid.
 * Pure CSS / Framer Motion — no canvas, lightweight.
 */
export function AnimatedBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* grid */}
      <div className="absolute inset-0 grid-bg" />

      {/* orbs */}
      {/* Primary royal-blue glow */}
      <motion.div
        className="absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full bg-brand-violet/30 blur-[120px]"
        animate={{ x: [0, 80, -40, 0], y: [0, 60, -20, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Subtle yellow spark — opacity intentionally low to feel like a sun glint */}
      <motion.div
        className="absolute top-1/3 -right-32 h-[380px] w-[380px] rounded-full bg-brand-fuchsia/12 blur-[140px]"
        animate={{ x: [0, -60, 30, 0], y: [0, -40, 60, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Sky-blue depth */}
      <motion.div
        className="absolute -bottom-40 left-1/3 h-[460px] w-[460px] rounded-full bg-brand-cyan/18 blur-[140px]"
        animate={{ x: [0, 40, -30, 0], y: [0, -30, 40, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Tiny crimson ember — keeps red in the palette without shouting */}
      <motion.div
        className="absolute top-2/3 left-1/4 h-[200px] w-[200px] rounded-full bg-brand-indigo/10 blur-[120px]"
        animate={{ x: [0, 20, -20, 0], y: [0, 20, -10, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
