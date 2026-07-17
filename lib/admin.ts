import type { User } from "firebase/auth"

// ============================================================
// UPRAWNIENIA ADMINISTRATORA
// ============================================================
// Główny administrator (konto w Firebase Authentication):
//   ajarek2101@gmail.com
//
// Dodatkowe e-maile (opcjonalnie) w .env.local:
//   NEXT_PUBLIC_ADMIN_EMAILS=inny@example.com
// ============================================================

/** E-mail głównego administratora (Firebase Authentication) */
export const PRIMARY_ADMIN_EMAIL = "ajarek2101@gmail.com"

/**
 * Zwraca listę e-maili administratorów
 * (główny admin + ewentualne z zmiennej środowiskowej).
 */
export function getAdminEmails(): string[] {
  const fromEnv = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  const emails = new Set<string>([PRIMARY_ADMIN_EMAIL.toLowerCase(), ...fromEnv])
  return Array.from(emails)
}

/**
 * Sprawdza, czy podany e-mail należy do administratora.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return getAdminEmails().includes(email.trim().toLowerCase())
}

/**
 * Sprawdza, czy zalogowany użytkownik Firebase ma uprawnienia administratora.
 */
export function isAdminUser(user: User | null | undefined): boolean {
  if (!user) return false
  return isAdminEmail(user.email)
}
