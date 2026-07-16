"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Star,
  MapPin,
  Heart,
  Share2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Bath,
  Waves,
  Wind,
  Car,
  Snowflake,
  Wifi,
  Flame,
  Sun,
  Users,
  Calendar,
  Clock,
  PawPrint,
  Ban,
  Music,
  Plus,
  Minus,
  Phone,
  MessageCircle,
  Navigation,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import BottomNav from "@/components/BottomNav"
import { DatePicker } from "@/components/Picker"
import { useRequireAuth } from "@/lib/use-require-auth"
import { useAuth } from "@/lib/auth-context"
import {
  addFavorite,
  removeFavorite,
  isFavorite as checkIsFavorite,
  addBooking,
} from "@/lib/firestore-service"
import type { Villa, Review } from "@/types/villa"

// ============================================================
// MAPOWANIE IKON UDOGODNIEŃ
// ============================================================

const amenityIcons: Record<string, React.ElementType> = {
  Basen: Waves,
  Sauna: Sun,
  Parking: Car,
  Klimatyzacja: Snowflake,
  "Wi-Fi": Wifi,
  Jacuzzi: Bath,
  "Widok na morze": Waves,
  Taras: Sun,
  "Zwierzęta akceptowane": Wind,
  Grill: Flame,
}

// ============================================================
// GŁÓWNY KOMPONENT
// ============================================================

function VillaDetailContent() {
  const params = useParams()
  const router = useRouter()
  const { requireAuth } = useRequireAuth()
  const { user } = useAuth()
  const [villa, setVilla] = useState<Villa | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [favLoading, setFavLoading] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [checkIn, setCheckIn] = useState<Date | undefined>(undefined)
  const [checkOut, setCheckOut] = useState<Date | undefined>(undefined)
  const [guests, setGuests] = useState(2)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Fetch villa data
  useEffect(() => {
    fetch("/data/villas.json")
      .then((res) => res.json())
      .then((data: Villa[]) => {
        const found = data.find((v) => v.id === params.id)
        setVilla(found || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.id])

  // Pobierz stan ulubionych z Firestore
  useEffect(() => {
    if (!user || !params.id || !villa) return
    checkIsFavorite(user.uid, params.id as string).then(setIsFavorite)
  }, [user, params.id, villa])

  // Oblicz liczbę nocy i cenę całkowitą
  const nightsCount =
    checkIn && checkOut
      ? Math.ceil(
          (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
        )
      : 0
  const totalPrice = villa ? nightsCount * villa.price : 0

  // Generuj stabilny i deterministyczny numer rezerwacji
  const reservationNumber = useMemo(() => {
    const seed = `${params.id}-${checkIn?.getTime() || 0}-${checkOut?.getTime() || 0}`
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash)
    }
    const num = Math.abs(hash) % 100000
    return `VK-${String(num).padStart(5, "0")}`
  }, [params.id, checkIn, checkOut])

  // Przewijanie galerii
  const galleryLength = villa?.gallery?.length || 0

  const goToSlide = useCallback(
    (index: number) => {
      if (galleryLength === 0) return
      setCurrentSlide((index + galleryLength) % galleryLength)
    },
    [galleryLength],
  )

  // Automatyczna karuzela
  useEffect(() => {
    if (galleryLength <= 1) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % galleryLength)
    }, 4000)
    return () => clearInterval(timer)
  }, [galleryLength])

  if (loading) {
    return (
      <div className='relative flex flex-col h-full w-full overflow-hidden bg-background'>
        <div className='flex-1 flex items-center justify-center'>
          <div className='w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin' />
        </div>
        <BottomNav />
      </div>
    )
  }

  if (!villa) {
    return (
      <div className='relative flex flex-col h-full w-full overflow-hidden bg-background'>
        <div className='flex-1 flex flex-col items-center justify-center gap-4 px-6'>
          <div className='w-16 h-16 rounded-full bg-muted flex items-center justify-center'>
            <MapPin className='w-7 h-7 text-muted-foreground' />
          </div>
          <p className='text-sm font-medium text-foreground text-center'>
            Nie znaleziono willi
          </p>
          <button
            onClick={() => router.back()}
            className='px-5 py-2 bg-accent text-accent-foreground text-xs font-semibold rounded-xl'
          >
            Wróć do katalogu
          </button>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className='relative flex flex-col h-full w-full overflow-hidden bg-background'>
      {/* ========== GÓRNY PASKI NAKŁADANE NA ZDJĘCIE ========== */}
      <div className='absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 pt-4'>
        <button
          onClick={() => router.back()}
          className='w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer'
          aria-label='Powrót'
        >
          <ArrowLeft className='w-5 h-5 text-white' />
        </button>
        <div className='flex items-center gap-2'>
          <button
            onClick={() =>
              requireAuth(async () => {
                if (!user || !villa) return
                setFavLoading(true)
                try {
                  if (isFavorite) {
                    await removeFavorite(user.uid, villa.id)
                    setIsFavorite(false)
                  } else {
                    await addFavorite(user.uid, villa.id, {
                      id: villa.id,
                      name: villa.name,
                      price: villa.price,
                      rating: villa.rating,
                      image: villa.image,
                      location: villa.location,
                      distanceToBeach: villa.distanceToBeach,
                      numberOfPeople: villa.numberOfPeople,
                      status: villa.status,
                    })
                    setIsFavorite(true)
                  }
                } finally {
                  setFavLoading(false)
                }
              })
            }
            disabled={favLoading}
            className='w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer disabled:opacity-50'
            aria-label={
              isFavorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"
            }
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isFavorite ? "fill-red-500 text-red-500" : "text-white"
              }`}
            />
          </button>
          <button
            className='w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer'
            aria-label='Udostępnij'
          >
            <Share2 className='w-5 h-5 text-white' />
          </button>
        </div>
      </div>

      {/* ========== GŁÓWNA TREŚĆ (PRZEWIJANA) ========== */}
      <main className='flex-1 overflow-y-auto overscroll-y-contain'>
        {/* ========== GALERIA ZDJĘĆ ========== */}
        <section className='relative w-full h-[320px] overflow-hidden'>
          {/* Główne zdjęcie z karuzelą */}
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className='absolute inset-0'
            >
              <Image
                src={villa.gallery[currentSlide] || villa.image}
                alt={`${villa.name} – zdjęcie ${currentSlide + 1}`}
                fill
                className='object-cover'
                priority
                sizes='(max-width: 480px) 100vw, 480px'
              />
              {/* Gradient overlay */}
              <div className='absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-black/20' />
            </motion.div>
          </AnimatePresence>

          {/* Status badge */}
          <div className='absolute top-16 left-4 z-20'>
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
                villa.status === "free"
                  ? "bg-emerald-500/80 text-white"
                  : "bg-red-500/80 text-white"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  villa.status === "free" ? "bg-white" : "bg-white"
                }`}
              />
              {villa.status === "free" ? "Dostępna" : "Zajęta"}
            </span>
          </div>

          {/* Przyciski nawigacji galerii */}
          {galleryLength > 1 && (
            <>
              <button
                onClick={() => goToSlide(currentSlide - 1)}
                className='absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/40 transition-colors cursor-pointer'
                aria-label='Poprzednie zdjęcie'
              >
                <ChevronLeft className='w-5 h-5 text-white' />
              </button>
              <button
                onClick={() => goToSlide(currentSlide + 1)}
                className='absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/40 transition-colors cursor-pointer'
                aria-label='Następne zdjęcie'
              >
                <ChevronRight className='w-5 h-5 text-white' />
              </button>
            </>
          )}

          {/* Licznik zdjęć */}
          <div className='absolute bottom-4 right-4 z-20 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg'>
            <span className='text-white text-[11px] font-medium'>
              {currentSlide + 1}/{galleryLength}
            </span>
          </div>

          {/* Kropki galerii */}
          {galleryLength > 1 && (
            <div className='absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5'>
              {villa.gallery.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${
                    i === currentSlide
                      ? "w-5 h-1.5 bg-white"
                      : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
                  }`}
                  aria-label={`Przejdź do zdjęcia ${i + 1}`}
                />
              ))}
            </div>
          )}
        </section>

        {/* ========== SEKCJA INFORMACYJNA ========== */}
        <section className='px-5 pt-5 pb-3 border-b border-border/30'>
          {/* Nazwa i lokalizacja */}
          <div className='flex items-start justify-between'>
            <div className='flex-1 min-w-0'>
              <h1 className='text-xl font-extrabold text-foreground tracking-tight'>
                {villa.name}
              </h1>
              <div className='flex items-center gap-1.5 mt-1.5'>
                <MapPin className='w-3.5 h-3.5 text-foreground/50 shrink-0' />
                <span className='text-xs text-muted dark:text-muted-foreground/70'>
                  {villa.location.replace("-", ", ")} · {villa.distanceToBeach}{" "}
                  m od plaży
                </span>
              </div>
            </div>
            {/* Cena w badge */}
            <div className='flex flex-col items-end shrink-0 ml-3'>
              <span className='text-lg font-extrabold text-foreground'>
                {villa.price} zł
              </span>
              <span className='text-[10px] text-muted dark:text-muted-foreground/70 -mt-0.5'>
                za noc
              </span>
            </div>
          </div>

          {/* Ocena */}
          <div className='flex items-center gap-1.5 mt-3'>
            <div className='flex items-center gap-1 px-2 py-1 bg-yellow-400/10 rounded-lg'>
              <Star className='w-3.5 h-3.5 fill-yellow-400 text-yellow-400' />
              <span className='text-xs font-bold text-foreground'>
                {villa.rating}
              </span>
            </div>
            <span className='text-[11px] text-muted dark:text-muted-foreground/70'>
              {villa.reviewsCount}{" "}
              {villa.reviewsCount === 1
                ? "opinia"
                : villa.reviewsCount < 5
                  ? "opinie"
                  : "opinii"}
            </span>
          </div>
        </section>

        {/* ========== QUICK INFO ========== */}
        <section className='px-5 py-4 border-b border-border/30'>
          <div className='grid grid-cols-4 gap-2'>
            {[
              {
                icon: Users,
                label: "Goście",
                value: `do ${villa.numberOfPeople}`,
              },
              {
                icon: MapPin,
                label: "Plaża",
                value: `${villa.distanceToBeach} m`,
              },
              {
                icon: Clock,
                label: "Zameldowanie",
                value: villa.rules.checkIn,
              },
              {
                icon: Clock,
                label: "Wymeldowanie",
                value: villa.rules.checkOut,
              },
            ].map((item, i) => (
              <div
                key={i}
                className='flex flex-col items-center gap-1.5 px-2 py-3 rounded-2xl bg-black/3 dark:bg-white/5'
              >
                <item.icon className='w-4 h-4 text-foreground/50' />
                <span className='text-[10px] font-bold text-foreground'>
                  {item.value}
                </span>
                <span className='text-[9px] text-muted dark:text-muted-foreground/70'>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ========== OPIS ========== */}
        <section className='px-5 py-5 border-b border-border/30'>
          <h2 className='text-sm font-bold text-foreground mb-3'>
            O tym obiekcie
          </h2>
          <p className='text-xs  leading-relaxed'>{villa.description}</p>
        </section>

        {/* =========️ UDOGODNIENIA ========== */}
        <section className='px-5 py-5 border-b border-border/30'>
          <h2 className='text-sm font-bold text-foreground mb-3'>
            Udogodnienia
          </h2>
          <div className='grid grid-cols-2 gap-2.5'>
            {villa.amenities.map((amenity) => {
              const Icon = amenityIcons[amenity] || Sun
              return (
                <div
                  key={amenity}
                  className='flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-black/3 dark:bg-white/5'
                >
                  <div className='w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center'>
                    <Icon className='w-4 h-4 text-foreground/50' />
                  </div>
                  <span className='text-xs font-medium text-foreground'>
                    {amenity}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        {/* ========== MAPA ========== */}
        <section className='px-5 py-5 border-b border-border/30'>
          <div className='flex items-center justify-between mb-3'>
            <h2 className='text-sm font-bold text-foreground'>Lokalizacja</h2>
            <button
              className='flex items-center gap-1 text-[11px] font-medium text-foreground/60 hover:underline cursor-pointer'
              onClick={() =>
                window.open(
                  `https://www.google.com/maps?q=${villa.coordinates.lat},${villa.coordinates.lng}`,
                  "_blank",
                )
              }
            >
              <Navigation className='w-3.5 h-3.5' />
              Otwórz mapę
            </button>
          </div>

          {/* Stylizowana mapa */}
          <div className='relative w-full h-[180px] rounded-2xl overflow-hidden bg-linear-to-br from-primary/10 to-transparent border border-border/60'>
            {/* Siatka mapy */}
            <div
              className='absolute inset-0 opacity-10 pointer-events-none'
              style={{
                background: `
      radial-gradient(circle at center,
        transparent 0,
        transparent 120px,
        rgba(59,130,246,0.08) 121px,
        transparent 122px),
      radial-gradient(circle at center,
        transparent 0,
        transparent 240px,
        rgba(59,130,246,0.06) 241px,
        transparent 242px)
    `,
              }}
            />
            {/* Znacznik lokalizacji */}
            <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center'>
              <div className='w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 animate-bounce'>
                <MapPin className='w-5 h-5 text-primary-foreground' />
              </div>
              <span className='mt-1 px-2 py-0.5 bg-card rounded-md text-[9px] font-semibold text-foreground shadow-sm border border-border/60 whitespace-nowrap'>
                {villa.name}
              </span>
            </div>

            {/* Etykiety miejsc */}
            <div className='absolute bottom-3 left-3 flex flex-col gap-0.5'>
              <span className='text-[9px] text-muted dark:text-muted-foreground/60'>
                Plaża · {villa.distanceToBeach} m
              </span>
              <span className='text-[9px] text-muted dark:text-muted-foreground/60'>
                {villa.location.replace("-", ", ")}
              </span>
            </div>

            {/* Przycisk nawigacji */}
            <div className='absolute bottom-3 right-3'>
              <button
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${villa.coordinates.lat},${villa.coordinates.lng}`,
                    "_blank",
                  )
                }
                className='flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground text-[10px] font-semibold rounded-lg hover:opacity-90 transition-opacity cursor-pointer shadow-md'
              >
                <Navigation className='w-3 h-3' />
                Nawiguj
              </button>
            </div>
          </div>
        </section>

        {/* ========== ZASADY DOMU ========== */}
        <section className='px-5 py-5 border-b border-border/30'>
          <h2 className='text-sm font-bold text-foreground mb-3'>
            Zasady domu
          </h2>
          <div className='flex flex-col gap-3'>
            <div className='flex items-center justify-between py-2 border-b border-border/20'>
              <span className='text-xs text-muted dark:text-muted-foreground/70'>
                Zameldowanie
              </span>
              <span className='text-xs font-medium text-foreground'>
                od {villa.rules.checkIn}
              </span>
            </div>
            <div className='flex items-center justify-between py-2 border-b border-border/20'>
              <span className='text-xs text-muted dark:text-muted-foreground/70'>
                Wymeldowanie
              </span>
              <span className='text-xs font-medium text-foreground'>
                do {villa.rules.checkOut}
              </span>
            </div>
            <div className='flex items-center justify-between py-2 border-b border-border/20'>
              <span className='text-xs text-muted dark:text-muted-foreground/70'>
                Minimalny pobyt
              </span>
              <span className='text-xs font-medium text-foreground'>
                {villa.rules.minimumStay}{" "}
                {villa.rules.minimumStay === 1 ? "noc" : "noce"}
              </span>
            </div>
            <div className='flex items-center justify-between py-2 border-b border-border/20'>
              <div className='flex items-center gap-2'>
                <Ban className='w-3.5 h-3.5 text-muted dark:text-muted-foreground/70' />
                <span className='text-xs text-muted dark:text-muted-foreground/70'>
                  Palenie
                </span>
              </div>
              <span
                className={`text-[10px] font-semibold ${
                  villa.rules.smoking ? "text-emerald-500" : "text-red-400"
                }`}
              >
                {villa.rules.smoking ? "Dozwolone" : "Zakazane"}
              </span>
            </div>
            <div className='flex items-center justify-between py-2 border-b border-border/20'>
              <div className='flex items-center gap-2'>
                <PawPrint className='w-3.5 h-3.5 text-muted dark:text-muted-foreground/70' />
                <span className='text-xs text-muted dark:text-muted-foreground/70'>
                  Zwierzęta
                </span>
              </div>
              <span
                className={`text-[10px] font-semibold ${
                  villa.rules.pets ? "text-emerald-500" : "text-red-400"
                }`}
              >
                {villa.rules.pets ? "Akceptowane" : "Nieakceptowane"}
              </span>
            </div>
            <div className='flex items-center justify-between py-2'>
              <div className='flex items-center gap-2'>
                <Music className='w-3.5 h-3.5 text-muted dark:text-muted-foreground/70' />
                <span className='text-xs text-muted dark:text-muted-foreground/70'>
                  Imprezy
                </span>
              </div>
              <span
                className={`text-[10px] font-semibold ${
                  villa.rules.parties ? "text-emerald-500" : "text-red-400"
                }`}
              >
                {villa.rules.parties ? "Dozwolone" : "Zakazane"}
              </span>
            </div>
          </div>
        </section>

        {/* ========== OPINIE ========== */}
        <section className='px-5 py-5 border-b border-border/30'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-sm font-bold text-foreground'>Opinie gości</h2>
            <span className='text-[10px] text-muted dark:text-muted-foreground/70'>
              {villa.reviewsCount} opinii
            </span>
          </div>

          <div className='flex flex-col gap-4'>
            {villa.reviews.map((review, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className='pb-4 border-b border-border/20 last:border-b-0 last:pb-0'
              >
                <div className='flex items-center justify-between mb-2'>
                  <div className='flex items-center gap-2.5'>
                    {/* Avatar z inicjałem */}
                    <div className='w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center'>
                      <span className='text-xs font-bold text-foreground/60'>
                        {review.author.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <span className='text-xs font-semibold text-foreground'>
                        {review.author}
                      </span>
                      <span className='text-[9px] text-muted dark:text-muted-foreground/70 block'>
                        {new Date(review.date).toLocaleDateString("pl-PL", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className='flex items-center gap-0.5'>
                    <Star className='w-3 h-3 fill-yellow-400 text-yellow-400' />
                    <span className='text-[10px] font-bold text-foreground'>
                      {review.rating}
                    </span>
                  </div>
                </div>
                <p className='text-[11px] text-muted dark:text-muted-foreground/70 leading-relaxed italic'>
                  &ldquo;{review.text}&rdquo;
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ========== KONTAKT ========== */}
        <section className='px-5 py-5'>
          <h2 className='text-sm font-bold text-foreground mb-3'>
            Masz pytania?
          </h2>
          <div className='flex gap-3'>
            <button
              className='flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-accent text-accent-foreground text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer'
              onClick={() => (window.location.href = `tel:+48536128088`)}
            >
              <Phone className='w-4 h-4' />
              Zadzwoń
            </button>
            <button
              className='flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-black/5 dark:bg-white/5 text-foreground text-xs font-semibold hover:bg-black/10 dark:hover:bg-white/10 transition-colors border border-border/60 cursor-pointer'
              onClick={() =>
                (window.location.href = `mailto:ajarek@poczta.onet.pl`)
              }
            >
              <MessageCircle className='w-4 h-4' />
              Napisz
            </button>
          </div>
        </section>

        {/* Dodatkowy padding na dole dla BottomNav */}
        <div className='h-20' />
      </main>

      {/* ========== DOLNY PASKI REZERWACJI (FIXED) ========== */}
      <div className='shrink-0 bg-card/90 backdrop-blur-md border-t border-border/60 px-4 py-3 z-30'>
        <div className='flex items-center justify-between mb-3'>
          <div>
            <span className='text-lg font-extrabold text-foreground'>
              {villa.price} zł
            </span>
            <span className='text-[10px] text-muted dark:text-muted-foreground/70'>
              {" "}
              / noc
            </span>
          </div>
          <div className='flex items-center gap-1'>
            <Star className='w-3.5 h-3.5 fill-yellow-400 text-yellow-400' />
            <span className='text-xs font-bold text-foreground'>
              {villa.rating}
            </span>
          </div>
        </div>

        {/* Booking bar */}
        <div className='flex items-center gap-2'>
          <div className='flex-1 flex items-center gap-1 px-3 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-border/60'>
            <Calendar className='w-4 h-4 text-foreground/50 shrink-0' />
            <span className='text-[11px] text-foreground font-medium truncate'>
              {checkIn && checkOut
                ? `${checkIn.toLocaleDateString("pl-PL", {
                    day: "numeric",
                    month: "short",
                  })} – ${checkOut.toLocaleDateString("pl-PL", {
                    day: "numeric",
                    month: "short",
                  })}`
                : "Wybierz daty"}
            </span>
          </div>
          <button
            onClick={() => requireAuth(() => setShowBookingForm(true))}
            disabled={villa.status !== "free"}
            className='px-5 py-2.5 rounded-xl bg-green-500 text-white text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
          >
            Rezerwuj
          </button>
        </div>
      </div>

      {/* ========== BOTTOM NAV ========== */}
      <BottomNav />

      {/* ========== PANEL REZERWACJI (SLIDE-UP) ========== */}
      <AnimatePresence>
        {showBookingForm && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBookingForm(false)}
              className='absolute inset-0 bg-black/40 z-50'
            />

            {/* Panel */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className='absolute bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col'
            >
              {/* Header */}
              <div className='flex items-center justify-between px-5 pt-5 pb-3 border-b border-border/50'>
                <div>
                  <h2 className='text-base font-bold text-foreground'>
                    Rezerwacja
                  </h2>
                  <p className='text-[11px] text-muted dark:text-muted-foreground/70 mt-0.5'>
                    {villa.name}
                  </p>
                </div>
                <button
                  onClick={() => setShowBookingForm(false)}
                  className='p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer'
                >
                  <X className='w-5 h-5 text-muted dark:text-muted-foreground/70' />
                </button>
              </div>

              {/* Treść */}
              <div className='flex-1 overflow-y-auto px-5 py-4 space-y-5'>
                {/* Daty */}
                <div>
                  <h3 className='text-xs font-bold text-foreground uppercase tracking-wider mb-2.5'>
                    Daty pobytu
                  </h3>
                  <div className='grid grid-cols-2 gap-3'>
                    <DatePicker
                      name='checkIn'
                      label='Przyjazd'
                      value={checkIn}
                      onChange={setCheckIn}
                      fromDate={new Date()}
                    />
                    <DatePicker
                      name='checkOut'
                      label='Wyjazd'
                      value={checkOut}
                      onChange={setCheckOut}
                      fromDate={checkIn ?? new Date()}
                      popoverAlign='end'
                    />
                  </div>
                </div>

                {/* Goście */}
                <div>
                  <h3 className='text-xs font-bold text-foreground uppercase tracking-wider mb-2.5'>
                    Liczba gości
                  </h3>
                  <div className='flex items-center justify-between px-4 py-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-border/60'>
                    <span className='text-xs font-medium text-foreground'>
                      Osoby
                    </span>
                    <div className='flex items-center gap-4'>
                      <button
                        type='button'
                        disabled={guests <= 1}
                        onClick={() => setGuests((g) => Math.max(1, g - 1))}
                        className='w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none cursor-pointer'
                      >
                        <Minus className='w-4 h-4 text-foreground' />
                      </button>
                      <span className='font-semibold text-sm w-4 text-center text-foreground'>
                        {guests}
                      </span>
                      <button
                        type='button'
                        disabled={guests >= villa.numberOfPeople}
                        onClick={() => setGuests((g) => g + 1)}
                        className='w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none cursor-pointer'
                      >
                        <Plus className='w-4 h-4 text-foreground' />
                      </button>
                    </div>
                  </div>
                  {guests > villa.numberOfPeople && (
                    <p className='text-[10px] text-red-400 mt-1'>
                      Maksymalna liczba gości: {villa.numberOfPeople}
                    </p>
                  )}
                </div>

                {/* Podsumowanie kosztów */}
                {checkIn && checkOut && nightsCount > 0 && (
                  <div>
                    <h3 className='text-xs font-bold text-foreground uppercase tracking-wider mb-2.5'>
                      Podsumowanie
                    </h3>
                    <div className='bg-black/3 dark:bg-white/5 rounded-2xl p-4 space-y-3'>
                      <div className='flex items-center justify-between'>
                        <span className='text-xs text-muted dark:text-muted-foreground/70'>
                          {villa.price} zł × {nightsCount}{" "}
                          {nightsCount === 1 ? "noc" : "noce"}
                        </span>
                        <span className='text-xs font-medium text-foreground'>
                          {villa.price * nightsCount} zł
                        </span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className='text-xs text-muted dark:text-muted-foreground/70'>
                          Czyszczenie
                        </span>
                        <span className='text-xs font-medium text-foreground'>
                          150 zł
                        </span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className='text-xs text-muted dark:text-muted-foreground/70'>
                          Opłata serwisowa
                        </span>
                        <span className='text-xs font-medium text-foreground'>
                          50 zł
                        </span>
                      </div>
                      <div className='border-t border-border/40 pt-3 flex items-center justify-between'>
                        <span className='text-xs font-bold text-foreground'>
                          Razem
                        </span>
                        <span className='text-sm font-extrabold text-foreground'>
                          {totalPrice + 200} zł
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Przycisk rezerwacji */}
              <div className='px-5 py-4 border-t border-border/50'>
                <button
                  onClick={async () => {
                    if (!user || !villa || !checkIn || !checkOut) return

                    // Zapisz dane rezerwacji w sessionStorage i przejdź do płatności
                    const bookingData = {
                      villaId: villa.id,
                      villaName: villa.name,
                      villaImage: villa.image,
                      villaPrice: villa.price,
                      checkIn: checkIn.toISOString(),
                      checkOut: checkOut.toISOString(),
                      guests,
                      nightsCount,
                      totalPrice: totalPrice + 200,
                    }

                    if (typeof window !== "undefined") {
                      sessionStorage.setItem(
                        "pendingBooking",
                        JSON.stringify(bookingData),
                      )
                    }

                    // Zapisz rezerwację w Firestore
                    try {
                      await addBooking(user.uid, {
                        villaId: villa.id,
                        villaName: villa.name,
                        villaImage: villa.image,
                        checkIn: checkIn.toISOString(),
                        checkOut: checkOut.toISOString(),
                        guests,
                        nightsCount,
                        totalPrice: totalPrice + 200,
                        status: "pending",
                      })
                    } catch {
                      // Jeśli Firestore nie działa – rezerwacja mimo to się pokaże
                    }

                    setShowBookingForm(false)
                    router.push(
                      `/payment?villaId=${villa.id}&villaName=${encodeURIComponent(villa.name)}&villaImage=${encodeURIComponent(villa.image)}&villaPrice=${villa.price}&checkIn=${checkIn.toISOString()}&checkOut=${checkOut.toISOString()}&guests=${guests}&nightsCount=${nightsCount}&totalPrice=${totalPrice + 200}`,
                    )
                  }}
                  disabled={
                    !checkIn ||
                    !checkOut ||
                    nightsCount < villa.rules.minimumStay
                  }
                  className='w-full py-3.5 rounded-2xl bg-foreground text-background text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg'
                >
                  {!checkIn || !checkOut
                    ? "Wybierz daty"
                    : nightsCount < villa.rules.minimumStay
                      ? `Min. pobyt: ${villa.rules.minimumStay} noce`
                      : `Kontynuuj – ${totalPrice + 200} zł`}
                </button>
                <p className='text-[9px] text-muted dark:text-muted-foreground/60 text-center mt-2'>
                  Przejdziesz do bezpiecznej płatności
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ========== POTWIERDZENIE REZERWACJI (OVERLAY) ========== */}
      <AnimatePresence>
        {showConfirmation && (
          <>
            {/* Overlay */}
            <motion.div
              role='dialog'
              aria-modal='true'
              aria-label='Potwierdzenie rezerwacji'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className='absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6'
            >
              {/* Karta potwierdzenia */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                transition={{
                  type: "spring",
                  damping: 20,
                  stiffness: 250,
                  delay: 0.1,
                }}
                className='w-full max-w-sm bg-card rounded-3xl shadow-2xl overflow-hidden'
              >
                {/* Górna sekcja z animacją */}
                <div className='pt-10 pb-8 flex flex-col items-center bg-linear-to-b from-emerald-500/10 to-transparent'>
                  {/* Animowany okrąg z checkmarkiem */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      damping: 15,
                      stiffness: 200,
                      delay: 0.2,
                    }}
                    className='w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30'
                  >
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.4, type: "spring", damping: 12 }}
                    >
                      <Check className='w-10 h-10 text-white' strokeWidth={3} />
                    </motion.div>
                  </motion.div>

                  {/* Tekst potwierdzenia */}
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className='text-lg font-extrabold text-foreground mt-5'
                  >
                    Rezerwacja potwierdzona!
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className='text-xs text-muted dark:text-muted-foreground/70 mt-1.5 text-center px-6'
                  >
                    {villa.name}
                  </motion.p>
                </div>

                {/* Szczegóły rezerwacji */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className='px-6 pb-2'
                >
                  <div className='bg-black/3 dark:bg-white/5 rounded-2xl p-4 space-y-3'>
                    <div className='flex items-center justify-between'>
                      <span className='text-[11px] text-muted dark:text-muted-foreground/70'>
                        Termin
                      </span>
                      <span className='text-[11px] font-semibold text-foreground'>
                        {checkIn && checkOut
                          ? `${checkIn.toLocaleDateString("pl-PL", {
                              day: "numeric",
                              month: "short",
                            })} – ${checkOut.toLocaleDateString("pl-PL", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}`
                          : "—"}
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-[11px] text-muted dark:text-muted-foreground/70'>
                        Goście
                      </span>
                      <span className='text-[11px] font-semibold text-foreground'>
                        {guests} osób
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-[11px] text-muted dark:text-muted-foreground/70'>
                        Liczba nocy
                      </span>
                      <span className='text-[11px] font-semibold text-foreground'>
                        {nightsCount} {nightsCount === 1 ? "noc" : "noce"}
                      </span>
                    </div>
                    <div className='border-t border-border/30 pt-3 flex items-center justify-between'>
                      <span className='text-xs font-bold text-foreground'>
                        Łączna kwota
                      </span>
                      <span className='text-sm font-extrabold text-emerald-500'>
                        {totalPrice + 200} zł
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Numer rezerwacji */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className='px-6 py-3 flex items-center justify-center gap-2'
                >
                  <div className='w-1 h-1 rounded-full bg-foreground/20' />
                  <span className='text-[9px] text-muted dark:text-muted-foreground/50 tracking-wider uppercase'>
                    Nr rezerwacji: {reservationNumber}
                  </span>
                  <div className='w-1 h-1 rounded-full bg-foreground/20' />
                </motion.div>

                {/* Przycisk zamknięcia */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className='px-6 pb-6 pt-2'
                >
                  <button
                    onClick={() => {
                      setShowConfirmation(false)
                      setCheckIn(undefined)
                      setCheckOut(undefined)
                      setGuests(2)
                    }}
                    className='w-full py-3.5 rounded-2xl bg-accent text-accent-foreground text-sm font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-accent/20'
                  >
                    Świetnie!
                  </button>
                  <p className='text-[9px] text-muted dark:text-muted-foreground/60 text-center mt-2.5'>
                    Potwierdzenie zostało wysłane na Twój e-mail
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================
// GŁÓWNA STRONA SZCZEGÓŁÓW WILLI
// ============================================================
export default function VillaDetailPage() {
  return (
    <>
      {/* === WIDOK MOBILNY (pełny ekran) === */}
      <div className='flex md:hidden h-screen w-full'>
        <VillaDetailContent />
      </div>

      {/* === WIDOK DESKTOPOWY (symulator telefonu) === */}
      <div className='hidden md:flex min-h-screen w-full items-center justify-center relative overflow-hidden bg-linear-to-br from-[#0a2540] via-[#1a3a5c] to-[#0a2540]'>
        {/* Ozdobne elementy tła */}
        <div className='absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-accent/10 blur-[120px] pointer-events-none' />
        <div className='absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none' />
        <div className='absolute top-[30%] right-[15%] w-[300px] h-[300px] rounded-full bg-accent/5 blur-[80px] pointer-events-none' />

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
              {/* Notch – górna belka telefonu */}
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
              <div className='absolute inset-0 pt-[34px]'>
                <VillaDetailContent />
              </div>
            </div>

            {/* Przyciski ramki */}
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

          {/* Odbłysk szkła */}
          <div
            className='absolute pointer-events-none rounded-[48px] opacity-20'
            style={{
              inset: "8px",
              background:
                "linear-gradient(120deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%)",
            }}
          />
        </div>

        {/* Stopka */}
        <div className='absolute bottom-6 left-1/2 -translate-x-1/2'>
          <span className='text-white/20 text-[10px] tracking-widest uppercase'>
            © 2026 Ville Kołobrzeg
          </span>
        </div>
      </div>
    </>
  )
}
