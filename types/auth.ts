import type { User } from "firebase/auth"

export type AuthMode = "login" | "register"

export type AuthState = {
  user: User | null
  loading: boolean
  initialized: boolean
}

export type AuthContextType = AuthState & {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>
}
