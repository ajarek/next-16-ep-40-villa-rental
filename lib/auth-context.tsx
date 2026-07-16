"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "./firebase";
import type { AuthState, AuthContextType } from "@/types/auth";

// ============================================================
// KONTEKST
// ============================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================
// PROVIDER
// ============================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    initialized: false,
  });

  // Obserwuj zmiany stanu autoryzacji
  useEffect(() => {
    if (!auth) {
      setState({ user: null, loading: false, initialized: true });
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setState({ user, loading: false, initialized: true });
      },
      () => {
        setState({ user: null, loading: false, initialized: true });
      }
    );

    return unsubscribe;
  }, []);

  // Logowanie email/hasło
  const login = useCallback(
    async (email: string, password: string) => {
      if (!auth) return { success: false, error: "Firebase nie jest skonfigurowany" };
      try {
        await signInWithEmailAndPassword(auth, email, password);
        return { success: true };
      } catch (err: unknown) {
        const e = err as { code?: string; message?: string };
        const messages: Record<string, string> = {
          "auth/user-not-found": "Nie znaleziono użytkownika z tym adresem email",
          "auth/wrong-password": "Nieprawidłowe hasło",
          "auth/invalid-credential": "Nieprawidłowy email lub hasło",
          "auth/invalid-email": "Nieprawidłowy format adresu email",
          "auth/too-many-requests": "Zbyt wiele prób logowania. Spróbuj ponownie za chwilę",
        };
        return {
          success: false,
          error: messages[e.code ?? ""] || e.message || "Wystąpił błąd logowania",
        };
      }
    },
    []
  );

  // Rejestracja email/hasło
  const register = useCallback(
    async (email: string, password: string, name: string) => {
      if (!auth) return { success: false, error: "Firebase nie jest skonfigurowany" };
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (cred.user) {
          await updateProfile(cred.user, { displayName: name });
        }
        return { success: true };
      } catch (err: unknown) {
        const e = err as { code?: string; message?: string };
        const messages: Record<string, string> = {
          "auth/email-already-in-use": "Ten adres email jest już zajęty",
          "auth/weak-password": "Hasło jest zbyt słabe – minimum 6 znaków",
          "auth/invalid-email": "Nieprawidłowy format adresu email",
        };
        return {
          success: false,
          error: messages[e.code ?? ""] || e.message || "Wystąpił błąd rejestracji",
        };
      }
    },
    []
  );

  // Wylogowanie
  const logout = useCallback(async () => {
    if (!auth) return;
    await signOut(auth);
  }, []);

  // Reset hasła
  const resetPassword = useCallback(async (email: string) => {
    if (!auth) return { success: false, error: "Firebase nie jest skonfigurowany" };
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      return {
        success: false,
        error:
          e.code === "auth/user-not-found"
            ? "Nie znaleziono użytkownika z tym adresem email"
            : e.message || "Wystąpił błąd",
      };
    }
  }, []);

  // Logowanie przez Google
  const loginWithGoogle = useCallback(async () => {
    if (!auth) return { success: false, error: "Firebase nie jest skonfigurowany" };
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, provider);
      return { success: true };
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      return {
        success: false,
        error: e.message || "Wystąpił błąd logowania przez Google",
      };
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        resetPassword,
        loginWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================
// HOOK
// ============================================================

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth musi być używane w obrębie AuthProvider");
  }
  return ctx;
}
