"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Star,
  ThumbsUp,
  BadgeCheck,
  Quote,
  Filter,
  MessageSquareText,
  Heart,
  CalendarDays,
  Home,
  Users,
  Sparkles,
  ChevronDown,
  Search,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import BottomNav from "@/components/BottomNav"
import { testimonials } from "@/public/data/testimonials"

const ratingLabels = ["Wszystkie", "5", "4", "3"] as const
type RatingFilter = (typeof ratingLabels)[number]

const villaNames = [
  "Wszystkie wille",
  "Willa Bursztynowa",
  "Willa Perłowa",
  "Willa Morska",
  "Willa Baltic",
]

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" as const },
  }),
}

function StarDisplay({
  rating,
  size = "sm",
}: {
  rating: number
  size?: "sm" | "xs"
}) {
  const fullStars = Math.floor(rating)
  const hasHalf = rating % 1 !== 0
  const sizeClass = size === "sm" ? "w-3.5 h-3.5" : "w-3 h-3"

  return (
    <div className='flex items-center gap-0.5'>
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star
          key={i}
          className={`${sizeClass} fill-yellow-400 text-yellow-400`}
        />
      ))}
      {hasHalf && (
        <div className='relative'>
          <Star className={`${sizeClass} text-yellow-400`} />
          <div className='absolute inset-0 overflow-hidden w-1/2'>
            <Star className={`${sizeClass} fill-yellow-400 text-yellow-400`} />
          </div>
        </div>
      )}
      <span
        className={`ml-1 font-bold text-foreground ${size === "sm" ? "text-xs" : "text-[10px]"}`}
      >
        {rating}
      </span>
    </div>
  )
}

function TestimonialsContent() {
  const router = useRouter()

  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("Wszystkie")
  const [villaFilter, setVillaFilter] = useState("Wszystkie wille")
  const [showVillaPicker, setShowVillaPicker] = useState(false)

  const filtered = useMemo(() => {
    return testimonials.filter((t) => {
      const matchRating =
        ratingFilter === "Wszystkie" ||
        (ratingFilter === "5" && t.rating >= 4.5) ||
        (ratingFilter === "4" && t.rating >= 3.5 && t.rating < 4.5) ||
        (ratingFilter === "3" && t.rating < 3.5)
      const matchVilla =
        villaFilter === "Wszystkie wille" || t.villa === villaFilter
      return matchRating && matchVilla
    })
  }, [ratingFilter, villaFilter])

  const avgRating = useMemo(
    () =>
      testimonials.reduce((acc, t) => acc + t.rating, 0) / testimonials.length,
    [],
  )

  const distribution = useMemo(() => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    testimonials.forEach((t) => {
      const key = Math.floor(t.rating) as keyof typeof dist
      if (key >= 1 && key <= 5) dist[key]++
    })
    return dist
  }, [])

  const totalLikes = useMemo(
    () => testimonials.reduce((acc, t) => acc + t.likes, 0),
    [],
  )

  return (
    <div className='relative flex flex-col h-full w-full overflow-hidden bg-background'>
      <header className='shrink-0 bg-card/80 backdrop-blur-sm border-b border-border/50 z-30'>
        <div className='flex items-center justify-between px-4 pt-4 pb-3'>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => router.back()}
              className='p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer'
              aria-label='Powrót'
            >
              <ArrowLeft className='w-5 h-5 text-foreground' />
            </button>
            <h1 className='text-lg font-bold text-foreground tracking-tight'>
              Opinie
            </h1>
          </div>
          <div className='flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10'>
            <MessageSquareText className='w-3.5 h-3.5 text-amber-500' />
            <span className='text-[9px] font-semibold text-amber-500'>
              {testimonials.length} opinii
            </span>
          </div>
        </div>
      </header>

      <main className='flex-1 overflow-y-auto overscroll-y-contain'>
        <section className='px-5 pt-5 pb-2'>
          <motion.div
            custom={0}
            variants={fadeUp}
            initial='hidden'
            animate='visible'
            className='relative rounded-3xl bg-linear-to-br from-[#1a3a5c] via-[#1a3a5c]/95 to-[#1a3a5c]/80 p-5 overflow-hidden'
          >
            <div className='absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none' />
            <div className='absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none' />

            <div className='relative z-10'>
              <div className='flex items-center gap-2 mb-1'>
                <Sparkles className='w-4 h-4 text-white/70' />
                <span className='text-[10px] font-semibold text-white/60 uppercase tracking-wider'>
                  Zaufali nam
                </span>
              </div>

              <div className='flex items-end justify-between mt-2'>
                <div>
                  <div className='flex items-center gap-2'>
                    <span className='text-4xl font-extrabold text-white'>
                      {avgRating.toFixed(1)}
                    </span>
                    <div className='pb-1'>
                      <div className='flex items-center gap-0.5'>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.round(avgRating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-white/20"
                            }`}
                          />
                        ))}
                      </div>
                      <span className='text-[10px] text-white/50 mt-0.5 block'>
                        Na podstawie {testimonials.length} opinii
                      </span>
                    </div>
                  </div>
                </div>
                <div className='flex flex-col items-end gap-0.5'>
                  <span className='text-white text-lg font-extrabold leading-none'>
                    {totalLikes}
                  </span>
                  <span className='text-[9px] text-white/60'>polubień</span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className='px-5 py-3'>
          <motion.div
            custom={1}
            variants={fadeUp}
            initial='hidden'
            animate='visible'
            className='bg-card border border-border/80 rounded-2xl p-4'
          >
            <div className='flex flex-col gap-1.5'>
              {([5, 4, 3, 2, 1] as const).map((star) => {
                const count = distribution[star]
                const pct = (count / testimonials.length) * 100
                return (
                  <div key={star} className='flex items-center gap-2.5'>
                    <span className='text-[10px] font-bold text-foreground w-4 text-right'>
                      {star}
                    </span>
                    <Star className='w-3 h-3 text-yellow-400 fill-yellow-400' />
                    <div className='flex-1 h-2 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden'>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className='h-full rounded-full bg-yellow-400'
                      />
                    </div>
                    <span className='text-[10px] text-muted dark:text-muted-foreground/60 w-6 text-right'>
                      {count}
                    </span>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </section>

        <section className='px-5 py-1'>
          <motion.div
            custom={2}
            variants={fadeUp}
            initial='hidden'
            animate='visible'
            className='flex flex-col gap-2.5'
          >
            <div className='flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5'>
              {ratingLabels.map((label) => (
                <button
                  key={label}
                  onClick={() => setRatingFilter(label)}
                  className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-semibold transition-all cursor-pointer ${
                    ratingFilter === label
                      ? "bg-accent text-accent-foreground shadow-sm"
                      : "bg-black/3 dark:bg-white/5 text-muted dark:text-muted-foreground/70 hover:bg-black/5 dark:hover:bg-white/10"
                  }`}
                >
                  {label === "Wszystkie" ? (
                    <Filter className='w-3 h-3' />
                  ) : (
                    <>
                      {label}
                      <Star className='w-2.5 h-2.5 fill-current' />
                    </>
                  )}
                </button>
              ))}
            </div>

            <div className='relative'>
              <button
                onClick={() => setShowVillaPicker(!showVillaPicker)}
                className='w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-black/3 dark:bg-white/5 border border-border/60 text-xs text-foreground focus:outline-none focus:border-accent/60 transition-colors cursor-pointer'
              >
                <div className='flex items-center gap-2'>
                  <Home className='w-3.5 h-3.5 text-muted dark:text-muted-foreground/50' />
                  <span>{villaFilter}</span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-muted dark:text-muted-foreground/50 transition-transform ${
                    showVillaPicker ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {showVillaPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className='absolute left-0 right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-xl z-40 overflow-hidden'
                  >
                    {villaNames.map((name) => (
                      <button
                        key={name}
                        onClick={() => {
                          setVillaFilter(name)
                          setShowVillaPicker(false)
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs transition-colors cursor-pointer ${
                          villaFilter === name
                            ? "bg-accent/10 text-accent-foreground font-medium"
                            : "text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </section>

        <section className='px-5 py-4'>
          <AnimatePresence mode='wait'>
            {filtered.length === 0 ? (
              <motion.div
                key='empty'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className='flex flex-col items-center gap-3 py-12'
              >
                <div className='w-16 h-16 rounded-full bg-black/3 dark:bg-white/5 flex items-center justify-center'>
                  <Search className='w-6 h-6 text-muted dark:text-muted-foreground/40' />
                </div>
                <p className='text-sm font-semibold text-foreground'>
                  Brak opinii
                </p>
                <p className='text-[11px] text-muted dark:text-muted-foreground/70 text-center max-w-[70%]'>
                  Nie znaleźliśmy opinii spełniających wybrane kryteria. Spróbuj
                  zmienić filtry.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={filtered.length}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className='flex flex-col gap-3'
              >
                <div className='flex items-center justify-between px-1'>
                  <h2 className='text-sm font-bold text-foreground tracking-tight'>
                    Wszystkie opinie
                  </h2>
                  <span className='text-[10px] text-muted dark:text-muted-foreground/50'>
                    {filtered.length} wyników
                  </span>
                </div>

                {filtered.map((item, i) => (
                  <motion.div
                    key={item.id}
                    custom={i + 3}
                    variants={fadeUp}
                    initial='hidden'
                    animate='visible'
                    layout
                    className='bg-card border border-border/80 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-accent/30 transition-all'
                  >
                    <div className='flex items-start justify-between mb-3'>
                      <div className='flex items-center gap-3 min-w-0'>
                        <div className='w-10 h-10 rounded-full bg-linear-to-br from-accent/20 to-accent/10 flex items-center justify-center shrink-0 border border-border/50'>
                          <span className='text-sm font-bold text-accent-foreground'>
                            {item.author.charAt(0)}
                          </span>
                        </div>
                        <div className='min-w-0'>
                          <div className='flex items-center gap-1.5 flex-wrap'>
                            <span className='text-xs font-bold text-foreground'>
                              {item.author}
                            </span>
                            {item.verified && (
                              <BadgeCheck className='w-3.5 h-3.5 text-blue-500 shrink-0' />
                            )}
                          </div>
                          <div className='flex items-center gap-2 mt-0.5'>
                            <span className='text-[9px] text-muted dark:text-muted-foreground/60 flex items-center gap-1'>
                              <CalendarDays className='w-2.5 h-2.5' />
                              {new Date(item.date).toLocaleDateString("pl-PL", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                            <span className='text-[9px] text-muted dark:text-muted-foreground/40'>
                              ·
                            </span>
                            <span className='text-[9px] text-muted dark:text-muted-foreground/60'>
                              {item.stayDuration}
                            </span>
                          </div>
                        </div>
                      </div>
                      <StarDisplay rating={item.rating} size='xs' />
                    </div>

                    <div className='relative mb-3'>
                      <Quote className='w-3.5 h-3.5 text-accent/30 absolute -top-0.5 -left-0.5' />
                      <p className='text-[11px] text-muted dark:text-muted-foreground/70 leading-relaxed pl-4'>
                        &ldquo;{item.text}&rdquo;
                      </p>
                    </div>

                    <div className='flex items-center justify-between pt-2.5 border-t border-border/30'>
                      <div className='flex items-center gap-2'>
                        <Link
                          href={`/villas/${item.villa
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                          className='flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent/8 text-accent-foreground text-[9px] font-semibold hover:bg-accent/15 transition-colors'
                        >
                          <Home className='w-2.5 h-2.5' />
                          {item.villa}
                        </Link>
                        <span className='flex items-center gap-1 px-2 py-1 rounded-lg bg-black/3 dark:bg-white/5 text-muted dark:text-muted-foreground/60 text-[9px] font-medium'>
                          <Users className='w-2.5 h-2.5' />
                          {item.groupType}
                        </span>
                      </div>
                      <div className='flex items-center gap-1 text-muted dark:text-muted-foreground/50'>
                        <ThumbsUp className='w-3 h-3' />
                        <span className='text-[9px] font-medium'>
                          {item.likes}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <section className='px-5 pb-4'>
          <motion.div
            custom={filtered.length + 3}
            variants={fadeUp}
            initial='hidden'
            animate='visible'
            className='relative rounded-3xl bg-linear-to-br from-accent/5 via-accent/10 to-transparent border border-accent/20 p-5 overflow-hidden'
          >
            <div className='absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl pointer-events-none' />

            <div className='relative z-10 flex items-start gap-4'>
              <div className='w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0'>
                <Heart className='w-6 h-6 text-accent-foreground' />
              </div>
              <div className='flex-1 min-w-0'>
                <h3 className='text-sm font-bold text-foreground'>
                  Dołącz do zadowolonych gości
                </h3>
                <p className='text-[10px] text-muted dark:text-muted-foreground/70 mt-1 leading-relaxed'>
                  Sprawdź dostępność willi i zarezerwuj swój wymarzony pobyt w
                  Kołobrzegu. Czekają na Ciebie luksusowe wnętrza i
                  niezapomniane widoki!
                </p>
                <button
                  onClick={() => router.push("/villas")}
                  className='mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-accent-foreground text-xs font-bold hover:opacity-90 transition-opacity shadow-md cursor-pointer'
                >
                  <Search className='w-3.5 h-3.5' />
                  Znajdź willę
                </button>
              </div>
            </div>
          </motion.div>
        </section>

        <div className='h-20' />
      </main>

      <BottomNav />
    </div>
  )
}

export default function TestimonialsPage() {
  return (
    <>
      <div className='flex md:hidden h-screen w-full'>
        <TestimonialsContent />
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
            Opinie naszych gości
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
                <TestimonialsContent />
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
