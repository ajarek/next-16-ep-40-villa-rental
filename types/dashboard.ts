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


export type UserRole = "client" | "admin"


export type UserAccountStatus = "active" | "blocked"


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

  hasProfile: boolean
}


export type UserAdminEditInput = {
  email: string
  displayName: string
  phone: string
  role: UserRole
  status: UserAccountStatus
  notes: string
}
