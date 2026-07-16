"use client"

import React, { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Home,
  Search,
  Phone,
  MessageSquareText,
  User,
  Building2,
  LogOut,
  LogIn,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import type { MobileMenuProps } from "@/types/components"

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { user, initialized, logout } = useAuth()
  const router = useRouter()

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
    { name: "Kontakt", icon: Phone, href: "/contact" },
    { name: "Opinie", icon: MessageSquareText, href: "/testimonials" },
    { name: "Profil", icon: User, href: "/profile", protected: true },
  ]

  const handleProtectedNav = (href: string) => {
    if (!user) {
      router.push(`/auth?redirect=${encodeURIComponent(href)}`)
      onClose()
      return
    }
    router.push(href)
    onClose()
  }

  const handleLogout = async () => {
    await logout()
    router.push("/")
    onClose()
  }

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
            className='absolute top-0 bottom-0 left-0 w-4/5 max-w-75 bg-card text-card-foreground z-50 shadow-2xl flex flex-col p-6'
          >
            {/* Header Menu */}
            <div className='flex items-center justify-between mb-6'>
              <span className='font-semibold text-lg tracking-wider text-primary '>
                WILLE KOŁOBRZEG
              </span>
              <button
                onClick={onClose}
                className='p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer'
                aria-label='Zamknij menu'
              >
                <X className='w-6 h-6 text-foreground' />
              </button>
            </div>

            {/* Sekcja użytkownika */}
            {initialized && (
              <div className='mb-5 px-4 py-3 rounded-2xl bg-black/3 dark:bg-white/5 border border-border/40'>
                {user ? (
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center shrink-0'>
                      <span className='text-sm font-bold text-foreground'>
                        {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-xs font-semibold text-foreground truncate'>
                        {user.displayName || "Użytkownik"}
                      </p>
                      <p className='text-[10px] text-muted dark:text-muted-foreground/70 truncate'>
                        {user.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      router.push("/auth")
                      onClose()
                    }}
                    className='w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer'
                  >
                    <LogIn className='w-4 h-4' />
                    Zaloguj się
                  </button>
                )}
              </div>
            )}

            {/* Elementy Menu */}
            <nav className='flex-1 space-y-2'>
              {menuItems.map((item, idx) => {
                const Icon = item.icon
                const isProtected = item.protected && !user

                const handleClick = () => {
                  if (item.href === "#") {
                    onClose()
                    return
                  }
                  if (isProtected) {
                    handleProtectedNav(item.href)
                    return
                  }
                  router.push(item.href)
                  onClose()
                }

                return (
                  <button
                    key={idx}
                    onClick={handleClick}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                      item.active
                        ? "bg-primary text-primary-foreground dark:bg-accent dark:text-accent-foreground font-medium shadow-md shadow-primary/10"
                        : "hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
                    }`}
                  >
                    <Icon className='w-5 h-5' />
                    <span>{item.name}</span>
                  </button>
                )
              })}
            </nav>

            {/* Wylogowanie (tylko dla zalogowanych) */}
            {user && (
              <div className='pt-4 mb-3'>
                <button
                  onClick={handleLogout}
                  className='w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer'
                >
                  <LogOut className='w-5 h-5' />
                  Wyloguj się
                </button>
              </div>
            )}

            {/* Stopka Menu */}
            <div className='pt-4 border-t border-border'>
              <p className='text-xs text-muted/60 dark:text-muted-foreground/50 text-center'>
                © 2026 Ville Kołobrzeg. Wszelkie prawa zastrzeżone.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
