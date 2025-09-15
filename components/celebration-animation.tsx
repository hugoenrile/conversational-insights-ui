"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface CelebrationProps {
  trigger: boolean;
  onComplete?: () => void;
}

export function CelebrationAnimation({ trigger, onComplete }: CelebrationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.cos((i * Math.PI * 2) / 12) * 100,
    y: Math.sin((i * Math.PI * 2) / 12) * 100,
    delay: i * 0.05,
    emoji: ["🎉", "✨", "⭐", "💫", "🌟"][i % 5],
  }));

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute text-2xl"
              initial={{ 
                x: 0, 
                y: 0, 
                scale: 0, 
                rotate: 0,
                opacity: 0 
              }}
              animate={{
                x: particle.x,
                y: particle.y,
                scale: [0, 1.2, 0],
                rotate: [0, 180, 360],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.5,
                delay: particle.delay,
                ease: "easeOut",
              }}
            >
              {particle.emoji}
            </motion.div>
          ))}
          
          <motion.div
            className="bg-green-500 text-white px-6 py-3 rounded-full shadow-lg"
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.3 }}
          >
            <motion.span
              className="flex items-center gap-2 font-medium"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              ✅ Success!
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useSuccessAnimation() {
  const [shouldCelebrate, setShouldCelebrate] = useState(false);

  const celebrate = () => setShouldCelebrate(true);
  const reset = () => setShouldCelebrate(false);

  return { shouldCelebrate, celebrate, reset };
}
