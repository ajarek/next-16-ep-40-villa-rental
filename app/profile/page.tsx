"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  ArrowLeft,
  Mail,
  ShieldCheck,
  LogOut,
  Calendar,
  Heart,
  Star,
  Loader2,
  HeartOff,
  CalendarX,
} from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { getFavorites, getBookings } from "@/lib/firestore-service"
import type { VillaData } from "@/types/villa"
import type { BookingData } from "@/types/booking"
import BottomNav from "@/components/BottomNav"

function ProfileContent() {
  const router = useRouter()
  const { user, loading, initialized, logout } = useAuth()

  const [favorites, setFavorites] = useState<VillaData[]>([])
  const [bookings, setBookings] = useState<BookingData[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"rezerwacje" | "ulubione">(
    "rezerwacje",
  )

  useEffect(() => {
    if (initialized && !user && !loading) {
      router.push("/auth")
    }
  }, [initialized, user, loading, router])

  useEffect(() => {
    if (!user) return
    Promise.all([
      getFavorites(user.uid).then(setFavorites),
      getBookings(user.uid).then(setBookings),
    ]).finally(() => setDataLoading(false))
  }, [user])

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  if (loading || !initialized) {
    return (
      <div className='relative flex flex-col h-full w-full overflow-hidden bg-background'>
        <div className='flex-1 flex items-center justify-center'>
          <Loader2 className='w-6 h-6 text-foreground/40 animate-spin' />
        </div>
        <BottomNav />
      </div>
    )
  }

  if (!user) return null

  const initials = (user.displayName || user.email || "U")
    .charAt(0)
    .toUpperCase()

  return (
    <div className='relative flex flex-col h-full w-full overflow-hidden bg-background'>
      <header className='shrink-0 flex items-center gap-3 px-4 pt-4 pb-3'>
        <button
          onClick={() => router.back()}
          className='w-9 h-9 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/15 transition-colors cursor-pointer'
          aria-label='Powrót'
        >
          <ArrowLeft className='w-5 h-5 text-foreground' />
        </button>
        <h1 className='text-base font-extrabold text-foreground'>Profil</h1>
      </header>

      <main className='flex-1 overflow-y-auto px-5'>
        <div className='flex flex-col items-center pt-4 pb-5'>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 18, stiffness: 200 }}
            className='w-20 h-20 rounded-full bg-foreground/10 flex items-center justify-center mb-3 border-2 border-border/60'
          >
            <span className='text-2xl font-bold text-foreground'>
              {initials}
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className='text-lg font-extrabold text-foreground'
          >
            {user.displayName || "Użytkownik"}
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className='flex items-center gap-1.5 mt-1'
          >
            <Mail className='w-3.5 h-3.5 text-foreground/40' />
            <span className='text-xs text-muted dark:text-muted-foreground/70'>
              {user.email}
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className='mt-3 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5'
          >
            <ShieldCheck className='w-3 h-3 text-emerald-500' />
            <span className='text-[10px] font-semibold text-emerald-500'>
              Konto zweryfikowane
            </span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className='flex gap-3 mb-5'
        >
          <div className='flex-1 px-4 py-3 rounded-2xl bg-black/3 dark:bg-white/5 border border-border/60 text-center'>
            <span className='text-lg font-extrabold text-foreground'>
              {bookings.length}
            </span>
            <p className='text-[9px] text-muted dark:text-muted-foreground/70 mt-0.5'>
              Rezerwacje
            </p>
          </div>
          <div className='flex-1 px-4 py-3 rounded-2xl bg-black/3 dark:bg-white/5 border border-border/60 text-center'>
            <span className='text-lg font-extrabold text-foreground'>
              {favorites.length}
            </span>
            <p className='text-[9px] text-muted dark:text-muted-foreground/70 mt-0.5'>
              Ulubione
            </p>
          </div>
        </motion.div>

        <div className='flex gap-1 mb-4 bg-black/3 dark:bg-white/5 rounded-2xl p-1'>
          <button
            onClick={() => setActiveTab("rezerwacje")}
            className={`flex-1 py-2 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
              activeTab === "rezerwacje"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted dark:text-muted-foreground/70 hover:text-foreground"
            }`}
          >
            Rezerwacje
          </button>
          <button
            onClick={() => setActiveTab("ulubione")}
            className={`flex-1 py-2 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
              activeTab === "ulubione"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted dark:text-muted-foreground/70 hover:text-foreground"
            }`}
          >
            Ulubione
          </button>
        </div>

        {dataLoading ? (
          <div className='flex items-center justify-center py-12'>
            <Loader2 className='w-5 h-5 text-foreground/30 animate-spin' />
          </div>
        ) : activeTab === "rezerwacje" ? (
          <BookingsList bookings={bookings} router={router} />
        ) : (
          <FavoritesList favorites={favorites} router={router} />
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className='mt-6 mb-8'
        >
          <button
            onClick={handleLogout}
            className='w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold hover:bg-red-500/20 transition-colors cursor-pointer'
          >
            <LogOut className='w-4 h-4' />
            Wyloguj się
          </button>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  )
}

function BookingsList({
  bookings,
  router,
}: {
  bookings: BookingData[]
  router: ReturnType<typeof useRouter>
}) {
  if (bookings.length === 0) {
    return (
      <div className='flex flex-col items-center gap-3 py-12'>
        <div className='w-14 h-14 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center'>
          <CalendarX className='w-6 h-6 text-foreground/30' />
        </div>
        <p className='text-xs text-muted dark:text-muted-foreground/70 text-center'>
          Brak rezerwacji
        </p>
        <button
          onClick={() => router.push("/villas")}
          className='px-4 py-2 rounded-xl bg-foreground text-background text-[10px] font-bold hover:opacity-90 transition-opacity cursor-pointer'
        >
          Przeglądaj wille
        </button>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-3'>
      {bookings.map((b, i) => (
        <motion.div
          key={b.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => router.push(`/villas/${b.villaId}`)}
          className='flex gap-3 px-3 py-3 rounded-2xl bg-black/3 dark:bg-white/5 border border-border/60 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer'
        >
          <div className='relative w-14 h-14 rounded-xl overflow-hidden shrink-0'>
            <Image
              src={b.villaImage}
              alt={b.villaName}
              fill
              className='object-cover'
              sizes='56px'
            />
          </div>

          <div className='flex-1 min-w-0'>
            <p className='text-xs font-semibold text-foreground truncate'>
              {b.villaName}
            </p>
            <div className='flex items-center gap-1 mt-1'>
              <Calendar className='w-3 h-3 text-foreground/40' />
              <span className='text-[10px] text-muted dark:text-muted-foreground/70'>
                {new Date(b.checkIn).toLocaleDateString("pl-PL", {
                  day: "numeric",
                  month: "short",
                })}
                {" – "}
                {new Date(b.checkOut).toLocaleDateString("pl-PL", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
            <div className='flex items-center justify-between mt-1'>
              <span className='text-[10px] text-muted dark:text-muted-foreground/70'>
                {b.nightsCount} {b.nightsCount === 1 ? "noc" : "noce"} ·{" "}
                {b.guests} {b.guests === 1 ? "gość" : "gości"}
              </span>
              <span className='text-[11px] font-bold text-foreground'>
                {b.totalPrice} zł
              </span>
            </div>
          </div>

          <div className='flex items-start'>
            <span className='px-2 py-0.5 rounded-full bg-emerald-500/10 text-[9px] font-semibold text-emerald-500 whitespace-nowrap'>
              Potwierdzona
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function FavoritesList({
  favorites,
  router,
}: {
  favorites: VillaData[]
  router: ReturnType<typeof useRouter>
}) {
  if (favorites.length === 0) {
    return (
      <div className='flex flex-col items-center gap-3 py-12'>
        <div className='w-14 h-14 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center'>
          <HeartOff className='w-6 h-6 text-foreground/30' />
        </div>
        <p className='text-xs text-muted dark:text-muted-foreground/70 text-center'>
          Brak ulubionych willi
        </p>
        <button
          onClick={() => router.push("/villas")}
          className='px-4 py-2 rounded-xl bg-foreground text-background text-[10px] font-bold hover:opacity-90 transition-opacity cursor-pointer'
        >
          Przeglądaj wille
        </button>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-3'>
      {favorites.map((v, i) => (
        <motion.div
          key={v.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => router.push(`/villas/${v.id}`)}
          className='flex gap-3 px-3 py-3 rounded-2xl bg-black/3 dark:bg-white/5 border border-border/60 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer'
        >
          <div className='relative w-14 h-14 rounded-xl overflow-hidden shrink-0'>
            <Image
              src={v.image}
              alt={v.name}
              fill
              className='object-cover'
              sizes='56px'
            />
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-xs font-semibold text-foreground truncate'>
              {v.name}
            </p>
            <div className='flex items-center gap-2 mt-1'>
              <div className='flex items-center gap-0.5'>
                <Star className='w-3 h-3 fill-yellow-400 text-yellow-400' />
                <span className='text-[10px] font-bold text-foreground'>
                  {v.rating}
                </span>
              </div>
              <span className='text-[9px] text-muted dark:text-muted-foreground/70'>
                {v.location.replace("-", ", ")}
              </span>
            </div>
            <div className='flex items-center gap-2 mt-1'>
              <span className='text-[11px] font-extrabold text-foreground'>
                {v.price} zł
              </span>
              <span className='text-[9px] text-muted dark:text-muted-foreground/70'>
                / noc
              </span>
              <span className='text-[9px] text-muted dark:text-muted-foreground/70'>
                ·
              </span>
              <span className='text-[9px] text-muted dark:text-muted-foreground/70'>
                {v.distanceToBeach} m od plaży
              </span>
            </div>
          </div>
          <div className='flex items-center'>
            <Heart className='w-4 h-4 fill-red-500 text-red-500' />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default function ProfilePage() {
  return (
    <>
      <div className='flex md:hidden h-screen w-full'>
        <ProfileContent />
      </div>

      <div className='hidden md:flex min-h-screen w-full items-center justify-center relative overflow-hidden bg-linear-to-br from-[#0a2540] via-[#1a3a5c] to-[#0a2540]'>
        <div className='absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-accent/10 blur-[120px] pointer-events-none' />
        <div className='absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none' />
        <div className='absolute top-[30%] right-[15%] w-[300px] h-[300px] rounded-full bg-accent/5 blur-[80px] pointer-events-none' />

        <div className='absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1'>
          <span className='text-white/40 text-xs tracking-[0.3em] uppercase font-medium'>
            Ville Kołobrzeg
          </span>
          <span className='text-white/20 text-[10px] tracking-wider'>
            Mobilna platforma rezerwacji willi
          </span>
        </div>

        <div className='relative' style={{ width: "390px", height: "844px" }}>
          <div
            className='absolute inset-0 rounded-[55px] shadow-[0_60px_120px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.08)] overflow-hidden'
            style={{
              background:
                "linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 30%, #0d0d0d 60%, #1a1a1a 100%)",
            }}
          >
            <div
              className='absolute rounded-[48px] overflow-hidden bg-background'
              style={{ inset: "8px" }}
            >
              <div
                className='absolute top-0 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center'
                style={{ width: "130px", height: "34px" }}
              >
                <div className='w-full h-full rounded-b-3xl bg-black/90 flex items-center justify-center gap-2'>
                  <div className='w-2 h-2 rounded-full bg-zinc-700' />
                  <div className='w-14 h-1.5 rounded-full bg-zinc-800' />
                  <div className='w-2 h-2 rounded-full bg-zinc-600 flex items-center justify-center'>
                    <div className='w-1 h-1 rounded-full bg-zinc-500' />
                  </div>
                </div>
              </div>
              <div className='absolute inset-0 pt-[34px]'>
                <ProfileContent />
              </div>
            </div>
            <div
              className='absolute rounded-r-sm bg-zinc-700'
              style={{
                right: "-3px",
                top: "160px",
                width: "3px",
                height: "60px",
              }}
            />
            <div
              className='absolute rounded-l-sm bg-zinc-700'
              style={{
                left: "-3px",
                top: "140px",
                width: "3px",
                height: "40px",
              }}
            />
            <div
              className='absolute rounded-l-sm bg-zinc-700'
              style={{
                left: "-3px",
                top: "195px",
                width: "3px",
                height: "40px",
              }}
            />
            <div
              className='absolute rounded-l-sm bg-zinc-700'
              style={{
                left: "-3px",
                top: "100px",
                width: "3px",
                height: "28px",
              }}
            />
          </div>
          <div
            className='absolute pointer-events-none rounded-[48px] opacity-20'
            style={{
              inset: "8px",
              background:
                "linear-gradient(120deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%)",
            }}
          />
        </div>
        <div className='absolute bottom-6 left-1/2 -translate-x-1/2'>
          <span className='text-white/20 text-[10px] tracking-widest uppercase'>
            © 2026 Ville Kołobrzeg
          </span>
        </div>
      </div>
    </>
  )
}
