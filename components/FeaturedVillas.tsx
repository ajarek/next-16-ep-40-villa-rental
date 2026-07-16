"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Star, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import type { Villa } from "@/types/villa"

export default function FeaturedVillas() {
  const [villas, setVillas] = useState<Villa[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)

  const containerRef = useRef<HTMLDivElement>(null)

  const CARD_WIDTH = 240
  const CARD_GAP = 16

  useEffect(() => {
    fetch("/data/villas.json")
      .then((res) => res.json())
      .then((data) => setVillas(data))
      .catch((err) => console.error("Błąd podczas pobierania willi:", err))
  }, [])

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
      }
    }
    updateWidth()
    window.addEventListener("resize", updateWidth)
    return () => window.removeEventListener("resize", updateWidth)
  }, [])

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id],
    )
  }

  const totalCards = villas.length
  const snapWidth = CARD_WIDTH + CARD_GAP
  const maxOffset = Math.max(
    0,
    totalCards * snapWidth - containerWidth - CARD_GAP,
  )
  const maxIndex = Math.max(
    0,
    totalCards - Math.floor(containerWidth / snapWidth),
  )

  const getOffsetForIndex = useCallback(
    (index: number) => {
      const offset = index * snapWidth
      return -Math.min(offset, maxOffset)
    },
    [snapWidth, maxOffset],
  )

  const goTo = (index: number) => {
    const clamped = Math.max(0, Math.min(index, maxIndex))
    setCurrentIndex(clamped)
  }

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number }; velocity: { x: number } },
  ) => {
    const velocityThreshold = 300
    let newIndex = currentIndex

    if (Math.abs(info.velocity.x) > velocityThreshold) {
      newIndex += info.velocity.x < 0 ? 1 : -1
    } else {
      const movedBy = -info.offset.x
      newIndex = Math.round(movedBy / snapWidth)
    }

    goTo(newIndex)
  }

  return (
    <div className='w-full flex flex-col gap-4'>
      {/* Nagłówek sekcji */}
      <div className='flex items-center justify-between px-1'>
        <h2 className='text-lg font-bold text-foreground tracking-tight'>
          Polecane wille
        </h2>
        <Link
          href='/villas'
          className='text-xs font-semibold text-foreground hover:underline cursor-pointer'
        >
          Zobacz wszystkie &gt;
        </Link>
      </div>

      {/* Karuzela */}
      <div ref={containerRef} className='relative w-full overflow-hidden px-1'>
        {/* Przycisk w lewo */}
        {currentIndex > 0 && (
          <button
            onClick={() => goTo(currentIndex - 1)}
            className='absolute left-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-card/90 backdrop-blur-sm border border-border/60 shadow-lg flex items-center justify-center hover:bg-card transition-colors cursor-pointer'
            aria-label='Poprzednia'
          >
            <ChevronLeft className='w-4 h-4 text-foreground' />
          </button>
        )}

        {/* Przycisk w prawo */}
        {currentIndex < maxIndex && (
          <button
            onClick={() => goTo(currentIndex + 1)}
            className='absolute right-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-card/90 backdrop-blur-sm border border-border/60 shadow-lg flex items-center justify-center hover:bg-card transition-colors cursor-pointer'
            aria-label='Następna'
          >
            <ChevronRight className='w-4 h-4 text-foreground' />
          </button>
        )}

        {/* Płynny przewijany kontener */}
        <motion.div
          className='flex gap-4 pb-4'
          drag='x'
          dragConstraints={{
            left: -(totalCards * snapWidth - containerWidth - CARD_GAP),
            right: 0,
          }}
          dragElastic={0.15}
          onDragEnd={handleDragEnd}
          animate={{ x: getOffsetForIndex(currentIndex) }}
          transition={{ type: "spring", stiffness: 300, damping: 32 }}
          style={{ touchAction: "pan-y" }}
        >
          {villas.map((villa) => {
            const isFavorite = favorites.includes(villa.id)

            return (
              <Link
                key={villa.id}
                href={`/villas/${villa.id}`}
                className='block w-[240px] shrink-0'
              >
                <motion.div className='bg-card text-card-foreground rounded-2xl border border-border/80 shadow-md overflow-hidden flex flex-col group'>
                  {/* Sekcja zdjęcia */}
                  <div className='relative h-[150px] w-full overflow-hidden'>
                    <Image
                      src={villa.image}
                      alt={villa.name}
                      fill
                      className='object-cover group-hover:scale-105 transition-transform duration-300'
                      sizes='240px'
                    />

                    {/* Przycisk ulubionych (serduszko) */}
                    <button
                      onClick={(e) => toggleFavorite(villa.id, e)}
                      className='absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-xs flex items-center justify-center shadow-md cursor-pointer focus:outline-none'
                      aria-label='Dodaj do ulubionych'
                    >
                      <motion.div
                        animate={{ scale: isFavorite ? [1, 1.3, 1] : 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Heart
                          className={`w-4.5 h-4.5 transition-colors ${
                            isFavorite
                              ? "fill-red-500 text-red-500"
                              : "text-muted dark:text-muted-foreground/70 hover:text-red-500"
                          }`}
                        />
                      </motion.div>
                    </button>
                  </div>

                  {/* Informacje o willi */}
                  <div className='p-4 flex flex-col flex-1 gap-2'>
                    <div className='flex flex-col gap-0.5'>
                      <h3 className='font-bold text-sm text-foreground truncate'>
                        {villa.name}
                      </h3>
                      <div className='flex items-center gap-1 text-[11px] text-muted dark:text-muted-foreground/70'>
                        <MapPin className='w-3 h-3 text-accent shrink-0' />
                        <span>{villa.distanceToBeach} m od plaży</span>
                      </div>
                    </div>

                    {/* Cena i ocena */}
                    <div className='flex items-center justify-between mt-auto pt-2 border-t border-border/40'>
                      <div className='flex items-baseline gap-0.5'>
                        <span className='text-xs text-muted dark:text-muted-foreground/70'>
                          od
                        </span>
                        <span className='text-sm font-bold text-foreground'>
                          {villa.price} zł
                        </span>
                        <span className='text-[10px] text-muted dark:text-muted-foreground/70'>
                          / noc
                        </span>
                      </div>

                      <div className='flex items-center gap-0.5'>
                        <Star className='w-3.5 h-3.5 fill-yellow-400 text-yellow-400' />
                        <span className='text-xs font-bold text-foreground'>
                          {villa.rating}
                        </span>
                        <span className='text-[10px] text-muted dark:text-muted-foreground/70'>
                          ({villa.reviewsCount})
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            )
          })}
        </motion.div>

        {/* Kropki nawigacyjne */}
        {villas.length > 1 && (
          <div className='flex items-center justify-center gap-1.5 pb-1'>
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 cursor-pointer ${
                  i === currentIndex
                    ? "w-6 h-2 bg-accent"
                    : "w-2 h-2 bg-border hover:bg-muted-foreground/50"
                }`}
                aria-label={`Przejdź do ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
