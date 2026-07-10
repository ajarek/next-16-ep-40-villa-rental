"use client";

import React, { useState } from "react";
import { Home, Search, Calendar, Heart, User } from "lucide-react";
import { motion } from "framer-motion";

export default function BottomNav() {
  const [activeTab, setActiveTab] = useState("home");

  const navItems = [
    { id: "home", label: "Strona główna", icon: Home },
    { id: "search", label: "Szukaj", icon: Search },
    { id: "bookings", label: "Rezerwacje", icon: Calendar },
    { id: "favorites", label: "Ulubione", icon: Heart },
    { id: "profile", label: "Profil", icon: User },
  ];

  return (
    <div className="w-full bg-card/90 dark:bg-card/95 border-t border-border/80 py-2 px-4 backdrop-blur-md flex items-center justify-around z-40">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className="flex flex-col items-center gap-1 py-1 px-3 relative cursor-pointer group"
          >
            {/* Tło dla aktywnej zakładki (mikro-animacja) */}
            {isActive && (
              <motion.span
                layoutId="activeTabBackground"
                className="absolute inset-0 bg-primary/5 dark:bg-accent/10 rounded-2xl -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}

            <Icon
              className={`w-5 h-5 transition-colors duration-200 ${
                isActive
                  ? "text-primary dark:text-primary-foreground font-semibold"
                  : "text-muted group-hover:text-foreground"
              }`}
            />
            <span
              className={`text-[10px] tracking-wide transition-colors duration-200 ${
                isActive
                  ? "text-primary dark:text-primary-foreground font-semibold"
                  : "text-muted/80 group-hover:text-foreground"
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
