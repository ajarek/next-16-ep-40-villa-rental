"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Dopóki nie nastąpi hydracja, renderujemy pusty placeholder (zgodny z SSR)
  // aby uniknąć błędu hydracji (mismatch między serverem a klientem).
  if (!mounted) {
    return (
      <button
        className="relative flex items-center justify-center w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10 cursor-pointer"
        aria-label="Przełącz motyw"
        disabled
      >
        <div className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border border-black/5 dark:border-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 cursor-pointer"
      aria-label="Przełącz motyw"
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === "light" ? (
          <motion.div
            key="light"
            initial={{ y: -10, opacity: 0, rotate: -45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 10, opacity: 0, rotate: 45 }}
            transition={{ duration: 0.2 }}
          >
            <Sun className="w-5 h-5 text-accent" />
          </motion.div>
        ) : (
          <motion.div
            key="dark"
            initial={{ y: -10, opacity: 0, rotate: 45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 10, opacity: 0, rotate: -45 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className="w-5 h-5 text-accent" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
