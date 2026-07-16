"use client"

import React, { useState, useCallback } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  Check,
  X,
  CreditCard,
  Smartphone,
  Wallet,
  Banknote,
  ShieldCheck,
  Lock,
  Info,
  Sparkles,
  Building2,
  Crown,
} from "lucide-react"
import { motion, AnimatePresence, type Easing } from "framer-motion"
import BottomNav from "@/components/BottomNav"
import type {
  BookingFormData,
  PaymentMethod,
  PaymentStep,
} from "@/types/booking"

const paymentMethods: {
  id: PaymentMethod
  name: string
  icon: React.ElementType
  description: string
}[] = [
  {
    id: "card",
    name: "Karta płatnicza",
    icon: CreditCard,
    description: "Visa, Mastercard",
  },
  {
    id: "blik",
    name: "BLIK",
    icon: Smartphone,
    description: "Szybki przelew mobilny",
  },
  {
    id: "apple",
    name: "Apple Pay",
    icon: Wallet,
    description: "Zapłać szybko i bezpiecznie",
  },
  {
    id: "google",
    name: "Google Pay",
    icon: Wallet,
    description: "Twoje karty w jednym miejscu",
  },
  {
    id: "przelewy24",
    name: "Przelewy24",
    icon: Banknote,
    description: "Przelew online",
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as Easing },
  }),
}

function PaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [currentStep, setCurrentStep] = useState<PaymentStep>("podsumowanie")
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null,
  )
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvc, setCardCvc] = useState("")
  const [cardName, setCardName] = useState("")
  const [blikCode, setBlikCode] = useState("")
  const [processing, setProcessing] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [showRegulations, setShowRegulations] = useState(false)

  const [booking] = useState<BookingFormData | null>(() => {
    if (typeof window === "undefined") return null
    const stored = sessionStorage.getItem("pendingBooking")
    if (stored) {
      try {
        return JSON.parse(stored) as BookingFormData
      } catch {
        /* empty */
      }
    }
    const id = searchParams?.get("villaId")
    if (!id) return null
    return {
      villaId: id,
      villaName: searchParams?.get("villaName") || "Willa",
      villaImage:
        searchParams?.get("villaImage") || "/images/willa_bursztynowa.png",
      villaPrice: Number(searchParams?.get("villaPrice") || 0),
      checkIn: searchParams?.get("checkIn") || "",
      checkOut: searchParams?.get("checkOut") || "",
      guests: Number(searchParams?.get("guests") || 2),
      nightsCount: Number(searchParams?.get("nightsCount") || 1),
      totalPrice: Number(searchParams?.get("totalPrice") || 0),
    } as BookingFormData
  })

  const formatCardNumber = useCallback((value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16)
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ")
  }, [])

  const formatExpiry = useCallback((value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4)
    if (digits.length >= 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`
    return digits
  }, [])

  const handlePay = async () => {
    setProcessing(true)
    await new Promise((r) => setTimeout(r, 2000))
    setProcessing(false)
    setCurrentStep("potwierdzenie")
  }

  const steps = [
    { id: "podsumowanie" as const, label: "Podsumowanie", number: 1 },
    { id: "platnosc" as const, label: "Płatność", number: 2 },
    { id: "potwierdzenie" as const, label: "Potwierdzenie", number: 3 },
  ]

  const stepIndex = steps.findIndex((s) => s.id === currentStep)

  if (!booking) {
    return (
      <div className='relative flex flex-col h-full w-full overflow-hidden bg-background'>
        <div className='flex-1 flex flex-col items-center justify-center gap-4 px-6'>
          <div className='w-16 h-16 rounded-full bg-muted flex items-center justify-center'>
            <Info className='w-7 h-7 text-muted-foreground' />
          </div>
          <p className='text-sm font-medium text-foreground text-center'>
            Brak danych rezerwacji
          </p>
          <button
            onClick={() => router.push("/villas")}
            className='px-5 py-2 bg-accent text-accent-foreground text-xs font-semibold rounded-xl cursor-pointer'
          >
            Przeglądaj wille
          </button>
        </div>
        <BottomNav />
      </div>
    )
  }

  const renderStepIndicator = () => (
    <div className='flex items-center justify-center gap-0 px-6 py-4'>
      {steps.map((step, i) => {
        const isActive = i <= stepIndex
        const isCurrent = i === stepIndex
        return (
          <React.Fragment key={step.id}>
            <div className='flex flex-col items-center gap-1.5'>
              <motion.div
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                  backgroundColor: isActive
                    ? "var(--color-accent)"
                    : "color-mix(in srgb, var(--color-border) 60%, transparent)",
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isActive
                    ? "bg-accent text-accent-foreground shadow-md shadow-accent/20"
                    : "bg-border/60 text-foreground/40"
                }`}
              >
                {isActive && i < stepIndex ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15 }}
                  >
                    <Check className='w-5 h-5' strokeWidth={2.5} />
                  </motion.div>
                ) : (
                  <span
                    className={`text-sm font-bold ${isActive ? "text-accent-foreground" : ""}`}
                  >
                    {step.number}
                  </span>
                )}
              </motion.div>
              <span
                className={`text-[9px] font-semibold tracking-tight ${
                  isActive
                    ? "text-foreground"
                    : "text-muted dark:text-muted-foreground/50"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className='flex-1 mx-2 relative h-px mt-[-18px]'>
                <div className='absolute inset-0 bg-border/40 rounded-full' />
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: i < stepIndex ? "100%" : "0%" }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className='absolute inset-0 bg-accent rounded-full'
                />
              </div>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )

  const renderSummary = () => (
    <motion.div
      key='summary'
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className='px-5 py-2 space-y-4'
    >
      <div className='flex items-center gap-3 pb-2'>
        <div className='relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 shadow-sm border border-border/40'>
          <Image
            src={booking.villaImage}
            alt={booking.villaName}
            fill
            className='object-cover'
            sizes='64px'
          />
        </div>
        <div className='min-w-0 flex-1'>
          <h2 className='text-sm font-bold text-foreground truncate'>
            {booking.villaName}
          </h2>
          <p className='text-[11px] text-muted dark:text-muted-foreground/70 mt-0.5'>
            {new Date(booking.checkIn).toLocaleDateString("pl-PL", {
              day: "numeric",
              month: "long",
            })}{" "}
            –{" "}
            {new Date(booking.checkOut).toLocaleDateString("pl-PL", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className='bg-black/3 dark:bg-white/5 rounded-2xl p-4 space-y-3'>
        <div className='flex items-center justify-between'>
          <span className='text-xs text-muted dark:text-muted-foreground/70'>
            {booking.villaPrice} zł × {booking.nightsCount}{" "}
            {booking.nightsCount === 1 ? "noc" : "noce"}
          </span>
          <span className='text-xs font-medium text-foreground'>
            {booking.villaPrice * booking.nightsCount} zł
          </span>
        </div>
        <div className='flex items-center justify-between'>
          <span className='text-xs text-muted dark:text-muted-foreground/70'>
            Czyszczenie
          </span>
          <span className='text-xs font-medium text-foreground'>150 zł</span>
        </div>
        <div className='flex items-center justify-between'>
          <span className='text-xs text-muted dark:text-muted-foreground/70'>
            Opłata serwisowa
          </span>
          <span className='text-xs font-medium text-foreground'>50 zł</span>
        </div>
        {booking.guests > 2 && (
          <div className='flex items-center justify-between'>
            <span className='text-xs text-muted dark:text-muted-foreground/70'>
              Dopłata za gości ({booking.guests - 2} dodatk.)
            </span>
            <span className='text-xs font-medium text-foreground'>
              {(booking.guests - 2) * 50} zł
            </span>
          </div>
        )}
        <div className='border-t border-border/40 pt-3 flex items-center justify-between'>
          <span className='text-sm font-bold text-foreground'>Razem</span>
          <motion.span
            key={booking.totalPrice}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className='text-lg font-extrabold text-foreground'
          >
            {booking.totalPrice} zł
          </motion.span>
        </div>
      </div>

      <div className='flex items-start gap-2.5 px-3 py-3 rounded-2xl bg-yellow-400/5 border border-yellow-400/20'>
        <Info className='w-4 h-4 text-yellow-500 shrink-0 mt-0.5' />
        <p className='text-[11px] text-muted dark:text-muted-foreground/70 leading-relaxed'>
          Nie ponosisz opłat do momentu potwierdzenia rezerwacji. Płatność
          zostanie przetworzona w bezpiecznym środowisku.
        </p>
      </div>

      <div className='flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20'>
        <ShieldCheck className='w-4 h-4 text-emerald-500 shrink-0' />
        <span className='text-[10px] text-muted dark:text-muted-foreground/70'>
          Darmowe anulowanie do 48h przed przyjazdem
        </span>
      </div>

      <button
        onClick={() => setCurrentStep("platnosc")}
        className='w-full py-3.5 rounded-2xl bg-accent text-accent-foreground text-sm font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-accent/20'
      >
        Przejdź do płatności
      </button>
    </motion.div>
  )

  const renderPayment = () => (
    <motion.div
      key='payment'
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className='px-5 py-2 space-y-4'
    >
      <div className='bg-black/3 dark:bg-white/5 rounded-2xl p-3 flex items-center justify-between'>
        <div className='flex items-center gap-2.5'>
          <div className='w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center'>
            <Building2 className='w-4 h-4 text-accent-foreground' />
          </div>
          <div>
            <span className='text-xs font-semibold text-foreground'>
              Do zapłaty
            </span>
            <p className='text-[10px] text-muted dark:text-muted-foreground/70'>
              {booking.villaName}
            </p>
          </div>
        </div>
        <span className='text-lg font-extrabold text-foreground'>
          {booking.totalPrice} zł
        </span>
      </div>

      <div>
        <h3 className='text-xs font-bold text-foreground uppercase tracking-wider mb-3'>
          Metoda płatności
        </h3>
        <div className='space-y-2'>
          {paymentMethods.map((method, i) => {
            const Icon = method.icon
            const isSelected = selectedMethod === method.id
            return (
              <motion.button
                key={method.id}
                custom={i}
                variants={fadeUp}
                initial='hidden'
                animate='visible'
                onClick={() => setSelectedMethod(method.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-accent/10 border-2 border-accent shadow-sm"
                    : "bg-black/3 dark:bg-white/5 border-2 border-transparent hover:bg-black/5 dark:hover:bg-white/10"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isSelected
                      ? "bg-accent text-accent-foreground"
                      : "bg-foreground/5 text-foreground/50"
                  }`}
                >
                  <Icon className='w-5 h-5' />
                </div>
                <div className='flex-1 min-w-0'>
                  <span
                    className={`text-xs font-semibold ${
                      isSelected ? "text-accent-foreground" : "text-foreground"
                    }`}
                  >
                    {method.name}
                  </span>
                  <p className='text-[10px] text-muted dark:text-muted-foreground/70 mt-0.5'>
                    {method.description}
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    isSelected ? "border-accent" : "border-border"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className='w-2.5 h-2.5 rounded-full bg-accent'
                    />
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      <AnimatePresence mode='wait'>
        {selectedMethod === "card" && (
          <motion.div
            key='card-form'
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className='space-y-3'
          >
            <h3 className='text-xs font-bold text-foreground uppercase tracking-wider'>
              Dane karty
            </h3>
            <div className='bg-black/3 dark:bg-white/5 rounded-2xl p-4 space-y-3.5'>
              <div>
                <label className='text-[10px] text-muted dark:text-muted-foreground/70 block mb-1.5'>
                  Numer karty
                </label>
                <div className='relative'>
                  <input
                    type='text'
                    inputMode='numeric'
                    value={cardNumber}
                    onChange={(e) =>
                      setCardNumber(formatCardNumber(e.target.value))
                    }
                    placeholder='1234 5678 9012 3456'
                    maxLength={19}
                    className='w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-background border border-border/60 text-sm text-foreground placeholder:text-muted dark:placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/60 transition-colors'
                  />
                  <CreditCard className='absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted dark:text-muted-foreground/50' />
                </div>
              </div>
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='text-[10px] text-muted dark:text-muted-foreground/70 block mb-1.5'>
                    Data ważności
                  </label>
                  <input
                    type='text'
                    inputMode='numeric'
                    value={cardExpiry}
                    onChange={(e) =>
                      setCardExpiry(formatExpiry(e.target.value))
                    }
                    placeholder='MM/RR'
                    maxLength={5}
                    className='w-full px-3.5 py-2.5 rounded-xl bg-background border border-border/60 text-sm text-foreground placeholder:text-muted dark:placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/60 transition-colors'
                  />
                </div>
                <div>
                  <label className='text-[10px] text-muted dark:text-muted-foreground/70 block mb-1.5'>
                    CVC
                  </label>
                  <input
                    type='text'
                    inputMode='numeric'
                    value={cardCvc}
                    onChange={(e) =>
                      setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 3))
                    }
                    placeholder='123'
                    maxLength={3}
                    className='w-full px-3.5 py-2.5 rounded-xl bg-background border border-border/60 text-sm text-foreground placeholder:text-muted dark:placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/60 transition-colors'
                  />
                </div>
              </div>
              <div>
                <label className='text-[10px] text-muted dark:text-muted-foreground/70 block mb-1.5'>
                  Imię i nazwisko posiadacza
                </label>
                <input
                  type='text'
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder='Jan Kowalski'
                  className='w-full px-3.5 py-2.5 rounded-xl bg-background border border-border/60 text-sm text-foreground placeholder:text-muted dark:placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/60 transition-colors'
                />
              </div>
            </div>
          </motion.div>
        )}

        {selectedMethod === "blik" && (
          <motion.div
            key='blik-form'
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className='space-y-3'
          >
            <h3 className='text-xs font-bold text-foreground uppercase tracking-wider'>
              Kod BLIK
            </h3>
            <div className='bg-black/3 dark:bg-white/5 rounded-2xl p-5 flex flex-col items-center gap-4'>
              <div className='w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center'>
                <Smartphone className='w-7 h-7 text-accent-foreground' />
              </div>
              <input
                type='text'
                inputMode='numeric'
                value={blikCode}
                onChange={(e) =>
                  setBlikCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder='000 000'
                maxLength={6}
                className='w-40 text-center text-2xl font-extrabold tracking-[0.3em] px-3 py-3 rounded-xl bg-background border border-border/60 text-foreground placeholder:text-muted dark:placeholder:text-muted-foreground/30 focus:outline-none focus:border-accent/60 transition-colors'
              />
              <p className='text-[10px] text-muted dark:text-muted-foreground/70 text-center'>
                Wprowadź 6-cyfrowy kod BLIK z aplikacji bankowej
              </p>
            </div>
          </motion.div>
        )}

        {(selectedMethod === "apple" || selectedMethod === "google") && (
          <motion.div
            key='wallet-form'
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className='bg-black/3 dark:bg-white/5 rounded-2xl p-6 flex flex-col items-center gap-3'
          >
            <div className='w-16 h-16 rounded-2xl bg-foreground/5 flex items-center justify-center'>
              <Wallet className='w-7 h-7 text-foreground/50' />
            </div>
            <p className='text-xs text-muted dark:text-muted-foreground/70 text-center'>
              Zostaniesz przekierowany do{" "}
              {selectedMethod === "apple" ? "Apple Pay" : "Google Pay"}
              <br />
              aby dokończyć płatność
            </p>
          </motion.div>
        )}

        {selectedMethod === "przelewy24" && (
          <motion.div
            key='p24-form'
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className='bg-black/3 dark:bg-white/5 rounded-2xl p-6 flex flex-col items-center gap-3'
          >
            <div className='w-16 h-16 rounded-2xl bg-foreground/5 flex items-center justify-center'>
              <Banknote className='w-7 h-7 text-foreground/50' />
            </div>
            <p className='text-xs text-muted dark:text-muted-foreground/70 text-center'>
              Zostaniesz przekierowany do serwisu Przelewy24
              <br />
              aby wybrać swój bank i dokończyć płatność
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className='space-y-3'>
        <label className='flex items-start gap-3 cursor-pointer'>
          <input
            type='checkbox'
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className='mt-0.5 w-4 h-4 rounded-md border-border accent-accent'
          />
          <span className='text-[10px] text-muted dark:text-muted-foreground/70 leading-relaxed'>
            Akceptuję{" "}
            <button
              onClick={() => setShowRegulations(true)}
              className='underline hover:text-foreground cursor-pointer'
            >
              regulamin rezerwacji
            </button>
            ,{" "}
            <button
              onClick={() => setShowRegulations(true)}
              className='underline hover:text-foreground cursor-pointer'
            >
              politykę prywatności
            </button>{" "}
            oraz wyrażam zgodę na przetwarzanie danych osobowych.
          </span>
        </label>

        <div className='flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20'>
          <Lock className='w-3.5 h-3.5 text-emerald-500 shrink-0' />
          <span className='text-[10px] text-muted dark:text-muted-foreground/70'>
            Płatność szyfrowana (SSL/TLS). Twoje dane są bezpieczne.
          </span>
        </div>

        <button
          onClick={handlePay}
          disabled={
            !selectedMethod ||
            !agreed ||
            processing ||
            (selectedMethod === "card" &&
              (!cardNumber ||
                cardNumber.replace(/\s/g, "").length < 16 ||
                !cardExpiry ||
                !cardCvc ||
                !cardName)) ||
            (selectedMethod === "blik" && blikCode.length < 6)
          }
          className='w-full py-3.5 rounded-2xl bg-foreground text-background text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg'
        >
          {processing ? (
            <span className='flex items-center justify-center gap-2'>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className='w-4 h-4 border-2 border-background border-t-transparent rounded-full inline-block'
              />
              Przetwarzanie...
            </span>
          ) : (
            `Zapłać ${booking.totalPrice} zł`
          )}
        </button>
      </div>
    </motion.div>
  )

  const renderConfirmation = () => (
    <motion.div
      key='confirmation'
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className='px-5 py-4 flex flex-col items-center gap-4'
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.2 }}
        className='w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-500/30'
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring", damping: 12 }}
        >
          <Check className='w-12 h-12 text-white' strokeWidth={3} />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className='text-center'
      >
        <h2 className='text-xl font-extrabold text-foreground'>
          Płatność zakończona!
        </h2>
        <p className='text-xs text-muted dark:text-muted-foreground/70 mt-1.5'>
          Rezerwacja w {booking.villaName} została opłacona
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className='w-full bg-black/3 dark:bg-white/5 rounded-2xl p-4 space-y-2.5'
      >
        <div className='flex items-center justify-between'>
          <span className='text-[11px] text-muted dark:text-muted-foreground/70'>
            Termin
          </span>
          <span className='text-[11px] font-semibold text-foreground'>
            {new Date(booking.checkIn).toLocaleDateString("pl-PL", {
              day: "numeric",
              month: "short",
            })}{" "}
            –{" "}
            {new Date(booking.checkOut).toLocaleDateString("pl-PL", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
        <div className='flex items-center justify-between'>
          <span className='text-[11px] text-muted dark:text-muted-foreground/70'>
            Goście
          </span>
          <span className='text-[11px] font-semibold text-foreground'>
            {booking.guests} {booking.guests === 1 ? "osoba" : "osób"}
          </span>
        </div>
        <div className='flex items-center justify-between'>
          <span className='text-[11px] text-muted dark:text-muted-foreground/70'>
            Metoda
          </span>
          <span className='text-[11px] font-semibold text-foreground'>
            {paymentMethods.find((m) => m.id === selectedMethod)?.name ||
              "Karta"}
          </span>
        </div>
        <div className='border-t border-border/30 pt-2.5 flex items-center justify-between'>
          <span className='text-xs font-bold text-foreground'>Zapłacono</span>
          <motion.span
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className='text-base font-extrabold text-emerald-500'
          >
            {booking.totalPrice} zł
          </motion.span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className='w-full bg-card border border-border/60 rounded-2xl p-4 flex items-center gap-3'
      >
        <div className='w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center'>
          <Crown className='w-5 h-5 text-accent-foreground' />
        </div>
        <div className='flex-1'>
          <p className='text-xs font-semibold text-foreground'>
            Jesteś gościem premium!
          </p>
          <p className='text-[10px] text-muted dark:text-muted-foreground/70'>
            Otrzymałeś 150 punktów lojalnościowych za tę rezerwację
          </p>
        </div>
        <Sparkles className='w-5 h-5 text-yellow-400 shrink-0' />
      </motion.div>

      <div className='flex items-center gap-3 w-full pt-1'>
        <button
          onClick={() => router.push("/profile")}
          className='flex-1 py-3 rounded-2xl border border-border/60 text-xs font-semibold text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer'
        >
          Moje rezerwacje
        </button>
        <button
          onClick={() => router.push("/")}
          className='flex-1 py-3 rounded-2xl bg-accent text-accent-foreground text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-md shadow-accent/20'
        >
          Strona główna
        </button>
      </div>
    </motion.div>
  )

  return (
    <div className='relative flex flex-col h-full w-full overflow-hidden bg-background'>
      {/* ========== NAGŁÓWEK ========== */}
      <header className='shrink-0 bg-card/80 backdrop-blur-sm border-b border-border/50 z-30'>
        <div className='flex items-center justify-between px-4 pt-4 pb-3'>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => {
                if (currentStep === "platnosc") {
                  setCurrentStep("podsumowanie")
                } else if (currentStep === "potwierdzenie") {
                  router.push("/")
                } else {
                  router.back()
                }
              }}
              className='p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer'
              aria-label='Powrót'
            >
              <ArrowLeft className='w-5 h-5 text-foreground' />
            </button>
            <h1 className='text-lg font-bold text-foreground tracking-tight'>
              {currentStep === "podsumowanie"
                ? "Podsumowanie"
                : currentStep === "platnosc"
                  ? "Płatność"
                  : "Potwierdzenie"}
            </h1>
          </div>

          <div className='flex items-center gap-1.5'>
            <Lock className='w-3.5 h-3.5 text-emerald-500' />
            <span className='text-[9px] text-emerald-500 font-semibold tracking-tight'>
              SSL Secure
            </span>
          </div>
        </div>

        {currentStep !== "potwierdzenie" && renderStepIndicator()}
      </header>

      {/* ========== GŁÓWNA TREŚĆ ========== */}
      <main className='flex-1 overflow-y-auto overscroll-y-contain'>
        <AnimatePresence mode='wait'>
          {currentStep === "podsumowanie" && renderSummary()}
          {currentStep === "platnosc" && renderPayment()}
          {currentStep === "potwierdzenie" && renderConfirmation()}
        </AnimatePresence>

        <div className='h-20' />
      </main>

      {/* ========== BOTTOM NAV ========== */}
      <BottomNav />

      {/* ========== MODAL REGULAMINU ========== */}
      <AnimatePresence>
        {showRegulations && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6'
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className='w-full max-w-sm bg-card rounded-3xl shadow-2xl p-6'
            >
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-sm font-bold text-foreground'>
                  Regulamin i polityka
                </h2>
                <button
                  onClick={() => setShowRegulations(false)}
                  className='p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer'
                >
                  <X className='w-5 h-5 text-muted dark:text-muted-foreground/70' />
                </button>
              </div>
              <div className='space-y-3 text-[11px] text-muted dark:text-muted-foreground/70 leading-relaxed max-h-64 overflow-y-auto'>
                <p>
                  Rezerwacja jest wiążąca po dokonaniu pełnej płatności.
                  Anulowanie rezerwacji na 48h przed przyjazdem jest bezpłatne.
                </p>
                <p>
                  W przypadku anulowania w terminie krótszym niż 48h, pobierana
                  jest opłata w wysokości 50% wartości rezerwacji.
                </p>
                <p>
                  Dane osobowe są przetwarzane zgodnie z Rozporządzeniem
                  Parlamentu Europejskiego i Rady (UE) 2016/679 (RODO).
                </p>
                <p>
                  Administratorem danych jest Ville Kołobrzeg Sp. z o.o., ul.
                  Morska 15, 78-100 Kołobrzeg.
                </p>
                <p>
                  Płatności są przetwarzane przez zewnętrznego operatora
                  płatności. Dane karty nie są przechowywane na naszych
                  serwerach.
                </p>
              </div>
              <button
                onClick={() => setShowRegulations(false)}
                className='w-full mt-4 py-2.5 rounded-xl bg-accent text-accent-foreground text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer'
              >
                Zamknij
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <>
      <div className='flex md:hidden h-screen w-full'>
        <PaymentContent />
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
            Bezpieczna płatność online
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
                <PaymentContent />
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
