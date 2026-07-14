import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// ============================================================
// TYPY
// ============================================================

export type VillaData = {
  id: string;
  name: string;
  price: number;
  rating: number;
  image: string;
  location: string;
  distanceToBeach: number;
  numberOfPeople: number;
  status: string;
};

export type BookingData = {
  id: string;
  villaId: string;
  villaName: string;
  villaImage: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nightsCount: number;
  totalPrice: number;
  createdAt: Timestamp;
  status: "confirmed" | "cancelled" | "completed";
};

// ============================================================
// ULUBIONE
// ============================================================

const FAVORITES_COLLECTION = "favorites";

export async function addFavorite(
  userId: string,
  villaId: string,
  villaData: VillaData
): Promise<void> {
  if (!db) throw new Error("Firestore nie jest dostępny");
  await setDoc(doc(db, FAVORITES_COLLECTION, `${userId}_${villaId}`), {
    userId,
    villaId,
    ...villaData,
    createdAt: serverTimestamp(),
  });
}

export async function removeFavorite(
  userId: string,
  villaId: string
): Promise<void> {
  if (!db) throw new Error("Firestore nie jest dostępny");
  await deleteDoc(doc(db, FAVORITES_COLLECTION, `${userId}_${villaId}`));
}

export async function getFavorites(
  userId: string
): Promise<VillaData[]> {
  if (!db) return [];
  const q = query(
    collection(db, FAVORITES_COLLECTION),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => d.data() as VillaData);
}

export async function isFavorite(
  userId: string,
  villaId: string
): Promise<boolean> {
  if (!db) return false;
  const snap = await getDoc(doc(db, FAVORITES_COLLECTION, `${userId}_${villaId}`));
  return snap.exists();
}

// ============================================================
// REZERWACJE
// ============================================================

const BOOKINGS_COLLECTION = "bookings";

export async function addBooking(
  userId: string,
  booking: Omit<BookingData, "id" | "createdAt">
): Promise<string> {
  if (!db) throw new Error("Firestore nie jest dostępny");
  const ref = doc(collection(db, BOOKINGS_COLLECTION));
  await setDoc(ref, {
    ...booking,
    id: ref.id,
    userId,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getBookings(
  userId: string
): Promise<BookingData[]> {
  if (!db) return [];
  const q = query(
    collection(db, BOOKINGS_COLLECTION),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => d.data() as BookingData);
}
