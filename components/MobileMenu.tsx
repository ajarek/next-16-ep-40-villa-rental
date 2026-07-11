"use client"

import React, { useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Home,
  Search,
  Calendar,
  Heart,
  User,
  Settings,
  HelpCircle,
  Building2,
} from "lucide-react"

type MobileMenuProps = {
  isOpen: boolean
  onClose: () => void
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  // Blokowanie przewijania strony pod menu, gdy jest otwarte
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const menuItems = [
    { name: "Strona główna", icon: Home, href: "/", active: true },
    { name: "Wille", icon: Building2, href: "/villas" },
    { name: "Szukaj", icon: Search, href: "/villas" },
    { name: "Moje rezerwacje", icon: Calendar, href: "#" },
    { name: "Ulubione", icon: Heart, href: "#" },
    { name: "Profil", icon: User, href: "#" },
    { name: "Ustawienia", icon: Settings, href: "#" },
    { name: "Pomoc i kontakt", icon: HelpCircle, href: "#" },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Tło przyciemniające (Overlay) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className='absolute inset-0 bg-black/50 z-50 backdrop-blur-xs cursor-pointer'
          />

          {/* Panel Menu wysuwany z lewej strony */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className='absolute top-0 bottom-0 left-0 w-4/5 max-w-[300px] bg-card text-card-foreground z-50 shadow-2xl flex flex-col p-6'
          >
            {/* Header Menu */}
            <div className='flex items-center justify-between mb-8'>
              <span className='font-semibold text-lg tracking-wider text-primary dark:text-accent'>
                WILLE KOŁOBRZEG
              </span>
              <button
                onClick={onClose}
                className='p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer'
                aria-label='Zamknij menu'
              >
                <X className='w-6 h-6 text-muted' />
              </button>
            </div>

            {/* Elementy Menu */}
            <nav className='flex-1 space-y-2'>
              {menuItems.map((item, idx) => {
                const Icon = item.icon

                if (item.href === "#") {
                  return (
                    <button
                      key={idx}
                      onClick={onClose}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                        item.active
                          ? "bg-primary text-primary-foreground dark:bg-accent dark:text-accent-foreground font-medium shadow-md shadow-primary/10"
                          : "hover:bg-black/5 dark:hover:bg-white/5 text-muted hover:text-foreground"
                      }`}
                    >
                      <Icon className='w-5 h-5' />
                      <span>{item.name}</span>
                    </button>
                  )
                }

                return (
                  <Link
                    key={idx}
                    href={item.href}
                    onClick={onClose}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                      item.active
                        ? "bg-primary text-primary-foreground dark:bg-accent dark:text-accent-foreground font-medium shadow-md shadow-primary/10"
                        : "hover:bg-black/5 dark:hover:bg-white/5 text-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className='w-5 h-5' />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Stopka Menu */}
            <div className='pt-6 border-t border-border mt-auto'>
              <p className='text-xs text-muted/60 text-center'>
                © 2026 Ville Kołobrzeg. Wszelkie prawa zastrzeżone.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
