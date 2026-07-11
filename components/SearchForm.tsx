"use client"

import React, { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  MapPin,
  Users,
  ChevronDown,
  Search,
  Plus,
  Minus,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { DatePicker } from "./Picker"

export default function SearchForm() {
  const router = useRouter()
  const [location, setLocation] = useState("Kołobrzeg, Polska")
  const [checkIn, setCheckIn] = useState<Date | undefined>(new Date(2025, 5, 15))
  const [checkOut, setCheckOut] = useState<Date | undefined>(new Date(2025, 5, 22))
  const [guests, setGuests] = useState(2)

  // Stany otwarcia dropdownów
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false)

  const locationRef = useRef<HTMLDivElement>(null)
  const guestsRef = useRef<HTMLDivElement>(null)

  // Zamykanie dropdownów przy kliknięciu poza nimi
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        locationRef.current &&
        !locationRef.current.contains(event.target as Node)
      ) {
        setShowLocationDropdown(false)
      }
      if (
        guestsRef.current &&
        !guestsRef.current.contains(event.target as Node)
      ) {
        setShowGuestsDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const locations = [
    "Kołobrzeg, Polska",
    "Kołobrzeg - Centrum",
    "Kołobrzeg - Uzdrowisko",
    "Kołobrzeg - Podczele",
    "Kołobrzeg - Grzybowo (okolice)",
    "Kołobrzeg - Port",
  ]

  return (
    <div className='w-full bg-card text-card-foreground rounded-3xl p-5 shadow-xl border border-border/80 flex flex-col gap-4'>
      {/* Pole 1: Lokalizacja */}
      <div className='relative' ref={locationRef}>
        <div
          onClick={() => setShowLocationDropdown(!showLocationDropdown)}
          className='flex items-center gap-4 px-4 py-3 rounded-2xl bg-black/2 dark:bg-white/2 border border-border/60 hover:border-accent/60 transition-colors cursor-pointer'
        >
          <MapPin className='w-5 h-5 text-accent dark:text-accent-foreground shrink-0' />
          <div className='flex flex-col'>
            <span className='text-[10px] font-bold text-muted uppercase tracking-wider'>
              Lokalizacja
            </span>
            <span className='text-sm font-semibold text-foreground'>
              {location}
            </span>
          </div>
        </div>

        <AnimatePresence>
          {showLocationDropdown && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className='absolute left-0 right-0 top-full mt-2 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden'
            >
              {locations.map((loc) => (
                <div
                  key={loc}
                  onClick={() => {
                    setLocation(loc)
                    setShowLocationDropdown(false)
                  }}
                  className='px-4 py-3 text-sm hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors text-foreground flex items-center gap-2'
                >
                  <MapPin className='w-4 h-4 text-muted' />
                  {loc}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pole 2 i 3: Daty Przyjazd / Wyjazd (w jednym rzędzie) */}
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

      {/* Pole 4: Goście */}
      <div className='relative' ref={guestsRef}>
        <div
          onClick={() => setShowGuestsDropdown(!showGuestsDropdown)}
          className='flex items-center justify-between px-4 py-3 rounded-2xl bg-black/2 dark:bg-white/2 border border-border/60 hover:border-accent/60 transition-colors cursor-pointer'
        >
          <div className='flex items-center gap-4'>
            <Users className='w-5 h-5 text-accent dark:text-accent-foreground shrink-0' />
            <div className='flex flex-col'>
              <span className='text-[10px] font-bold text-muted uppercase tracking-wider'>
                Goście
              </span>
              <span className='text-sm font-semibold text-foreground'>
                {guests}{" "}
                {guests === 1 ? "osoba" : guests < 5 ? "osoby" : "osób"}
              </span>
            </div>
          </div>
          <ChevronDown className='w-5 h-5 text-muted transition-transform duration-200' />
        </div>

        <AnimatePresence>
          {showGuestsDropdown && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className='absolute left-0 right-0 top-full mt-2 bg-card border border-border rounded-2xl p-4 shadow-xl z-50 flex items-center justify-between'
            >
              <span className='text-sm font-medium text-foreground'>
                Liczba osób
              </span>
              <div className='flex items-center gap-4'>
                <button
                  type='button'
                  disabled={guests <= 1}
                  onClick={() => setGuests((g) => g - 1)}
                  className='w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none cursor-pointer'
                >
                  <Minus className='w-4 h-4 text-foreground' />
                </button>
                <span className='font-semibold text-sm w-4 text-center text-foreground'>
                  {guests}
                </span>
                <button
                  type='button'
                  disabled={guests >= 10}
                  onClick={() => setGuests((g) => g + 1)}
                  className='w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none cursor-pointer'
                >
                  <Plus className='w-4 h-4 text-foreground' />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Przycisk Szukaj – nawiguje do katalogu z parametrami */}
      <Button
        variant='default'
        size='default'
        onClick={() => {
          const params = new URLSearchParams()
          // Pomijamy lokalizację, jeśli to domyślna ("wszędzie")
          const isDefaultLocation = location === "Kołobrzeg, Polska"
          if (!isDefaultLocation) {
            // Normalizuj: "Kołobrzeg - Centrum" → "Kołobrzeg-Centrum"
            const normalizedLocation = location
              .replace(/^Kołobrzeg,?\s*/i, "Kołobrzeg-")
              .replace(/\s*-\s*/g, "-")
              .replace(/\(.*\)/, "")
              .trim()
            if (normalizedLocation) params.set("location", normalizedLocation)
          }
          params.set("guests", guests.toString())
          router.push(`/villas?${params.toString()}`)
        }}
        className='w-full py-4 text-sm font-semibold rounded-2xl flex items-center justify-center gap-2 bg-primary hover:bg-primary/95 text-white dark:bg-primary dark:hover:bg-primary/90 mt-2 cursor-pointer'
      >
        <Search className='w-4 h-4' />
        Szukaj willi
      </Button>
    </div>
  )
}
