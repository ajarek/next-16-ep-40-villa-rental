import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  updateDoc,
  collection,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "./firebase"
import type { VillaData } from "@/types/villa"
import type { BookingData, BookingStatus } from "@/types/booking"
import type {
  FavoriteAdminRecord,
  UserAdminEditInput,
  UserAdminRecord,
  UserAccountStatus,
  UserRole,
} from "@/types/dashboard"

const FAVORITES_COLLECTION = "favorites"

export async function addFavorite(
  userId: string,
  villaId: string,
  villaData: VillaData,
): Promise<void> {
  if (!db) throw new Error("Firestore nie jest dostępny")
  await setDoc(doc(db, FAVORITES_COLLECTION, `${userId}_${villaId}`), {
    userId,
    villaId,
    ...villaData,
    createdAt: serverTimestamp(),
  })
}

export async function removeFavorite(
  userId: string,
  villaId: string,
): Promise<void> {
  if (!db) throw new Error("Firestore nie jest dostępny")
  await deleteDoc(doc(db, FAVORITES_COLLECTION, `${userId}_${villaId}`))
}

export async function getFavorites(userId: string): Promise<VillaData[]> {
  if (!db) return []
  const q = query(
    collection(db, FAVORITES_COLLECTION),
    where("userId", "==", userId),
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => d.data() as VillaData)
}

export async function isFavorite(
  userId: string,
  villaId: string,
): Promise<boolean> {
  if (!db) return false
  const snap = await getDoc(
    doc(db, FAVORITES_COLLECTION, `${userId}_${villaId}`),
  )
  return snap.exists()
}

const BOOKINGS_COLLECTION = "bookings"

export async function addBooking(
  userId: string,
  booking: Omit<BookingData, "id" | "createdAt">,
): Promise<string> {
  if (!db) throw new Error("Firestore nie jest dostępny")
  const ref = doc(collection(db, BOOKINGS_COLLECTION))
  await setDoc(ref, {
    ...booking,
    id: ref.id,
    userId,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function getBookings(userId: string): Promise<BookingData[]> {
  if (!db) return []
  const q = query(
    collection(db, BOOKINGS_COLLECTION),
    where("userId", "==", userId),
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => d.data() as BookingData)
}

export async function getAllBookings(): Promise<BookingData[]> {
  if (!db) return []
  const snapshot = await getDocs(collection(db, BOOKINGS_COLLECTION))
  const bookings = snapshot.docs.map((d) => {
    const data = d.data() as BookingData
    return { ...data, id: data.id || d.id }
  })
  return bookings.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() ?? 0
    const bTime = b.createdAt?.toMillis?.() ?? 0
    return bTime - aTime
  })
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
): Promise<void> {
  if (!db) throw new Error("Firestore nie jest dostępny")
  await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingId), { status })
}

export async function deleteBooking(bookingId: string): Promise<void> {
  if (!db) throw new Error("Firestore nie jest dostępny")
  await deleteDoc(doc(db, BOOKINGS_COLLECTION, bookingId))
}

export async function getAllFavorites(): Promise<FavoriteAdminRecord[]> {
  if (!db) return []
  const snapshot = await getDocs(collection(db, FAVORITES_COLLECTION))
  return snapshot.docs.map((d) => {
    const data = d.data()
    return {
      docId: d.id,
      userId: (data.userId as string) ?? "",
      villaId: (data.villaId as string) ?? (data.id as string) ?? "",
      name: (data.name as string) ?? "—",
      price: (data.price as number) ?? 0,
      rating: (data.rating as number) ?? 0,
      image: (data.image as string) ?? "/images/hero_bg.png",
      location: (data.location as string) ?? "",
      distanceToBeach: (data.distanceToBeach as number) ?? 0,
      numberOfPeople: (data.numberOfPeople as number) ?? 0,
      status: (data.status as string) ?? "free",
    }
  })
}

export async function deleteFavoriteById(docId: string): Promise<void> {
  if (!db) throw new Error("Firestore nie jest dostępny")
  await deleteDoc(doc(db, FAVORITES_COLLECTION, docId))
}

const USERS_COLLECTION = "users"

function asUserRole(value: unknown): UserRole {
  return value === "admin" ? "admin" : "client"
}

function asUserStatus(value: unknown): UserAccountStatus {
  return value === "blocked" ? "blocked" : "active"
}

export async function getAllUsersAdmin(
  bookings: BookingData[],
  favorites: FavoriteAdminRecord[],
): Promise<UserAdminRecord[]> {
  if (!db) return []

  const bookingCounts = new Map<string, number>()
  const favoriteCounts = new Map<string, number>()
  const knownUids = new Set<string>()

  for (const b of bookings) {
    if (!b.userId) continue
    knownUids.add(b.userId)
    bookingCounts.set(b.userId, (bookingCounts.get(b.userId) ?? 0) + 1)
  }
  for (const f of favorites) {
    if (!f.userId) continue
    knownUids.add(f.userId)
    favoriteCounts.set(f.userId, (favoriteCounts.get(f.userId) ?? 0) + 1)
  }

  const snapshot = await getDocs(collection(db, USERS_COLLECTION))
  const fromFirestore = new Map<string, UserAdminRecord>()

  for (const d of snapshot.docs) {
    const data = d.data()
    const uid = (data.uid as string) || d.id
    knownUids.add(uid)
    fromFirestore.set(uid, {
      uid,
      email: (data.email as string) ?? "",
      displayName: (data.displayName as string) ?? "",
      phone: (data.phone as string) ?? "",
      role: asUserRole(data.role),
      status: asUserStatus(data.status),
      notes: (data.notes as string) ?? "",
      bookingsCount: bookingCounts.get(uid) ?? 0,
      favoritesCount: favoriteCounts.get(uid) ?? 0,
      hasProfile: true,
    })
  }

  const result: UserAdminRecord[] = []
  for (const uid of knownUids) {
    const existing = fromFirestore.get(uid)
    if (existing) {
      result.push({
        ...existing,
        bookingsCount: bookingCounts.get(uid) ?? existing.bookingsCount,
        favoritesCount: favoriteCounts.get(uid) ?? existing.favoritesCount,
      })
    } else {
      result.push({
        uid,
        email: "",
        displayName: "",
        phone: "",
        role: "client",
        status: "active",
        notes: "",
        bookingsCount: bookingCounts.get(uid) ?? 0,
        favoritesCount: favoriteCounts.get(uid) ?? 0,
        hasProfile: false,
      })
    }
  }

  return result.sort((a, b) => {
    const nameA = (a.displayName || a.email || a.uid).toLowerCase()
    const nameB = (b.displayName || b.email || b.uid).toLowerCase()
    return nameA.localeCompare(nameB, "pl")
  })
}

export async function saveUserProfile(
  uid: string,
  input: UserAdminEditInput,
): Promise<void> {
  if (!db) throw new Error("Firestore nie jest dostępny")
  if (!uid.trim()) throw new Error("Brak identyfikatora użytkownika")

  await setDoc(
    doc(db, USERS_COLLECTION, uid),
    {
      uid,
      email: input.email.trim(),
      displayName: input.displayName.trim(),
      phone: input.phone.trim(),
      role: input.role,
      status: input.status,
      notes: input.notes.trim(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

export async function deleteUserProfile(uid: string): Promise<void> {
  if (!db) throw new Error("Firestore nie jest dostępny")
  await deleteDoc(doc(db, USERS_COLLECTION, uid))
}
