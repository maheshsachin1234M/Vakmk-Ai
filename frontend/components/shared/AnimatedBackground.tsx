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
      <motion.div
        className="absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full bg-brand-violet/30 blur-[120px]"
        animate={{ x: [0, 80, -40, 0], y: [0, 60, -20, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -right-32 h-[420px] w-[420px] rounded-full bg-brand-fuchsia/25 blur-[120px]"
        animate={{ x: [0, -60, 30, 0], y: [0, -40, 60, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 left-1/3 h-[460px] w-[460px] rounded-full bg-brand-cyan/20 blur-[140px]"
        animate={{ x: [0, 40, -30, 0], y: [0, -30, 40, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
