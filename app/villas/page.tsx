"use client"

import React, { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Search,
  SlidersHorizontal,
  X,
  Star,
  MapPin,
  Heart,
  ArrowUpDown,
  ChevronDown,
  Bath,
  Waves,
  Wind,
  Car,
  Snowflake,
  Wifi,
  Flame,
  Sun,
  ArrowLeft,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import BottomNav from "@/components/BottomNav"
import type { Villa, SortOption, Filters } from "@/types/villa"

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

const allAmenities = [
  "Basen",
  "Sauna",
  "Parking",
  "Klimatyzacja",
  "Wi-Fi",
  "Jacuzzi",
  "Widok na morze",
  "Taras",
  "Zwierzęta akceptowane",
  "Grill",
]

const locations = [
  "Kołobrzeg-Uzdrowisko",
  "Kołobrzeg-Centrum",
  "Kołobrzeg-Podczele",
  "Kołobrzeg-Port",
]

function VillasCatalogContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [villas, setVillas] = useState<Villa[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("popularne")
  const [showSort, setShowSort] = useState(false)
  const [filters, setFilters] = useState<Filters>(() => ({
    priceMin: 0,
    priceMax: 2000,
    amenities: [],
    location: searchParams?.get("location") || "",
  }))
  const [minGuests, setMinGuests] = useState<number>(() => {
    const guests = searchParams?.get("guests")
    return guests ? Number(guests) : 0
  })
  const [statusFilter, setStatusFilter] = useState<string>(
    () => searchParams?.get("status") || "",
  )

  // Dostosowanie stanu podczas renderowania (adjust state during render) w przypadku zmiany parametrów wyszukiwania
  const [prevParams, setPrevParams] = useState(searchParams)
  if (searchParams !== prevParams) {
    setPrevParams(searchParams)
    const urlLocation = searchParams?.get("location")
    const urlGuests = searchParams?.get("guests")
    const urlStatus = searchParams?.get("status")
    if (urlLocation) {
      setFilters((prev) => ({ ...prev, location: urlLocation }))
    }
    if (urlGuests) {
      setMinGuests(Number(urlGuests))
    }
    if (urlStatus) {
      setStatusFilter(urlStatus)
    }
  }

  useEffect(() => {
    fetch("/data/villas.json")
      .then((res) => res.json())
      .then((data) => setVillas(data))
      .catch((err) => console.error("Błąd podczas pobierania willi:", err))
  }, [])

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id],
    )
  }

  const toggleAmenityFilter = (amenity: string) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  const clearFilters = () => {
    setFilters({ priceMin: 0, priceMax: 2000, amenities: [], location: "" })
    setSearchQuery("")
    setMinGuests(0)
    setStatusFilter("")
  }

  const activeFilterCount =
    (filters.location ? 1 : 0) +
    filters.amenities.length +
    (filters.priceMin > 0 || filters.priceMax < 2000 ? 1 : 0) +
    (statusFilter ? 1 : 0)

  // Filtrowanie i sortowanie
  const filteredVillas = useMemo(() => {
    let result = [...villas]

    // Wyszukiwanie po nazwie
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter((v) => v.name.toLowerCase().includes(q))
    }

    // Filtr lokalizacji
    if (filters.location) {
      result = result.filter((v) => v.location === filters.location)
    }

    // Filtr ceny
    result = result.filter(
      (v) => v.price >= filters.priceMin && v.price <= filters.priceMax,
    )

    // Filtr udogodnień
    if (filters.amenities.length > 0) {
      result = result.filter((v) =>
        filters.amenities.every((a) => v.amenities.includes(a)),
      )
    }

    // Filtr liczby gości
    if (minGuests > 0) {
      result = result.filter((v) => v.numberOfPeople >= minGuests)
    }

    // Filtr statusu (free / busy)
    if (statusFilter) {
      result = result.filter((v) => v.status === statusFilter)
    }

    // Sortowanie
    switch (sortBy) {
      case "cena-rosnąco":
        result.sort((a, b) => a.price - b.price)
        break
      case "cena-malejąco":
        result.sort((a, b) => b.price - a.price)
        break
      case "ocena":
        result.sort((a, b) => b.rating - a.rating)
        break
      case "odległość":
        result.sort((a, b) => a.distanceToBeach - b.distanceToBeach)
        break
      default:
        // popularne - domyślnie po ocenie i liczbie opinii
        result.sort(
          (a, b) => b.rating * b.reviewsCount - a.rating * a.reviewsCount,
        )
    }

    return result
  }, [villas, searchQuery, filters, sortBy, minGuests, statusFilter])

  return (
    <div className='relative flex flex-col h-full w-full overflow-hidden bg-background'>
      {/* ========== NAGŁÓWEK ========== */}
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
              Katalog willi
            </h1>
          </div>
          <button
            onClick={() => setShowFilters(true)}
            className='relative p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer'
            aria-label='Filtry'
          >
            <SlidersHorizontal className='w-5 h-5 text-foreground' />
            {activeFilterCount > 0 && (
              <span className='absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-accent-foreground text-[9px] font-bold rounded-full flex items-center justify-center'>
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Pasek wyszukiwania */}
        <div className='px-4 pb-3'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted dark:text-muted-foreground/70' />
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Szukaj willi po nazwie...'
              className='w-full pl-9 pr-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-border/60 text-sm text-foreground placeholder:text-muted dark:placeholder:text-muted-foreground/70 focus:outline-none focus:border-accent/60 transition-colors'
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className='absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer'
              >
                <X className='w-4 h-4 text-muted dark:text-muted-foreground/70 hover:text-foreground transition-colors' />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ========== GŁÓWNA TREŚĆ ========== */}
      <main className='flex-1 overflow-y-auto overscroll-y-contain'>
        {/* Aktywne filtry - chipsy */}
        {activeFilterCount > 0 && (
          <div className='flex items-center gap-2 px-4 py-3 overflow-x-auto scrollbar-none border-b border-border/30'>
            {filters.location && (
              <span className='shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 text-accent-foreground text-xs font-medium rounded-full'>
                <MapPin className='w-3 h-3' />
                {filters.location}
                <button
                  onClick={() => setFilters((p) => ({ ...p, location: "" }))}
                  className='ml-0.5 hover:opacity-70 cursor-pointer'
                >
                  <X className='w-3 h-3' />
                </button>
              </span>
            )}
            {filters.amenities.map((a) => (
              <span
                key={a}
                className='shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 text-accent-foreground text-xs font-medium rounded-full'
              >
                {a}
                <button
                  onClick={() => toggleAmenityFilter(a)}
                  className='ml-0.5 hover:opacity-70 cursor-pointer'
                >
                  <X className='w-3 h-3' />
                </button>
              </span>
            ))}
            {(filters.priceMin > 0 || filters.priceMax < 2000) && (
              <span className='shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 text-accent-foreground text-xs font-medium rounded-full'>
                {filters.priceMin}–{filters.priceMax} zł
                <button
                  onClick={() =>
                    setFilters((p) => ({ ...p, priceMin: 0, priceMax: 2000 }))
                  }
                  className='ml-0.5 hover:opacity-70 cursor-pointer'
                >
                  <X className='w-3 h-3' />
                </button>
              </span>
            )}
            {statusFilter && (
              <span className='shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 text-accent-foreground text-xs font-medium rounded-full'>
                {statusFilter === "free" ? "Dostępna" : "Zajęta"}
                <button
                  onClick={() => setStatusFilter("")}
                  className='ml-0.5 hover:opacity-70 cursor-pointer'
                >
                  <X className='w-3 h-3' />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className='shrink-0 text-xs text-muted dark:text-muted-foreground/70 hover:text-foreground underline cursor-pointer whitespace-nowrap'
            >
              Wyczyść wszystko
            </button>
          </div>
        )}

        {/* Sortowanie i liczba wyników */}
        <div className='flex items-center justify-between px-4 py-3'>
          <span className='text-xs text-muted dark:text-muted-foreground/70'>
            {filteredVillas.length}{" "}
            {filteredVillas.length === 1 ? "willa" : "willi"}
          </span>

          <div className='relative'>
            <button
              onClick={() => setShowSort(!showSort)}
              className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/60 text-xs font-medium text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer'
            >
              <ArrowUpDown className='w-3.5 h-3.5' />
              {sortBy === "popularne"
                ? "Najpopularniejsze"
                : sortBy === "cena-rosnąco"
                  ? "Cena ↑"
                  : sortBy === "cena-malejąco"
                    ? "Cena ↓"
                    : sortBy === "ocena"
                      ? "Najwyżej oceniane"
                      : "Najbliżej plaży"}
              <ChevronDown className='w-3 h-3 text-muted dark:text-muted-foreground/70' />
            </button>

            <AnimatePresence>
              {showSort && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className='absolute right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-xl z-50 min-w-[180px] overflow-hidden'
                >
                  {(
                    [
                      { value: "popularne", label: "Najpopularniejsze" },
                      { value: "cena-rosnąco", label: "Cena od najniższej" },
                      { value: "cena-malejąco", label: "Cena od najwyższej" },
                      { value: "ocena", label: "Najwyżej oceniane" },
                      { value: "odległość", label: "Najbliżej plaży" },
                    ] as { value: SortOption; label: string }[]
                  ).map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value)
                        setShowSort(false)
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                        sortBy === option.value
                          ? "bg-accent/10 text-accent-foreground font-medium"
                          : "text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Siatka willi */}
        <div className='px-4 pb-24'>
          {filteredVillas.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-16 gap-3'>
              <div className='w-16 h-16 rounded-full bg-muted flex items-center justify-center'>
                <Search className='w-7 h-7 text-muted-foreground' />
              </div>
              <p className='text-sm font-medium text-foreground'>
                Brak willi spełniających kryteria
              </p>
              <p className='text-xs text-muted dark:text-muted-foreground/70'>
                Spróbuj zmienić filtry lub wyszukiwanie
              </p>
              <button
                onClick={clearFilters}
                className='mt-2 px-5 py-2 bg-accent text-accent-foreground text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity cursor-pointer'
              >
                Wyczyść filtry
              </button>
            </div>
          ) : (
            <div className='grid grid-cols-2 gap-3'>
              {filteredVillas.map((villa, idx) => {
                const isFavorite = favorites.includes(villa.id)

                return (
                  <motion.div
                    key={villa.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                  >
                    <Link
                      href={`/villas/${villa.id}`}
                      className='block bg-card text-card-foreground rounded-2xl border border-border/80 shadow-sm overflow-hidden group hover:shadow-md hover:border-accent/40 transition-all duration-200'
                    >
                      {/* Zdjęcie */}
                      <div className='relative h-[120px] w-full overflow-hidden'>
                        <Image
                          src={villa.image}
                          alt={villa.name}
                          fill
                          className='object-cover group-hover:scale-105 transition-transform duration-300'
                          sizes='(max-width: 480px) 50vw, 200px'
                        />
                        <button
                          onClick={(e) => toggleFavorite(villa.id, e)}
                          className='absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-xs flex items-center justify-center shadow-sm cursor-pointer focus:outline-none'
                          aria-label='Dodaj do ulubionych'
                        >
                          <Heart
                            className={`w-3.5 h-3.5 transition-colors ${
                              isFavorite
                                ? "fill-red-500 text-red-500"
                                : "text-muted dark:text-muted-foreground/70 hover:text-red-400"
                            }`}
                          />
                        </button>

                        {/* Cena na zdjęciu */}
                        <div className='absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-lg'>
                          <span className='text-white text-xs font-bold'>
                            {villa.price} zł
                          </span>
                          <span className='text-white/70 text-[9px]'>/noc</span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className='p-3 flex flex-col gap-1.5'>
                        <h3 className='font-bold text-xs text-foreground truncate leading-tight'>
                          {villa.name}
                        </h3>

                        <div className='flex items-center gap-1 text-[10px] text-muted dark:text-muted-foreground/70'>
                          <MapPin className='w-2.5 h-2.5 text-accent shrink-0' />
                          <span>{villa.distanceToBeach}m od plaży</span>
                        </div>

                        {/* Udogodnienia */}
                        <div className='flex flex-wrap gap-1'>
                          {villa.amenities.slice(0, 3).map((amenity) => {
                            const Icon = amenityIcons[amenity] || Sun
                            return (
                              <span
                                key={amenity}
                                className='inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-black/3 dark:bg-white/5 rounded-md text-[9px] text-muted dark:text-muted-foreground/70'
                              >
                                <Icon className='w-2.5 h-2.5' />
                                {amenity}
                              </span>
                            )
                          })}
                          {villa.amenities.length > 3 && (
                            <span className='text-[9px] text-muted dark:text-muted-foreground/70'>
                              +{villa.amenities.length - 3}
                            </span>
                          )}
                        </div>

                        {/* Ocena */}
                        <div className='flex items-center gap-1 mt-0.5'>
                          <Star className='w-3 h-3 fill-yellow-400 text-yellow-400' />
                          <span className='text-[10px] font-bold text-foreground'>
                            {villa.rating}
                          </span>
                          <span className='text-[9px] text-muted dark:text-muted-foreground/70'>
                            ({villa.reviewsCount})
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* ========== PANEL FILTRÓW ========== */}
      <AnimatePresence>
        {showFilters && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className='absolute inset-0 bg-black/40 z-50'
            />

            {/* Panel */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className='absolute bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl shadow-2xl max-h-[80vh] flex flex-col'
            >
              {/* Header panelu */}
              <div className='flex items-center justify-between px-5 pt-5 pb-3 border-b border-border/50'>
                <h2 className='text-base font-bold text-foreground'>Filtry</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className='p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer'
                >
                  <X className='w-5 h-5 text-muted dark:text-muted-foreground/70' />
                </button>
              </div>

              {/* Treść filtrów */}
              <div className='flex-1 overflow-y-auto px-5 py-4 space-y-5'>
                {/* Lokalizacja */}
                <div>
                  <h3 className='text-xs font-bold text-foreground uppercase tracking-wider mb-2.5'>
                    Lokalizacja
                  </h3>
                  <div className='flex flex-wrap gap-2'>
                    {locations.map((loc) => (
                      <button
                        key={loc}
                        onClick={() =>
                          setFilters((p) => ({
                            ...p,
                            location: p.location === loc ? "" : loc,
                          }))
                        }
                        className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          filters.location === loc
                            ? "bg-accent text-accent-foreground shadow-sm"
                            : "bg-black/5 dark:bg-white/5 text-foreground hover:bg-black/10 dark:hover:bg-white/10"
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Zakres ceny */}
                <div>
                  <h3 className='text-xs font-bold text-foreground uppercase tracking-wider mb-2.5'>
                    Cena za noc
                  </h3>
                  <div className='flex items-center gap-3'>
                    <div className='flex-1'>
                      <label className='text-[10px] text-muted dark:text-muted-foreground/70 block mb-1'>
                        Od
                      </label>
                      <input
                        type='number'
                        value={filters.priceMin}
                        onChange={(e) =>
                          setFilters((p) => ({
                            ...p,
                            priceMin: Number(e.target.value),
                          }))
                        }
                        className='w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-border/60 text-sm text-foreground focus:outline-none focus:border-accent/60'
                        min={0}
                        max={2000}
                        step={50}
                      />
                    </div>
                    <span className='text-muted dark:text-muted-foreground/70 mt-5'>
                      –
                    </span>
                    <div className='flex-1'>
                      <label className='text-[10px] text-muted dark:text-muted-foreground/70 block mb-1'>
                        Do
                      </label>
                      <input
                        type='number'
                        value={filters.priceMax}
                        onChange={(e) =>
                          setFilters((p) => ({
                            ...p,
                            priceMax: Number(e.target.value),
                          }))
                        }
                        className='w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-border/60 text-sm text-foreground focus:outline-none focus:border-accent/60'
                        min={0}
                        max={2000}
                        step={50}
                      />
                    </div>
                  </div>
                  {/* Zakres na sliderze */}
                  <div className='mt-3 px-1'>
                    <input
                      type='range'
                      min={0}
                      max={2000}
                      step={50}
                      value={filters.priceMax}
                      onChange={(e) =>
                        setFilters((p) => ({
                          ...p,
                          priceMax: Number(e.target.value),
                        }))
                      }
                      className='w-full accent-accent'
                    />
                    <div className='flex justify-between text-[10px] text-muted dark:text-muted-foreground/70'>
                      <span>0 zł</span>
                      <span>{filters.priceMax} zł</span>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <h3 className='text-xs font-bold text-foreground uppercase tracking-wider mb-2.5'>
                    Status
                  </h3>
                  <div className='flex gap-2'>
                    <button
                      onClick={() =>
                        setStatusFilter((prev) =>
                          prev === "free" ? "" : "free",
                        )
                      }
                      className={`flex-1 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        statusFilter === "free"
                          ? "bg-accent text-accent-foreground shadow-sm"
                          : "bg-black/5 dark:bg-white/5 text-foreground hover:bg-black/10 dark:hover:bg-white/10"
                      }`}
                    >
                      ✓ Dostępna
                    </button>
                    <button
                      onClick={() =>
                        setStatusFilter((prev) =>
                          prev === "busy" ? "" : "busy",
                        )
                      }
                      className={`flex-1 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        statusFilter === "busy"
                          ? "bg-accent text-accent-foreground shadow-sm"
                          : "bg-black/5 dark:bg-white/5 text-foreground hover:bg-black/10 dark:hover:bg-white/10"
                      }`}
                    >
                      ✕ Zajęta
                    </button>
                  </div>
                </div>

                {/* Udogodnienia */}
                <div>
                  <h3 className='text-xs font-bold text-foreground uppercase tracking-wider mb-2.5'>
                    Udogodnienia
                  </h3>
                  <div className='grid grid-cols-2 gap-2'>
                    {allAmenities.map((amenity) => {
                      const Icon = amenityIcons[amenity] || Sun
                      const isActive = filters.amenities.includes(amenity)
                      return (
                        <button
                          key={amenity}
                          onClick={() => toggleAmenityFilter(amenity)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                            isActive
                              ? "bg-accent/10 text-accent-foreground border border-accent/30"
                              : "bg-black/5 dark:bg-white/5 text-foreground border border-transparent hover:bg-black/10 dark:hover:bg-white/10"
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 ${
                              isActive
                                ? "text-accent"
                                : "text-muted dark:text-muted-foreground/70"
                            }`}
                          />
                          {amenity}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Przyciski akcji */}
              <div className='px-5 py-4 border-t border-border/50 flex items-center gap-3'>
                <button
                  onClick={() => {
                    clearFilters()
                    setShowFilters(false)
                  }}
                  className='flex-1 py-3 rounded-xl border border-border/60 text-sm font-medium text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer'
                >
                  Wyczyść
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className='flex-1 py-3 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer'
                >
                  Pokaż wyniki ({filteredVillas.length})
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ========== DOLNA NAWIGACJA ========== */}
      <BottomNav />
    </div>
  )
}

// ============================================================
// Główna strona katalogu – otacza zawartość ramką telefonu na desktopie
// ============================================================
export default function VillasCatalogPage() {
  return (
    <>
      {/* === WIDOK MOBILNY (pełny ekran) === */}
      <div className='flex md:hidden h-screen w-full'>
        <VillasCatalogContent />
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
              <div className='absolute inset-0 pt-[34px]'>
                <VillasCatalogContent />
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
