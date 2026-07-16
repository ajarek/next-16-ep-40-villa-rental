"use client"

import React, { useState } from "react"
import Image from "next/image"
import {
  Menu,
  Waves,
  Anchor,
  Wind,
  Star,
  Search,
  Calendar,
  CreditCard,
  CheckCircle2,
  ArrowRight,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, type Variants, type Easing } from "framer-motion"

import ThemeToggle from "@/components/ThemeToggle"
import UserMenu from "@/components/UserMenu"
import MobileMenu from "@/components/MobileMenu"
import SearchForm from "@/components/SearchForm"
import FeaturedVillas from "@/components/FeaturedVillas"
import BottomNav from "@/components/BottomNav"

// Sekcja "Dlaczego Kołobrzeg?" – zalety lokalizacji
const kolobrzegFeatures = [
  { icon: Waves, label: "Piękne plaże" },
  { icon: Anchor, label: "Atrakcje kurortyczne" },
  { icon: Wind, label: "Czyste powietrze" },
  { icon: Star, label: "Idealne na każdą okazję" },
]

// Animacja dla kolejnych elementów przy wejściu na stronę
const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.45, ease: "easeOut" as Easing },
  }),
}

function AppContent() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    // Kontener aplikacji – relatywny, aby menu overlay miało dobre pozycjonowanie
    <div className='relative flex flex-col h-full w-full overflow-hidden bg-background'>
      {/* ========== NAGŁÓWEK ========== */}
      <header className='shrink-0 flex items-center justify-between px-5 pt-4 pb-3 bg-card/80 backdrop-blur-sm border-b border-border/50 z-30'>
        <button
          id='hamburger-menu-button'
          onClick={() => setMenuOpen(true)}
          className='p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer'
          aria-label='Otwórz menu'
        >
          <Menu className='w-6 h-6 text-foreground' />
        </button>

        {/* Logo */}
        <div className='flex flex-col items-center leading-none'>
          <span className='text-[10px] font-bold tracking-[0.2em]  uppercase'>
            Wille
          </span>
          <span className='text-sm font-extrabold tracking-[0.15em]  uppercase'>
            Kołobrzeg
          </span>
        </div>

        <div className='flex items-center gap-1.5'>
          <ThemeToggle />
          <UserMenu />
        </div>
      </header>

      {/* ========== WYSUWANE MENU MOBILNE ========== */}
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* ========== GŁÓWNA TREŚĆ (przewijana) ========== */}
      <main className='flex-1 overflow-y-auto overscroll-y-contain'>
        {/* --- SEKCJA HERO --- */}
        <motion.section
          custom={0}
          variants={fadeUpVariant}
          initial='hidden'
          animate='visible'
          className='relative w-full h-60 overflow-hidden'
        >
          <Image
            src='/images/hero_bg.png'
            alt='Luksusowe wille w Kołobrzegu nad Bałtykiem'
            fill
            priority
            className='object-cover'
            sizes='(max-width: 480px) 100vw, 480px'
          />
          {/* Gradient nakładka dla czytelności tekstu */}
          <div className='absolute inset-0 bg-linear-to-b from-primary/60 via-primary/40 to-primary/80' />

          {/* Tekst hero */}
          <div className='absolute inset-0 flex flex-col justify-end p-6 pb-8'>
            <motion.h1
              custom={1}
              variants={fadeUpVariant}
              initial='hidden'
              animate='visible'
              className='text-white font-extrabold text-2xl leading-tight drop-shadow-md'
            >
              Luksusowe wille
              <br />w Kołobrzegu
            </motion.h1>
            <motion.p
              custom={2}
              variants={fadeUpVariant}
              initial='hidden'
              animate='visible'
              className='text-white/80 text-sm mt-1.5 leading-relaxed'
            >
              Zarezerwuj swój idealny
              <br />
              wypoczynek nad morzem
            </motion.p>
          </div>
        </motion.section>

        {/* --- FORMULARZ WYSZUKIWANIA (nakładający się na hero z ujemnym marginesem) --- */}
        <div className='px-4 -mt-6 relative z-10'>
          <motion.div
            custom={3}
            variants={fadeUpVariant}
            initial='hidden'
            animate='visible'
          >
            <SearchForm />
          </motion.div>
        </div>

        {/* --- POLECANE WILLE --- */}
        <div className='px-4 mt-8'>
          <motion.div
            custom={4}
            variants={fadeUpVariant}
            initial='hidden'
            animate='visible'
          >
            <FeaturedVillas />
          </motion.div>
        </div>

        {/* --- SEKCJA "DLACZEGO KOŁOBRZEG?" --- */}
        <div className='px-4 mt-8'>
          <motion.div
            custom={5}
            variants={fadeUpVariant}
            initial='hidden'
            animate='visible'
            className='flex flex-col gap-4'
          >
            <h2 className='text-lg font-bold text-foreground tracking-tight px-1'>
              Dlaczego Kołobrzeg?
            </h2>
            <div className='grid grid-cols-4 gap-3'>
              {kolobrzegFeatures.map((feature, idx) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={idx}
                    custom={5 + idx * 0.5}
                    variants={fadeUpVariant}
                    initial='hidden'
                    animate='visible'
                    className='flex flex-col items-center gap-2 bg-card border border-border/80 rounded-2xl p-3 shadow-sm hover:shadow-md hover:border-accent/40 transition-all cursor-pointer'
                  >
                    <div className='w-10 h-10 rounded-xl  flex items-center justify-center'>
                      <Icon className='w-5 h-5 ' />
                    </div>
                    <span className='text-[10px] font-semibold text-center  leading-tight'>
                      {feature.label}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* --- SEKCJA "JAK TO DZIAŁA?" – PROCES PŁATNOŚCI --- */}
        <div className='px-4 mt-8'>
          <motion.div
            custom={8}
            variants={fadeUpVariant}
            initial='hidden'
            animate='visible'
            className='flex flex-col gap-4'
          >
            <div className='flex items-center justify-between px-1'>
              <h2 className='text-lg font-bold text-foreground tracking-tight'>
                Proces płatności
              </h2>
              <button
                onClick={() => router.push("/payment")}
                className='text-[10px] font-semibold text-accent-foreground bg-accent/10 px-3 py-1.5 rounded-lg hover:bg-accent/20 transition-colors cursor-pointer'
              >
                Sprawdź
              </button>
            </div>

            <div className='relative bg-card border border-border/80 rounded-3xl p-5 shadow-sm overflow-hidden'>
              {/* Dekoracyjne tło */}
              <div className='absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl pointer-events-none' />

              <div className='flex flex-col gap-0 relative'>
                {[
                  {
                    icon: Search,
                    title: "Znajdź willę",
                    desc: "Przeglądaj katalog i wybierz idealny obiekt",
                    color: "bg-blue-500/10 text-blue-500",
                  },
                  {
                    icon: Calendar,
                    title: "Wybierz termin",
                    desc: "Określ daty pobytu i liczbę gości",
                    color: "bg-violet-500/10 text-violet-500",
                  },
                  {
                    icon: CreditCard,
                    title: "Zapłać online",
                    desc: "BLIK, karta, Apple Pay, Google Pay lub Przelewy24",
                    color: "bg-emerald-500/10 text-emerald-500",
                  },
                  {
                    icon: CheckCircle2,
                    title: "Ciesz się pobytem",
                    desc: "Otrzymasz potwierdzenie z kodem QR",
                    color: "bg-amber-500/10 text-amber-500",
                  },
                ].map((step, i) => (
                  <div key={i} className='flex items-start gap-4 py-3'>
                    {/* Numer i linia łącząca */}
                    <div className='flex flex-col items-center'>
                      <div
                        className={`w-10 h-10 rounded-xl ${step.color} flex items-center justify-center shadow-sm shrink-0`}
                      >
                        <step.icon className='w-5 h-5' />
                      </div>
                      {i < 3 && <div className='w-0.5 h-6 bg-border/60 mt-1' />}
                    </div>

                    {/* Treść */}
                    <div className='flex-1 min-w-0 pt-1'>
                      <div className='flex items-center gap-2'>
                        <span className='text-[10px] font-bold text-muted dark:text-muted-foreground/50'>
                          Krok {i + 1}
                        </span>
                      </div>
                      <h3 className='text-sm font-bold text-foreground mt-0.5'>
                        {step.title}
                      </h3>
                      <p className='text-[11px] text-muted dark:text-muted-foreground/70 mt-0.5 leading-relaxed'>
                        {step.desc}
                      </p>
                    </div>

                    {/* Strzałka (oprócz ostatniego) */}
                    {i < 3 && (
                      <div className='hidden sm:flex items-center self-center ml-2'>
                        <ArrowRight className='w-4 h-4 text-muted dark:text-muted-foreground/30' />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Dolny pasek z informacją o bezpieczeństwie */}
              <div className='mt-2 pt-3 border-t border-border/40 flex items-center gap-2'>
                <div className='flex -space-x-1'>
                  <div className='w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center'>
                    <span className='text-[6px] font-bold text-blue-500'>
                      V
                    </span>
                  </div>
                  <div className='w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center'>
                    <span className='text-[6px] font-bold text-red-500'>
                      MC
                    </span>
                  </div>
                  <div className='w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center'>
                    <span className='text-[5px] font-bold text-yellow-600'>
                      BLIK
                    </span>
                  </div>
                </div>
                <span className='text-[9px] text-muted dark:text-muted-foreground/50'>
                  Bezpieczne płatności · SSL szyfrowane
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* --- BANER REJESTRACYJNY --- */}
        <div className='px-4 mt-8 mb-6'>
          <motion.div
            custom={9}
            variants={fadeUpVariant}
            initial='hidden'
            animate='visible'
            className='relative rounded-3xl overflow-hidden'
          >
            <Image
              src='/images/promo_bg.png'
              alt='Kołobrzeg plaża zachód słońca'
              width={600}
              height={200}
              className='w-full h-40 object-cover'
              sizes='(max-width: 480px) 100vw, 480px'
            />
            {/* Gradient nakładka */}
            <div className='absolute inset-0 bg-linear-to-r from-primary/85 to-primary/40' />

            {/* Treść baneru */}
            <div className='absolute inset-0 flex flex-col justify-center p-6'>
              <p className='text-white text-xs font-semibold uppercase tracking-wider opacity-80 mb-1'>
                Nowi użytkownicy
              </p>
              <p className='text-white dark:text-black text-lg font-extrabold leading-tight mb-3'>
                Zarejestruj się i zyskaj
                <br />
                <span className='text-green-500'>5% rabatu</span> na pierwszą
                rezerwację!
              </p>
              <button
                id='register-promo-button'
                onClick={() => router.push("/auth")}
                className='self-start bg-white dark:bg-black text-primary dark:text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-white/90 transition-colors cursor-pointer shadow-lg'
              >
                Zarejestruj się
              </button>
            </div>
          </motion.div>
        </div>
      </main>

      {/* ========== DOLNA NAWIGACJA ========== */}
      <BottomNav />
    </div>
  )
}

// ============================================================
// Główna strona – otacza zawartość ramką telefonu na desktopie
// ============================================================
export default function StronaGlowna() {
  return (
    <>
      {/* === WIDOK MOBILNY (pełny ekran) === */}
      <div className='flex md:hidden h-screen w-full'>
        <AppContent />
      </div>

      {/* === WIDOK DESKTOPOWY (symulator telefonu) === */}
      <div className='hidden md:flex min-h-screen w-full items-center justify-center relative overflow-hidden bg-linear-to-br from-[#0a2540] via-[#1a3a5c] to-[#0a2540]'>
        {/* Ozdobne elementy tła */}
        <div className='absolute top-[-10%] left-[-5%] w-125 h-125 rounded-full bg-accent/10 blur-[120px] pointer-events-none' />
        <div className='absolute bottom-[-10%] right-[-5%] w-100 h-100 rounded-full bg-blue-500/10 blur-[100px] pointer-events-none' />
        <div className='absolute top-[30%] right-[15%] w-75 h-75 rounded-full bg-accent/5 blur-[80px] pointer-events-none' />

        {/* Etykieta aplikacji nad telefonem */}
        <div className='absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1'>
          <span className='text-white/40 text-xs tracking-[0.3em] uppercase font-medium'>
            Ville Kołobrzeg
          </span>
          <span className='text-white/20 text-[10px] tracking-wider'>
            Mobilna platforma rezerwacji willi
          </span>
        </div>

        {/* Ramka telefonu */}
        <div
          className='relative'
          style={{
            width: "390px",
            height: "844px",
          }}
        >
          {/* Zewnętrzna ramka urządzenia */}
          <div
            className='absolute inset-0 rounded-[55px] shadow-[0_60px_120px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.08)] overflow-hidden'
            style={{
              background:
                "linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 30%, #0d0d0d 60%, #1a1a1a 100%)",
            }}
          >
            {/* Wewnętrzne wcięcie ramki (bezel) */}
            <div
              className='absolute rounded-[48px] overflow-hidden bg-background'
              style={{
                inset: "8px",
              }}
            >
              {/* Notch – górna belka telefonu z aparatem i głośnikiem */}
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

              {/* Treść aplikacji */}
              <div className='absolute inset-0 pt-8.5'>
                <AppContent />
              </div>
            </div>

            {/* Lewy przycisk zasilania */}
            <div
              className='absolute rounded-r-sm bg-zinc-700'
              style={{
                right: "-3px",
                top: "160px",
                width: "3px",
                height: "60px",
              }}
            />
            {/* Prawa głośność góra */}
            <div
              className='absolute rounded-l-sm bg-zinc-700'
              style={{
                left: "-3px",
                top: "140px",
                width: "3px",
                height: "40px",
              }}
            />
            {/* Prawa głośność dół */}
            <div
              className='absolute rounded-l-sm bg-zinc-700'
              style={{
                left: "-3px",
                top: "195px",
                width: "3px",
                height: "40px",
              }}
            />
            {/* Przycisk wyciszenia */}
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

          {/* Odbłysk szkła na ekranie */}
          <div
            className='absolute pointer-events-none rounded-[48px] opacity-20'
            style={{
              inset: "8px",
              background:
                "linear-gradient(120deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%)",
            }}
          />
        </div>

        {/* Stopka pod telefonem */}
        <div className='absolute bottom-6 left-1/2 -translate-x-1/2'>
          <span className='text-white/20 text-[10px] tracking-widest uppercase'>
            © 2026 Ville Kołobrzeg
          </span>
        </div>
      </div>
    </>
  )
}
