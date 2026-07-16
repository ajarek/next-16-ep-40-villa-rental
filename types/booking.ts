import type { Timestamp } from "firebase/firestore"

export type BookingData = {
  id: string
  villaId: string
  villaName: string
  villaImage: string
  checkIn: string
  checkOut: string
  guests: number
  nightsCount: number
  totalPrice: number
  createdAt: Timestamp
  status: "pending" | "confirmed" | "cancelled" | "completed"
}

export type BookingFormData = {
  villaId: string
  villaName: string
  villaImage: string
  villaPrice: number
  checkIn: string
  checkOut: string
  guests: number
  nightsCount: number
  totalPrice: number
}

export type PaymentMethod = "card" | "blik" | "apple" | "google" | "przelewy24"

export type PaymentStep = "podsumowanie" | "platnosc" | "potwierdzenie"
