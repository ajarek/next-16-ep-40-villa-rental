"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./auth-context"

export function useRequireAuth() {
  const { user, initialized } = useAuth()
  const router = useRouter()

  const requireAuth = useCallback(
    (action?: () => void): boolean => {
      if (!initialized) return false

      if (!user) {
        const currentPath = window.location.pathname + window.location.search
        router.push(`/auth?redirect=${encodeURIComponent(currentPath)}`)
        return false
      }

      if (action) action()
      return true
    },
    [user, initialized, router],
  )

  return { requireAuth, isAuthenticated: !!user, initialized }
}
