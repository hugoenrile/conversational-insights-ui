"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface Orb {
  id: number;
  width: number;
  height: number;
  left: number;
  top: number;
  animateX: number;
  animateY: number;
  duration: number;
}

export function AnimatedBackground() {
  const [orbs, setOrbs] = useState<Orb[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const generateOrbs = (): Orb[] => {
      const seeds = [0.23, 0.71, 0.13];
      return seeds.map((seed, i) => ({
        id: i,
        width: seed * 200 + 150,
        height: (seeds[(i + 1) % seeds.length] * 200) + 150,
        left: (seeds[(i + 2) % seeds.length] * 80) + 10,
        top: (seeds[(i + 1) % seeds.length] * 80) + 10,
        animateX: seed * 30 - 15,
        animateY: (seeds[(i + 1) % seeds.length] * 30) - 15,
        duration: seed * 15 + 20,
      }));
    };

    setOrbs(generateOrbs());
    setMounted(true);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 dark:from-blue-950/10 dark:to-purple-950/10" />
      
      {mounted && orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className="absolute rounded-full bg-gradient-to-r from-blue-400/10 to-purple-400/10 dark:from-blue-600/5 dark:to-purple-600/5"
          style={{
            width: orb.width,
            height: orb.height,
            left: `${orb.left}%`,
            top: `${orb.top}%`,
          }}
          initial={{ opacity: 0 }}
          animate={{
            x: [0, orb.animateX],
            y: [0, orb.animateY],
            scale: [1, 1.1, 1],
            opacity: [0, 0.3, 0.6, 0.3],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: "linear",
            times: [0, 0.5, 1],
          }}
        />
      ))}
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.02),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.01),transparent_50%)]" />
    </div>
  );
}
