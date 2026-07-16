"use client"

import React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, Search, Phone, MessageSquareText, User } from "lucide-react"
import { motion } from "framer-motion"

export default function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { id: "home", label: "Główna", icon: Home, href: "/" },
    { id: "search", label: "Szukaj", icon: Search, href: "/villas" },
    { id: "contact", label: "Kontakt", icon: Phone, href: "/contact" },
    {
      id: "testimonials",
      label: "Opinie",
      icon: MessageSquareText,
      href: "/testimonials",
    },
    { id: "profile", label: "Profil", icon: User, href: "/profile" },
  ]

  return (
    <nav className='w-full bg-card/90 dark:bg-card/95 border-t border-border/80 py-2 px-4 backdrop-blur-md flex items-center justify-around z-40'>
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link
            key={item.id}
            href={item.href}
            className='flex flex-col items-center gap-1 py-1 px-3 relative cursor-pointer group'
          >
            {isActive && (
              <motion.span
                layoutId='activeTabBackground'
                className='absolute inset-0 bg-primary/10 dark:bg-primary/15 rounded-2xl -z-10'
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}

            <Icon
              className={`w-5 h-5 transition-colors duration-200 ${
                isActive
                  ? "text-primary dark:text-white font-semibold"
                  : "text-foreground/50 dark:text-foreground/50 group-hover:text-foreground"
              }`}
            />
            <span
              className={`text-[10px] tracking-wide transition-colors duration-200 ${
                isActive
                  ? "text-primary dark:text-white font-semibold"
                  : "text-foreground/50 dark:text-foreground/50 group-hover:text-foreground"
              }`}
            >
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
