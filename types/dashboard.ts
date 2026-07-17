import type { BookingStatus } from "./booking"

export type DashboardTab =
  | "przeglad"
  | "rezerwacje"
  | "ulubione"
  | "uzytkownicy"

export type FavoriteAdminRecord = {
  docId: string
  userId: string
  villaId: string
  name: string
  price: number
  rating: number
  image: string
  location: string
  distanceToBeach: number
  numberOfPeople: number
  status: string
}

export type BookingStatusOption = {
  value: BookingStatus
  label: string
  className: string
}

/** Rola użytkownika w panelu administratora */
export type UserRole = "client" | "admin"

/** Status konta w panelu administratora */
export type UserAccountStatus = "active" | "blocked"

/** Profil użytkownika przechowywany w kolekcji Firestore `users` */
export type UserAdminRecord = {
  uid: string
  email: string
  displayName: string
  phone: string
  role: UserRole
  status: UserAccountStatus
  notes: string
  bookingsCount: number
  favoritesCount: number
  /** Czy dokument istnieje w kolekcji `users` */
  hasProfile: boolean
}

/** Pola edytowalne w formularzu użytkownika */
export type UserAdminEditInput = {
  email: string
  displayName: string
  phone: string
  role: UserRole
  status: UserAccountStatus
  notes: string
}
