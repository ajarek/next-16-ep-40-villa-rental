import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// ============================================================
// KONFIGURACJA FIREBASE
// ============================================================
// Skopiuj dane z konsoli Firebase → Ustawienia projektu → Ogólne → Twoje aplikacje → Web
// i wklej do pliku .env.local:
//
//   NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
//   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=projekt-xxxxx.firebaseapp.com
//   NEXT_PUBLIC_FIREBASE_PROJECT_ID=projekt-xxxxx
//   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=projekt-xxxxx.appspot.com
//   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
//   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
//
//   # Opcjonalnie – dodatkowe e-maile administratorów (panel /dashboard):
//   NEXT_PUBLIC_ADMIN_EMAILS=inny@example.com
//
// Główny admin (wbudowany w lib/admin.ts): ajarek2101@gmail.com
//
// ============================================================

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Singleton – zapobiega wielokrotnej inicjalizacji
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

function initFirebase() {
  if (typeof window === "undefined") return; // SSR guard

  if (!getApps().length) {
    // Sprawdź czy konfiguracja jest kompletna
    if (!firebaseConfig.apiKey) {
      console.warn(
        "[Firebase] Brak konfiguracji – uzupełnij zmienne środowiskowe w .env.local"
      );
      return;
    }
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  auth = getAuth(app);
  db = getFirestore(app);
}

initFirebase();

export { auth, db };
