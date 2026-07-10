"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Heart, Star, MapPin } from "lucide-react";
import { motion } from "framer-motion";

type Villa = {
  id: string;
  name: string;
  price: number;
  rating: number;
  reviewsCount: number;
  distanceToBeach: number;
  image: string;
  featured: boolean;
  amenities: string[];
};

export default function FeaturedVillas() {
  const [villas, setVillas] = useState<Villa[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    // Pobranie danych o willach z pliku JSON
    fetch("/data/villas.json")
      .then((res) => res.json())
      .then((data) => setVillas(data))
      .catch((err) => console.error("Błąd podczas pobierania willi:", err));
  }, []);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Nagłówek sekcji */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-bold text-foreground tracking-tight">
          Polecane wille
        </h2>
        <button className="text-xs font-semibold text-accent hover:underline cursor-pointer">
          Zobacz wszystkie &gt;
        </button>
      </div>

      {/* Lista horyzontalna przewijana w bok */}
      <div className="w-full overflow-x-auto flex gap-4 pb-4 px-1 snap-x scrollbar-none">
        {villas.map((villa) => {
          const isFavorite = favorites.includes(villa.id);

          return (
            <div
              key={villa.id}
              className="w-[240px] shrink-0 bg-card text-card-foreground rounded-2xl border border-border/80 shadow-md overflow-hidden snap-start flex flex-col group"
            >
              {/* Sekcja zdjęcia */}
              <div className="relative h-[150px] w-full overflow-hidden">
                <Image
                  src={villa.image}
                  alt={villa.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="240px"
                />

                {/* Przycisk ulubionych (serduszko) */}
                <button
                  onClick={(e) => toggleFavorite(villa.id, e)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-xs flex items-center justify-center shadow-md cursor-pointer focus:outline-none"
                  aria-label="Dodaj do ulubionych"
                >
                  <motion.div
                    animate={{ scale: isFavorite ? [1, 1.3, 1] : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Heart
                      className={`w-4.5 h-4.5 transition-colors ${
                        isFavorite
                          ? "fill-red-500 text-red-500"
                          : "text-muted hover:text-red-500"
                      }`}
                    />
                  </motion.div>
                </button>
              </div>

              {/* Informacje o willi */}
              <div className="p-4 flex flex-col flex-1 gap-2">
                <div className="flex flex-col gap-0.5">
                  <h3 className="font-bold text-sm text-foreground truncate">
                    {villa.name}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-muted">
                    <MapPin className="w-3 h-3 text-accent shrink-0" />
                    <span>{villa.distanceToBeach} m od plaży</span>
                  </div>
                </div>

                {/* Cena i ocena */}
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/40">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-xs text-muted">od</span>
                    <span className="text-sm font-bold text-foreground">
                      {villa.price} zł
                    </span>
                    <span className="text-[10px] text-muted">/ noc</span>
                  </div>

                  <div className="flex items-center gap-0.5">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-bold text-foreground">
                      {villa.rating}
                    </span>
                    <span className="text-[10px] text-muted">
                      ({villa.reviewsCount})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
