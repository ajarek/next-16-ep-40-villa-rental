"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, LogOut, Settings } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/auth-context"

export default function UserMenu() {
  const { user, initialized, logout } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!initialized) return null

  if (!user) {
    return (
      <button
        onClick={() => router.push("/auth")}
        className='p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer'
        aria-label='Zaloguj się'
      >
        <User className='w-6 h-6 text-foreground' />
      </button>
    )
  }

  const initials = (user.displayName || user.email || "U")
    .charAt(0)
    .toUpperCase()

  const handleLogout = async () => {
    setOpen(false)
    await logout()
    router.push("/")
  }

  return (
    <div ref={menuRef} className='relative'>
      <button
        onClick={() => setOpen(!open)}
        className='w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center hover:bg-foreground/20 transition-colors cursor-pointer border border-border/40'
        aria-label='Menu użytkownika'
        aria-expanded={open}
      >
        <span className='text-xs font-bold text-foreground'>{initials}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className='absolute right-0 top-full mt-2 w-56 bg-card border border-border/60 rounded-2xl shadow-xl z-50 overflow-hidden'
          >
            <div className='px-4 py-3 border-b border-border/40'>
              <p className='text-xs font-semibold text-foreground truncate'>
                {user.displayName || "Użytkownik"}
              </p>
              <p className='text-[10px] text-muted dark:text-muted-foreground/70 truncate mt-0.5'>
                {user.email}
              </p>
            </div>

            <div className='p-1.5'>
              <button
                onClick={() => {
                  setOpen(false)
                  router.push("/profile")
                }}
                className='w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer'
              >
                <User className='w-4 h-4 text-foreground/50' />
                Profil
              </button>
              <button
                onClick={() => {
                  setOpen(false)
                  router.push("#")
                }}
                className='w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer'
              >
                <Settings className='w-4 h-4 text-foreground/50' />
                Ustawienia
              </button>
            </div>

            <div className='border-t border-border/40 p-1.5'>
              <button
                onClick={handleLogout}
                className='w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer'
              >
                <LogOut className='w-4 h-4' />
                Wyloguj się
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
