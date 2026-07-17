"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  ArrowLeft,
  LayoutDashboard,
  Calendar,
  Heart,
  Loader2,
  Trash2,
  ShieldAlert,
  RefreshCw,
  Users,
  Banknote,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Pencil,
  Save,
  ChevronLeft,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { isAdminUser, PRIMARY_ADMIN_EMAIL } from "@/lib/admin"
import {
  getAllBookings,
  getAllFavorites,
  getAllUsersAdmin,
  updateBookingStatus,
  deleteBooking,
  deleteFavoriteById,
  saveUserProfile,
  deleteUserProfile,
} from "@/lib/firestore-service"
import type { BookingData, BookingStatus } from "@/types/booking"
import type {
  DashboardTab,
  FavoriteAdminRecord,
  BookingStatusOption,
  UserAdminRecord,
  UserAdminEditInput,
  UserRole,
  UserAccountStatus,
} from "@/types/dashboard"
import BottomNav from "@/components/BottomNav"

// ============================================================
// STAŁE
// ============================================================

const STATUS_OPTIONS: BookingStatusOption[] = [
  {
    value: "pending",
    label: "Oczekująca",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    value: "confirmed",
    label: "Potwierdzona",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    value: "completed",
    label: "Zakończona",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    value: "cancelled",
    label: "Anulowana",
    className: "bg-red-500/10 text-red-600 dark:text-red-400",
  },
]

function statusMeta(status: BookingStatus): BookingStatusOption {
  return (
    STATUS_OPTIONS.find((s) => s.value === status) ?? {
      value: status,
      label: status,
      className: "bg-black/5 text-foreground/60",
    }
  )
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

function formatCurrency(amount: number): string {
  return `${amount.toLocaleString("pl-PL")} zł`
}

// ============================================================
// TREŚĆ DASHBOARDU
// ============================================================

function DashboardContent() {
  const router = useRouter()
  const { user, loading, initialized } = useAuth()

  const [activeTab, setActiveTab] = useState<DashboardTab>("przeglad")
  const [bookings, setBookings] = useState<BookingData[]>([])
  const [favorites, setFavorites] = useState<FavoriteAdminRecord[]>([])
  const [users, setUsers] = useState<UserAdminRecord[]>([])
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [actionId, setActionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const isAdmin = isAdminUser(user)
  // Uprawnienia wyliczane z bieżącego stanu auth – bez setState w efekcie
  const accessDenied = Boolean(initialized && !loading && user && !isAdmin)

  // Przekierowanie niezalogowanych do logowania
  useEffect(() => {
    if (!initialized || loading) return
    if (!user) {
      router.push(`/auth?redirect=${encodeURIComponent("/dashboard")}`)
    }
  }, [initialized, loading, user, router])

  const mergeAdminIntoUsers = useCallback(
    (list: UserAdminRecord[]): UserAdminRecord[] => {
      if (!user) return list
      const exists = list.some((u) => u.uid === user.uid)
      if (exists) {
        return list.map((u) =>
          u.uid === user.uid
            ? {
                ...u,
                email: u.email || user.email || "",
                displayName: u.displayName || user.displayName || "",
                role: isAdminUser(user) ? "admin" : u.role,
              }
            : u,
        )
      }
      return [
        {
          uid: user.uid,
          email: user.email || PRIMARY_ADMIN_EMAIL,
          displayName: user.displayName || "Administrator",
          phone: "",
          role: "admin",
          status: "active",
          notes: "",
          bookingsCount: 0,
          favoritesCount: 0,
          hasProfile: false,
        },
        ...list,
      ]
    },
    [user],
  )

  const loadData = useCallback(
    async (silent = false) => {
      if (!silent) setDataLoading(true)
      else setRefreshing(true)
      setError(null)
      try {
        const [allBookings, allFavorites] = await Promise.all([
          getAllBookings(),
          getAllFavorites(),
        ])
        const allUsers = await getAllUsersAdmin(allBookings, allFavorites)
        setBookings(allBookings)
        setFavorites(allFavorites)
        setUsers(mergeAdminIntoUsers(allUsers))
      } catch {
        setError(
          "Nie udało się pobrać danych z Firebase. Sprawdź reguły Firestore.",
        )
      } finally {
        setDataLoading(false)
        setRefreshing(false)
      }
    },
    [mergeAdminIntoUsers],
  )

  // Pobieranie danych admina – setState dopiero po await (asynchronicznie)
  useEffect(() => {
    if (!user || !isAdmin) return

    let cancelled = false

    async function fetchAdminData() {
      try {
        const [allBookings, allFavorites] = await Promise.all([
          getAllBookings(),
          getAllFavorites(),
        ])
        const allUsers = await getAllUsersAdmin(allBookings, allFavorites)
        if (cancelled) return
        setBookings(allBookings)
        setFavorites(allFavorites)
        setUsers(mergeAdminIntoUsers(allUsers))
        setError(null)
      } catch {
        if (cancelled) return
        setError(
          "Nie udało się pobrać danych z Firebase. Sprawdź reguły Firestore.",
        )
      } finally {
        if (!cancelled) setDataLoading(false)
      }
    }

    void fetchAdminData()
    return () => {
      cancelled = true
    }
  }, [user, isAdmin, mergeAdminIntoUsers])

  const stats = useMemo(() => {
    const pending = bookings.filter((b) => b.status === "pending").length
    const confirmed = bookings.filter((b) => b.status === "confirmed").length
    const revenue = bookings
      .filter((b) => b.status === "confirmed" || b.status === "completed")
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0)

    return {
      bookingsCount: bookings.length,
      favoritesCount: favorites.length,
      pending,
      confirmed,
      revenue,
      uniqueUsers: users.length,
    }
  }, [bookings, favorites, users])

  const handleStatusChange = async (
    bookingId: string,
    status: BookingStatus,
  ) => {
    setActionId(bookingId)
    setError(null)
    try {
      await updateBookingStatus(bookingId, status)
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status } : b)),
      )
    } catch {
      setError("Nie udało się zaktualizować statusu rezerwacji.")
    } finally {
      setActionId(null)
    }
  }

  const handleDeleteBooking = async (bookingId: string) => {
    if (!window.confirm("Czy na pewno chcesz usunąć tę rezerwację?")) return
    setActionId(bookingId)
    setError(null)
    try {
      await deleteBooking(bookingId)
      setBookings((prev) => prev.filter((b) => b.id !== bookingId))
    } catch {
      setError("Nie udało się usunąć rezerwacji.")
    } finally {
      setActionId(null)
    }
  }

  const handleDeleteFavorite = async (docId: string) => {
    if (!window.confirm("Czy na pewno chcesz usunąć ten wpis ulubionych?"))
      return
    setActionId(docId)
    setError(null)
    try {
      await deleteFavoriteById(docId)
      setFavorites((prev) => prev.filter((f) => f.docId !== docId))
    } catch {
      setError("Nie udało się usunąć ulubionego.")
    } finally {
      setActionId(null)
    }
  }

  const handleSaveUser = async (uid: string, input: UserAdminEditInput) => {
    setActionId(uid)
    setError(null)
    setSuccess(null)
    try {
      await saveUserProfile(uid, input)
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === uid
            ? {
                ...u,
                ...input,
                hasProfile: true,
              }
            : u,
        ),
      )
      setSuccess("Zapisano dane użytkownika.")
      setEditingUserId(null)
    } catch {
      setError(
        "Nie udało się zapisać użytkownika. Sprawdź reguły Firestore (kolekcja users).",
      )
    } finally {
      setActionId(null)
    }
  }

  const handleDeleteUserProfile = async (uid: string) => {
    if (
      !window.confirm(
        "Usunąć profil z Firestore? Konto w Authentication pozostanie bez zmian.",
      )
    )
      return
    setActionId(uid)
    setError(null)
    setSuccess(null)
    try {
      await deleteUserProfile(uid)
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === uid
            ? {
                ...u,
                displayName: "",
                email: u.email,
                phone: "",
                role: "client",
                status: "active",
                notes: "",
                hasProfile: false,
              }
            : u,
        ),
      )
      setEditingUserId(null)
      setSuccess("Usunięto profil z Firestore.")
    } catch {
      setError("Nie udało się usunąć profilu użytkownika.")
    } finally {
      setActionId(null)
    }
  }

  // Stany ładowania / brak dostępu
  if (loading || !initialized) {
    return (
      <div className='relative flex flex-col h-full w-full overflow-hidden bg-background'>
        <div className='flex-1 flex items-center justify-center'>
          <Loader2 className='w-6 h-6 text-foreground/40 animate-spin' />
        </div>
        <BottomNav />
      </div>
    )
  }

  if (accessDenied) {
    return (
      <div className='relative flex flex-col h-full w-full overflow-hidden bg-background'>
        <header className='shrink-0 flex items-center gap-3 px-4 pt-4 pb-3'>
          <button
            onClick={() => router.push("/")}
            className='w-9 h-9 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/15 transition-colors cursor-pointer'
            aria-label='Powrót'
          >
            <ArrowLeft className='w-5 h-5 text-foreground' />
          </button>
          <h1 className='text-base font-extrabold text-foreground'>
            Panel admina
          </h1>
        </header>
        <main className='flex-1 flex flex-col items-center justify-center px-6 gap-3'>
          <div className='w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center'>
            <ShieldAlert className='w-7 h-7 text-red-500' />
          </div>
          <p className='text-sm font-bold text-foreground text-center'>
            Brak uprawnień
          </p>
          <p className='text-xs text-muted dark:text-muted-foreground/70 text-center max-w-[260px]'>
            Ta strona jest dostępna wyłącznie dla administratorów. Skontaktuj
            się z właścicielem platformy, jeśli potrzebujesz dostępu.
          </p>
          <button
            onClick={() => router.push("/")}
            className='mt-2 px-4 py-2 rounded-xl bg-foreground text-background text-[11px] font-bold hover:opacity-90 transition-opacity cursor-pointer'
          >
            Wróć na stronę główną
          </button>
        </main>
        <BottomNav />
      </div>
    )
  }

  if (!user || !isAdmin) return null

  const tabs: {
    id: DashboardTab
    label: string
    icon: typeof LayoutDashboard
  }[] = [
    { id: "przeglad", label: "Przegląd", icon: LayoutDashboard },
    { id: "rezerwacje", label: "Rezerwacje", icon: Calendar },
    { id: "ulubione", label: "Ulubione", icon: Heart },
    { id: "uzytkownicy", label: "Użytkownicy", icon: Users },
  ]

  return (
    <div className='relative flex flex-col h-full w-full overflow-hidden bg-background'>
      {/* ========== NAGŁÓWEK ========== */}
      <header className='shrink-0 flex items-center gap-3 px-4 pt-4 pb-3'>
        <button
          onClick={() => router.back()}
          className='w-9 h-9 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/15 transition-colors cursor-pointer'
          aria-label='Powrót'
        >
          <ArrowLeft className='w-5 h-5 text-foreground' />
        </button>
        <div className='flex-1 min-w-0'>
          <h1 className='text-base font-extrabold text-foreground'>
            Panel admina
          </h1>
          <p className='text-[10px] text-muted dark:text-muted-foreground/70 truncate'>
            Zarządzanie danymi Firebase
          </p>
        </div>
        <button
          onClick={() => void loadData(true)}
          disabled={refreshing || dataLoading}
          className='w-9 h-9 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/15 transition-colors cursor-pointer disabled:opacity-50'
          aria-label='Odśwież dane'
        >
          <RefreshCw
            className={`w-4 h-4 text-foreground ${refreshing ? "animate-spin" : ""}`}
          />
        </button>
      </header>

      {/* ========== TREŚĆ ========== */}
      <main className='flex-1 overflow-y-auto px-4 pb-4'>
        {/* Odznaka admina */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-4 px-3 py-2.5 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center gap-2.5'
        >
          <div className='w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center shrink-0'>
            <LayoutDashboard className='w-4 h-4 text-violet-500' />
          </div>
          <div className='min-w-0 flex-1'>
            <p className='text-[11px] font-bold text-foreground truncate'>
              {user.displayName || "Administrator"}
            </p>
            <p className='text-[10px] text-muted dark:text-muted-foreground/70 truncate'>
              {user.email}
            </p>
          </div>
          <span className='px-2 py-0.5 rounded-full bg-violet-500/15 text-[9px] font-bold text-violet-600 dark:text-violet-400 whitespace-nowrap'>
            Admin
          </span>
        </motion.div>

        {/* Zakładki */}
        <div className='flex gap-1 mb-4 bg-black/3 dark:bg-white/5 rounded-2xl p-1'>
          {tabs.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted dark:text-muted-foreground/70 hover:text-foreground"
                }`}
              >
                <Icon className='w-3.5 h-3.5' />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Komunikaty */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className='mb-3 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2'
            >
              <AlertCircle className='w-4 h-4 text-red-500 shrink-0 mt-0.5' />
              <p className='text-[11px] text-red-600 dark:text-red-400 flex-1'>
                {error}
              </p>
              <button
                onClick={() => setError(null)}
                className='text-red-500/70 hover:text-red-500 cursor-pointer'
                aria-label='Zamknij błąd'
              >
                <XCircle className='w-4 h-4' />
              </button>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className='mb-3 px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2'
            >
              <CheckCircle2 className='w-4 h-4 text-emerald-500 shrink-0 mt-0.5' />
              <p className='text-[11px] text-emerald-600 dark:text-emerald-400 flex-1'>
                {success}
              </p>
              <button
                onClick={() => setSuccess(null)}
                className='text-emerald-500/70 hover:text-emerald-500 cursor-pointer'
                aria-label='Zamknij komunikat'
              >
                <XCircle className='w-4 h-4' />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {dataLoading ? (
          <div className='flex items-center justify-center py-16'>
            <Loader2 className='w-5 h-5 text-foreground/30 animate-spin' />
          </div>
        ) : (
          <>
            {activeTab === "przeglad" && (
              <OverviewPanel
                stats={stats}
                onGoBookings={() => setActiveTab("rezerwacje")}
                onGoFavorites={() => setActiveTab("ulubione")}
                onGoUsers={() => {
                  setEditingUserId(null)
                  setActiveTab("uzytkownicy")
                }}
              />
            )}
            {activeTab === "rezerwacje" && (
              <BookingsAdminList
                bookings={bookings}
                actionId={actionId}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteBooking}
              />
            )}
            {activeTab === "ulubione" && (
              <FavoritesAdminList
                favorites={favorites}
                actionId={actionId}
                onDelete={handleDeleteFavorite}
              />
            )}
            {activeTab === "uzytkownicy" && (
              <UsersAdminPanel
                users={users}
                editingUserId={editingUserId}
                actionId={actionId}
                onSelectUser={setEditingUserId}
                onSave={handleSaveUser}
                onDeleteProfile={handleDeleteUserProfile}
              />
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  )
}

// ============================================================
// PRZEGLĄD – STATYSTYKI
// ============================================================

function OverviewPanel({
  stats,
  onGoBookings,
  onGoFavorites,
  onGoUsers,
}: {
  stats: {
    bookingsCount: number
    favoritesCount: number
    pending: number
    confirmed: number
    revenue: number
    uniqueUsers: number
  }
  onGoBookings: () => void
  onGoFavorites: () => void
  onGoUsers: () => void
}) {
  const cards = [
    {
      label: "Rezerwacje",
      value: String(stats.bookingsCount),
      icon: Calendar,
      color: "text-blue-500 bg-blue-500/10",
      onClick: onGoBookings,
    },
    {
      label: "Ulubione",
      value: String(stats.favoritesCount),
      icon: Heart,
      color: "text-red-500 bg-red-500/10",
      onClick: onGoFavorites,
    },
    {
      label: "Oczekujące",
      value: String(stats.pending),
      icon: Clock,
      color: "text-amber-500 bg-amber-500/10",
      onClick: onGoBookings,
    },
    {
      label: "Potwierdzone",
      value: String(stats.confirmed),
      icon: CheckCircle2,
      color: "text-emerald-500 bg-emerald-500/10",
      onClick: onGoBookings,
    },
    {
      label: "Przychód",
      value: formatCurrency(stats.revenue),
      icon: Banknote,
      color: "text-violet-500 bg-violet-500/10",
      onClick: onGoBookings,
    },
    {
      label: "Użytkownicy",
      value: String(stats.uniqueUsers),
      icon: Users,
      color: "text-cyan-500 bg-cyan-500/10",
      onClick: onGoUsers,
    },
  ]

  return (
    <div className='space-y-3'>
      <p className='text-[10px] font-semibold uppercase tracking-wider text-muted dark:text-muted-foreground/60 px-1'>
        Podsumowanie kolekcji
      </p>
      <div className='grid grid-cols-2 gap-2.5'>
        {cards.map((card, i) => {
          const Icon = card.icon
          return (
            <motion.button
              key={card.label}
              type='button'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={card.onClick}
              className='text-left px-3.5 py-3.5 rounded-2xl bg-black/3 dark:bg-white/5 border border-border/60 transition-colors hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer'
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${card.color}`}
              >
                <Icon className='w-4 h-4' />
              </div>
              <p className='text-base font-extrabold text-foreground leading-tight'>
                {card.value}
              </p>
              <p className='text-[10px] text-muted dark:text-muted-foreground/70 mt-0.5'>
                {card.label}
              </p>
            </motion.button>
          )
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className='mt-2 px-4 py-3.5 rounded-2xl bg-black/3 dark:bg-white/5 border border-border/60'
      >
        <p className='text-[11px] font-bold text-foreground mb-1.5'>
          Kolekcje Firebase
        </p>
        <ul className='space-y-1.5'>
          <li className='flex items-center justify-between text-[10px]'>
            <span className='text-muted dark:text-muted-foreground/70'>
              bookings
            </span>
            <span className='font-semibold text-foreground'>
              {stats.bookingsCount} dokumentów
            </span>
          </li>
          <li className='flex items-center justify-between text-[10px]'>
            <span className='text-muted dark:text-muted-foreground/70'>
              favorites
            </span>
            <span className='font-semibold text-foreground'>
              {stats.favoritesCount} dokumentów
            </span>
          </li>
          <li className='flex items-center justify-between text-[10px]'>
            <span className='text-muted dark:text-muted-foreground/70'>
              users
            </span>
            <span className='font-semibold text-foreground'>
              {stats.uniqueUsers} profili
            </span>
          </li>
        </ul>
      </motion.div>
    </div>
  )
}

// ============================================================
// UŻYTKOWNICY (ADMIN) – LISTA + EDYCJA
// ============================================================

function UsersAdminPanel({
  users,
  editingUserId,
  actionId,
  onSelectUser,
  onSave,
  onDeleteProfile,
}: {
  users: UserAdminRecord[]
  editingUserId: string | null
  actionId: string | null
  onSelectUser: (uid: string | null) => void
  onSave: (uid: string, input: UserAdminEditInput) => Promise<void>
  onDeleteProfile: (uid: string) => Promise<void>
}) {
  const editingUser = users.find((u) => u.uid === editingUserId) ?? null

  if (editingUser) {
    return (
      <UserEditForm
        key={editingUser.uid}
        user={editingUser}
        busy={actionId === editingUser.uid}
        onBack={() => onSelectUser(null)}
        onSave={(input) => onSave(editingUser.uid, input)}
        onDeleteProfile={() => onDeleteProfile(editingUser.uid)}
      />
    )
  }

  if (users.length === 0) {
    return (
      <div className='flex flex-col items-center gap-3 py-14'>
        <div className='w-14 h-14 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center'>
          <Users className='w-6 h-6 text-foreground/30' />
        </div>
        <p className='text-xs text-muted dark:text-muted-foreground/70 text-center'>
          Brak użytkowników do wyświetlenia
        </p>
        <p className='text-[10px] text-muted/70 dark:text-muted-foreground/50 text-center max-w-[240px]'>
          Pojawią się po rezerwacjach, ulubionych lub zapisaniu profilu w
          Firestore.
        </p>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-3'>
      <p className='text-[10px] text-muted dark:text-muted-foreground/60 px-1'>
        {users.length}{" "}
        {users.length === 1
          ? "użytkownik"
          : users.length < 5
            ? "użytkowników"
            : "użytkowników"}{" "}
        · naciśnij, aby edytować
      </p>
      {users.map((u, i) => {
        const initials = (u.displayName || u.email || u.uid)
          .charAt(0)
          .toUpperCase()
        return (
          <motion.button
            key={u.uid}
            type='button'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.03, 0.3) }}
            onClick={() => onSelectUser(u.uid)}
            className='w-full text-left flex gap-3 px-3 py-3 rounded-2xl bg-black/3 dark:bg-white/5 border border-border/60 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer'
          >
            <div className='w-11 h-11 rounded-full bg-cyan-500/15 flex items-center justify-center shrink-0'>
              <span className='text-sm font-bold text-cyan-600 dark:text-cyan-400'>
                {initials}
              </span>
            </div>
            <div className='flex-1 min-w-0'>
              <div className='flex items-start justify-between gap-2'>
                <p className='text-xs font-semibold text-foreground truncate'>
                  {u.displayName || "Bez nazwy"}
                </p>
                <Pencil className='w-3.5 h-3.5 text-foreground/30 shrink-0 mt-0.5' />
              </div>
              <p className='text-[10px] text-muted dark:text-muted-foreground/70 truncate mt-0.5'>
                {u.email || "Brak e-maila w profilu"}
              </p>
              <div className='flex flex-wrap items-center gap-1.5 mt-1.5'>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                    u.role === "admin"
                      ? "bg-violet-500/10 text-violet-600 dark:text-violet-400"
                      : "bg-black/5 dark:bg-white/10 text-foreground/60"
                  }`}
                >
                  {u.role === "admin" ? "Admin" : "Klient"}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                    u.status === "blocked"
                      ? "bg-red-500/10 text-red-600 dark:text-red-400"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {u.status === "blocked" ? "Zablokowany" : "Aktywny"}
                </span>
                <span className='text-[9px] text-muted dark:text-muted-foreground/60'>
                  {u.bookingsCount} rez. · {u.favoritesCount} ulub.
                </span>
              </div>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}

function UserEditForm({
  user,
  busy,
  onBack,
  onSave,
  onDeleteProfile,
}: {
  user: UserAdminRecord
  busy: boolean
  onBack: () => void
  onSave: (input: UserAdminEditInput) => Promise<void>
  onDeleteProfile: () => Promise<void>
}) {
  const [displayName, setDisplayName] = useState(user.displayName)
  const [email, setEmail] = useState(user.email)
  const [phone, setPhone] = useState(user.phone)
  const [role, setRole] = useState<UserRole>(user.role)
  const [status, setStatus] = useState<UserAccountStatus>(user.status)
  const [notes, setNotes] = useState(user.notes)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void onSave({
      displayName,
      email,
      phone,
      role,
      status,
      notes,
    })
  }

  const fieldClass =
    "w-full h-9 rounded-xl border border-border/60 bg-background px-3 text-[12px] text-foreground outline-none focus:border-ring placeholder:text-muted/50"

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      className='space-y-3'
    >
      <button
        type='button'
        onClick={onBack}
        className='flex items-center gap-1.5 text-[11px] font-semibold text-muted dark:text-muted-foreground/70 hover:text-foreground transition-colors cursor-pointer'
      >
        <ChevronLeft className='w-4 h-4' />
        Wróć do listy
      </button>

      <div className='px-3 py-3 rounded-2xl bg-black/3 dark:bg-white/5 border border-border/60'>
        <p className='text-[11px] font-bold text-foreground'>
          Edycja użytkownika
        </p>
        <p className='text-[9px] text-muted dark:text-muted-foreground/60 mt-1 break-all'>
          UID: {user.uid}
        </p>
        {!user.hasProfile && (
          <p className='text-[10px] text-amber-600 dark:text-amber-400 mt-2'>
            Brak profilu w Firestore – zapis utworzy dokument w kolekcji{" "}
            <code className='font-mono'>users</code>.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className='space-y-3'>
        <div>
          <label className='block text-[10px] font-semibold text-muted dark:text-muted-foreground/70 mb-1 px-0.5'>
            Nazwa wyświetlana
          </label>
          <input
            type='text'
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={fieldClass}
            placeholder='Imię i nazwisko'
            disabled={busy}
          />
        </div>

        <div>
          <label className='block text-[10px] font-semibold text-muted dark:text-muted-foreground/70 mb-1 px-0.5'>
            E-mail
          </label>
          <input
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass}
            placeholder='adres@email.com'
            disabled={busy}
          />
          <p className='text-[9px] text-muted/70 dark:text-muted-foreground/50 mt-1 px-0.5'>
            Zapis w Firestore (nie zmienia e-maila w Authentication).
          </p>
        </div>

        <div>
          <label className='block text-[10px] font-semibold text-muted dark:text-muted-foreground/70 mb-1 px-0.5'>
            Telefon
          </label>
          <input
            type='tel'
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={fieldClass}
            placeholder='+48 …'
            disabled={busy}
          />
        </div>

        <div className='grid grid-cols-2 gap-2.5'>
          <div>
            <label
              htmlFor='user-role'
              className='block text-[10px] font-semibold text-muted dark:text-muted-foreground/70 mb-1 px-0.5'
            >
              Rola
            </label>
            <select
              id='user-role'
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              disabled={busy}
              className={fieldClass + " cursor-pointer"}
            >
              <option value='client'>Klient</option>
              <option value='admin'>Admin</option>
            </select>
          </div>
          <div>
            <label
              htmlFor='user-status'
              className='block text-[10px] font-semibold text-muted dark:text-muted-foreground/70 mb-1 px-0.5'
            >
              Status
            </label>
            <select
              id='user-status'
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as UserAccountStatus)
              }
              disabled={busy}
              className={fieldClass + " cursor-pointer"}
            >
              <option value='active'>Aktywny</option>
              <option value='blocked'>Zablokowany</option>
            </select>
          </div>
        </div>

        <div>
          <label className='block text-[10px] font-semibold text-muted dark:text-muted-foreground/70 mb-1 px-0.5'>
            Notatki
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            disabled={busy}
            className='w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-[12px] text-foreground outline-none focus:border-ring placeholder:text-muted/50 resize-none'
            placeholder='Notatki administratora…'
          />
        </div>

        <div className='flex gap-2 pt-1'>
          <button
            type='submit'
            disabled={busy}
            className='flex-1 h-10 rounded-xl bg-foreground text-background text-[12px] font-bold flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer'
          >
            {busy ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <Save className='w-4 h-4' />
            )}
            Zapisz
          </button>
          {user.hasProfile && (
            <button
              type='button'
              disabled={busy}
              onClick={() => void onDeleteProfile()}
              className='h-10 px-3 rounded-xl bg-red-500/10 text-red-500 text-[12px] font-bold flex items-center justify-center gap-1.5 hover:bg-red-500/20 transition-colors disabled:opacity-50 cursor-pointer'
              aria-label='Usuń profil z Firestore'
            >
              <Trash2 className='w-4 h-4' />
            </button>
          )}
        </div>
      </form>
    </motion.div>
  )
}

// ============================================================
// LISTA REZERWACJI (ADMIN)
// ============================================================

function BookingsAdminList({
  bookings,
  actionId,
  onStatusChange,
  onDelete,
}: {
  bookings: BookingData[]
  actionId: string | null
  onStatusChange: (id: string, status: BookingStatus) => void
  onDelete: (id: string) => void
}) {
  if (bookings.length === 0) {
    return (
      <div className='flex flex-col items-center gap-3 py-14'>
        <div className='w-14 h-14 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center'>
          <Calendar className='w-6 h-6 text-foreground/30' />
        </div>
        <p className='text-xs text-muted dark:text-muted-foreground/70 text-center'>
          Brak rezerwacji w Firebase
        </p>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-3'>
      <p className='text-[10px] text-muted dark:text-muted-foreground/60 px-1'>
        {bookings.length}{" "}
        {bookings.length === 1
          ? "rezerwacja"
          : bookings.length < 5
            ? "rezerwacje"
            : "rezerwacji"}
      </p>
      {bookings.map((b, i) => {
        const meta = statusMeta(b.status)
        const busy = actionId === b.id
        return (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.03, 0.3) }}
            className='px-3 py-3 rounded-2xl bg-black/3 dark:bg-white/5 border border-border/60'
          >
            <div className='flex gap-3'>
              <div className='relative w-14 h-14 rounded-xl overflow-hidden shrink-0'>
                <Image
                  src={b.villaImage || "/images/hero_bg.png"}
                  alt={b.villaName}
                  fill
                  className='object-cover'
                  sizes='56px'
                />
              </div>
              <div className='flex-1 min-w-0'>
                <div className='flex items-start justify-between gap-2'>
                  <p className='text-xs font-semibold text-foreground truncate'>
                    {b.villaName}
                  </p>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-semibold whitespace-nowrap ${meta.className}`}
                  >
                    {meta.label}
                  </span>
                </div>
                <p className='text-[10px] text-muted dark:text-muted-foreground/70 mt-1'>
                  {formatDate(b.checkIn)} – {formatDate(b.checkOut)}
                </p>
                <p className='text-[10px] text-muted dark:text-muted-foreground/70 mt-0.5'>
                  {b.nightsCount}{" "}
                  {b.nightsCount === 1
                    ? "noc"
                    : b.nightsCount < 5
                      ? "noce"
                      : "nocy"}{" "}
                  · {b.guests}{" "}
                  {b.guests === 1 ? "gość" : b.guests < 5 ? "gości" : "gości"} ·{" "}
                  <span className='font-bold text-foreground'>
                    {formatCurrency(b.totalPrice)}
                  </span>
                </p>
                {b.userId && (
                  <p className='text-[9px] text-muted/80 dark:text-muted-foreground/50 mt-0.5 truncate'>
                    UID: {b.userId}
                  </p>
                )}
              </div>
            </div>

            {/* Akcje */}
            <div className='mt-3 flex items-center gap-2'>
              <label className='sr-only' htmlFor={`status-${b.id}`}>
                Status rezerwacji
              </label>
              <select
                id={`status-${b.id}`}
                value={b.status}
                disabled={busy}
                onChange={(e) =>
                  onStatusChange(b.id, e.target.value as BookingStatus)
                }
                className='flex-1 h-8 rounded-xl border border-border/60 bg-background px-2.5 text-[11px] font-medium text-foreground outline-none focus:border-ring cursor-pointer disabled:opacity-50'
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <button
                type='button'
                disabled={busy}
                onClick={() => onDelete(b.id)}
                className='w-8 h-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-colors cursor-pointer disabled:opacity-50'
                aria-label='Usuń rezerwację'
              >
                {busy ? (
                  <Loader2 className='w-3.5 h-3.5 animate-spin' />
                ) : (
                  <Trash2 className='w-3.5 h-3.5' />
                )}
              </button>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ============================================================
// LISTA ULUBIONYCH (ADMIN)
// ============================================================

function FavoritesAdminList({
  favorites,
  actionId,
  onDelete,
}: {
  favorites: FavoriteAdminRecord[]
  actionId: string | null
  onDelete: (docId: string) => void
}) {
  if (favorites.length === 0) {
    return (
      <div className='flex flex-col items-center gap-3 py-14'>
        <div className='w-14 h-14 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center'>
          <Heart className='w-6 h-6 text-foreground/30' />
        </div>
        <p className='text-xs text-muted dark:text-muted-foreground/70 text-center'>
          Brak ulubionych w Firebase
        </p>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-3'>
      <p className='text-[10px] text-muted dark:text-muted-foreground/60 px-1'>
        {favorites.length}{" "}
        {favorites.length === 1
          ? "wpis"
          : favorites.length < 5
            ? "wpisy"
            : "wpisów"}
      </p>
      {favorites.map((f, i) => {
        const busy = actionId === f.docId
        return (
          <motion.div
            key={f.docId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.03, 0.3) }}
            className='flex gap-3 px-3 py-3 rounded-2xl bg-black/3 dark:bg-white/5 border border-border/60'
          >
            <div className='relative w-14 h-14 rounded-xl overflow-hidden shrink-0'>
              <Image
                src={f.image || "/images/hero_bg.png"}
                alt={f.name}
                fill
                className='object-cover'
                sizes='56px'
              />
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-xs font-semibold text-foreground truncate'>
                {f.name}
              </p>
              <p className='text-[10px] text-muted dark:text-muted-foreground/70 mt-1'>
                {f.location?.replace("-", ", ") || "—"} · {f.price} zł / noc
              </p>
              {f.userId && (
                <p className='text-[9px] text-muted/80 dark:text-muted-foreground/50 mt-0.5 truncate'>
                  UID: {f.userId}
                </p>
              )}
            </div>
            <button
              type='button'
              disabled={busy}
              onClick={() => onDelete(f.docId)}
              className='w-8 h-8 self-center rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-colors cursor-pointer disabled:opacity-50 shrink-0'
              aria-label='Usuń ulubione'
            >
              {busy ? (
                <Loader2 className='w-3.5 h-3.5 animate-spin' />
              ) : (
                <Trash2 className='w-3.5 h-3.5' />
              )}
            </button>
          </motion.div>
        )
      })}
    </div>
  )
}

// ============================================================
// STRONA DASHBOARD
// ============================================================

export default function DashboardPage() {
  return (
    <>
      <div className='flex md:hidden h-screen w-full'>
        <DashboardContent />
      </div>

      <div className='hidden md:flex min-h-screen w-full items-center justify-center relative overflow-hidden bg-linear-to-br from-[#0a2540] via-[#1a3a5c] to-[#0a2540]'>
        <div className='absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-accent/10 blur-[120px] pointer-events-none' />
        <div className='absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none' />
        <div className='absolute top-[30%] right-[15%] w-[300px] h-[300px] rounded-full bg-accent/5 blur-[80px] pointer-events-none' />

        <div className='absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1'>
          <span className='text-white/40 text-xs tracking-[0.3em] uppercase font-medium'>
            Ville Kołobrzeg
          </span>
          <span className='text-white/20 text-[10px] tracking-wider'>
            Mobilna platforma rezerwacji willi
          </span>
        </div>

        <div className='relative' style={{ width: "390px", height: "844px" }}>
          <div
            className='absolute inset-0 rounded-[55px] shadow-[0_60px_120px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.08)] overflow-hidden'
            style={{
              background:
                "linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 30%, #0d0d0d 60%, #1a1a1a 100%)",
            }}
          >
            <div
              className='absolute rounded-[48px] overflow-hidden bg-background'
              style={{ inset: "8px" }}
            >
              <div
                className='absolute top-0 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center'
                style={{ width: "130px", height: "34px" }}
              >
                <div className='w-full h-full rounded-b-3xl bg-black/90 flex items-center justify-center gap-2'>
                  <div className='w-2 h-2 rounded-full bg-zinc-700' />
                  <div className='w-14 h-1.5 rounded-full bg-zinc-800' />
                  <div className='w-2 h-2 rounded-full bg-zinc-600 flex items-center justify-center'>
                    <div className='w-1 h-1 rounded-full bg-zinc-500' />
                  </div>
                </div>
              </div>
              <div className='absolute inset-0 pt-[34px]'>
                <DashboardContent />
              </div>
            </div>
            <div
              className='absolute rounded-r-sm bg-zinc-700'
              style={{
                right: "-3px",
                top: "160px",
                width: "3px",
                height: "60px",
              }}
            />
            <div
              className='absolute rounded-l-sm bg-zinc-700'
              style={{
                left: "-3px",
                top: "140px",
                width: "3px",
                height: "40px",
              }}
            />
            <div
              className='absolute rounded-l-sm bg-zinc-700'
              style={{
                left: "-3px",
                top: "195px",
                width: "3px",
                height: "40px",
              }}
            />
            <div
              className='absolute rounded-l-sm bg-zinc-700'
              style={{
                left: "-3px",
                top: "100px",
                width: "3px",
                height: "28px",
              }}
            />
          </div>
          <div
            className='absolute pointer-events-none rounded-[48px] opacity-20'
            style={{
              inset: "8px",
              background:
                "linear-gradient(120deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%)",
            }}
          />
        </div>
        <div className='absolute bottom-6 left-1/2 -translate-x-1/2'>
          <span className='text-white/20 text-[10px] tracking-widest uppercase'>
            © 2026 Ville Kołobrzeg
          </span>
        </div>
      </div>
    </>
  )
}
