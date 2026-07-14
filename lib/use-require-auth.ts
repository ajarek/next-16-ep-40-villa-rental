"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-context";

// ============================================================
// HOOK DO OCHRONY AKCJI – sprawdza czy użytkownik jest zalogowany
// przed wykonaniem chronionej akcji (rezerwacja, ulubione itp.)
// ============================================================

export function useRequireAuth() {
  const { user, initialized } = useAuth();
  const router = useRouter();

  const requireAuth = useCallback(
    (action?: () => void): boolean => {
      // Poczekaj na inicjalizację auth
      if (!initialized) return false;

      // Jeśli użytkownik nie jest zalogowany – przekieruj do /auth z redirect
      if (!user) {
        // Zapisz bieżącą ścieżkę, aby wrócić po zalogowaniu
        const currentPath = window.location.pathname + window.location.search;
        router.push(`/auth?redirect=${encodeURIComponent(currentPath)}`);
        return false;
      }

      // Użytkownik zalogowany – wykonaj akcję (jeśli przekazana)
      if (action) action();
      return true;
    },
    [user, initialized, router]
  );

  return { requireAuth, isAuthenticated: !!user, initialized };
}
