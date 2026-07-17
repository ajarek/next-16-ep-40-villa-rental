import type { User } from "firebase/auth"


export const PRIMARY_ADMIN_EMAIL = "ajarek2101@gmail.com"


export function getAdminEmails(): string[] {
  const fromEnv = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  const emails = new Set<string>([PRIMARY_ADMIN_EMAIL.toLowerCase(), ...fromEnv])
  return Array.from(emails)
}


export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return getAdminEmails().includes(email.trim().toLowerCase())
}


export function isAdminUser(user: User | null | undefined): boolean {
  if (!user) return false
  return isAdminEmail(user.email)
}
