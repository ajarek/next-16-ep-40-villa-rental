"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  Apple,
  Loader2,
  Check,
  X,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import BottomNav from "@/components/BottomNav";

// ============================================================
// STAŁE
// ============================================================

const AUTH_MODES = {
  LOGIN: "login",
  REGISTER: "register",
} as const;

type AuthMode = (typeof AUTH_MODES)[keyof typeof AUTH_MODES];

// ============================================================
// GŁÓWNY KOMPONENT
// ============================================================

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, initialized, login, register, loginWithGoogle, resetPassword } =
    useAuth();

  const [mode, setMode] = useState<AuthMode>(AUTH_MODES.LOGIN);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const emailRef = useRef<HTMLInputElement>(null);

  // Przekieruj jeśli użytkownik jest już zalogowany
  useEffect(() => {
    if (initialized && user) {
      const redirect = searchParams.get("redirect") || "/";
      // Zabezpieczenie przed open redirect – tylko względne ścieżki
      const safeRedirect =
        redirect.startsWith("/") && !redirect.startsWith("//")
          ? redirect
          : "/";
      router.push(safeRedirect);
    }
  }, [initialized, user, router, searchParams]);

  // Focus na email przy zmianie trybu
  useEffect(() => {
    setError("");
    setSuccessMsg("");
    setTimeout(() => emailRef.current?.focus(), 100);
  }, [mode]);

  const toggleMode = () => {
    setMode((prev) =>
      prev === AUTH_MODES.LOGIN ? AUTH_MODES.REGISTER : AUTH_MODES.LOGIN
    );
  };

  // Walidacja
  const validate = (): string | null => {
    if (!email.trim()) return "Adres email jest wymagany";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Nieprawidłowy format adresu email";
    if (!password) return "Hasło jest wymagane";
    if (password.length < 6) return "Hasło musi mieć co najmniej 6 znaków";
    if (mode === AUTH_MODES.REGISTER) {
      if (!name.trim()) return "Imię i nazwisko jest wymagane";
      if (!acceptTerms) return "Zaakceptuj regulamin i politykę prywatności";
    }
    return null;
  };

  // Submit formularza
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    const result =
      mode === AUTH_MODES.LOGIN
        ? await login(email, password)
        : await register(email, password, name);

    setSubmitting(false);

    if (!result.success) {
      setError(result.error ?? "Wystąpił nieoczekiwany błąd");
    }
    // Jeśli success – useEffect z przekierowaniem zadziała automatycznie
  };

  // Logowanie przez Google
  const handleGoogleLogin = async () => {
    setError("");
    setSubmitting(true);

    // Symulowane logowanie gdy Firebase nie jest skonfigurowany
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      await new Promise((r) => setTimeout(r, 1000));
      setSubmitting(false);
      setError("Firebase nie jest skonfigurowany. Uzupełnij zmienne w .env.local");
      return;
    }

    const result = await loginWithGoogle();
    setSubmitting(false);
    if (!result.success) {
      setError(result.error ?? "Wystąpił błąd logowania przez Google");
    }
  };

  // Reset hasła
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setError("");
    setSubmitting(true);

    const result = await resetPassword(resetEmail);
    setSubmitting(false);

    if (result.success) {
      setResetSent(true);
    } else {
      setError(result.error ?? "Wystąpił błąd");
    }
  };

  // Animacje
  const formVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  if (loading) {
    return (
      <div className="relative flex flex-col h-full w-full overflow-hidden bg-background">
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-foreground/40 animate-spin" />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden bg-background">
      {/* ========== NAGŁÓWEK ========== */}
      <header className="shrink-0 flex items-center gap-3 px-4 pt-4 pb-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/15 transition-colors cursor-pointer"
          aria-label="Powrót"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-base font-extrabold text-foreground">
            {mode === AUTH_MODES.LOGIN ? "Logowanie" : "Rejestracja"}
          </h1>
          <p className="text-[10px] text-muted dark:text-muted-foreground/70">
            {mode === AUTH_MODES.LOGIN
              ? "Witaj ponownie w Ville Kołobrzeg"
              : "Dołącz do Ville Kołobrzeg"}
          </p>
        </div>
      </header>

      {/* ========== GŁÓWNA TREŚĆ ========== */}
      <main className="flex-1 overflow-y-auto px-5">
        {/* Logo / Brand */}
        <div className="flex flex-col items-center pt-6 pb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 18, stiffness: 200 }}
            className="w-16 h-16 rounded-2xl bg-foreground/5 flex items-center justify-center mb-4"
          >
            <ShieldCheck className="w-8 h-8 text-foreground/60" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl font-extrabold text-foreground tracking-tight"
          >
            {mode === AUTH_MODES.LOGIN ? "Witaj ponownie" : "Utwórz konto"}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-xs text-muted dark:text-muted-foreground/70 mt-1 text-center px-8"
          >
            {mode === AUTH_MODES.LOGIN
              ? "Zaloguj się, aby zarządzać rezerwacjami"
              : "Zarejestruj się i zyskaj 5% rabatu na pierwszą rezerwację"}
          </motion.p>
        </div>

        {/* Formularz */}
        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            variants={formVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeInOut" }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            {/* Pole: Imię i nazwisko (tylko rejestracja) */}
            <AnimatePresence>
              {mode === AUTH_MODES.REGISTER && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label htmlFor="name" className="block text-[11px] font-semibold text-foreground/70 mb-1.5 ml-1">
                    Imię i nazwisko
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30 pointer-events-none" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jan Kowalski"
                      className="w-full h-11 pl-10 pr-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-border/60 text-xs text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-foreground/30 focus:ring-2 focus:ring-foreground/5 transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pole: Email */}
            <div>
              <label htmlFor="email" className="block text-[11px] font-semibold text-foreground/70 mb-1.5 ml-1">
                Adres email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30 pointer-events-none" />
                <input
                  ref={emailRef}
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jan@example.com"
                  autoComplete="email"
                  className="w-full h-11 pl-10 pr-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-border/60 text-xs text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-foreground/30 focus:ring-2 focus:ring-foreground/5 transition-all"
                />
              </div>
            </div>

            {/* Pole: Hasło */}
            <div>
              <label htmlFor="password" className="block text-[11px] font-semibold text-foreground/70 mb-1.5 ml-1">
                Hasło
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30 pointer-events-none" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === AUTH_MODES.LOGIN ? "••••••••" : "Minimum 6 znaków"}
                  autoComplete={mode === AUTH_MODES.LOGIN ? "current-password" : "new-password"}
                  className="w-full h-11 pl-10 pr-10 rounded-2xl bg-black/5 dark:bg-white/5 border border-border/60 text-xs text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-foreground/30 focus:ring-2 focus:ring-foreground/5 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer"
                  aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-foreground/30 hover:text-foreground/60 transition-colors" />
                  ) : (
                    <Eye className="w-4 h-4 text-foreground/30 hover:text-foreground/60 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Zapomniałem hasła (tylko login) */}
            {mode === AUTH_MODES.LOGIN && (
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email);
                  setShowResetModal(true);
                }}
                className="self-end text-[11px] font-medium text-foreground/50 hover:text-foreground/80 transition-colors -mt-1 cursor-pointer"
              >
                Zapomniałem hasła
              </button>
            )}

            {/* Zgoda na regulamin (tylko rejestracja) */}
            <AnimatePresence>
              {mode === AUTH_MODES.REGISTER && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-start gap-2.5"
                >
                  <button
                    type="button"
                    onClick={() => setAcceptTerms(!acceptTerms)}
                    className={`mt-0.5 w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-all cursor-pointer ${
                      acceptTerms
                        ? "bg-foreground border-foreground"
                        : "border-border/80 hover:border-foreground/40"
                    }`}
                    aria-label="Zaakceptuj regulamin"
                  >
                    {acceptTerms && (
                      <Check className="w-3 h-3 text-background" strokeWidth={3} />
                    )}
                  </button>
                  <p className="text-[11px] text-muted dark:text-muted-foreground/70 leading-relaxed">
                    Akceptuję{" "}
                    <button type="button" className="font-semibold underline underline-offset-2 hover:text-foreground transition-colors cursor-pointer">
                      regulamin
                    </button>{" "}
                    oraz{" "}
                    <button type="button" className="font-semibold underline underline-offset-2 hover:text-foreground transition-colors cursor-pointer">
                      politykę prywatności
                    </button>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Komunikat błędu */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20"
                >
                  <X className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span className="text-[11px] font-medium text-red-400">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Komunikat sukcesu */}
            <AnimatePresence>
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-[11px] font-medium text-emerald-400">{successMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Przycisk submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-2xl bg-foreground text-background text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-1 shadow-lg shadow-foreground/10 flex items-center justify-center"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : mode === AUTH_MODES.LOGIN ? (
                "Zaloguj się"
              ) : (
                "Utwórz konto"
              )}
            </button>
          </motion.form>
        </AnimatePresence>

        {/* Separator */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-border/60" />
          <span className="text-[10px] text-muted dark:text-muted-foreground/50 uppercase tracking-wider font-medium">
            lub kontynuuj przez
          </span>
          <div className="flex-1 h-px bg-border/60" />
        </div>

        {/* Social login */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={submitting}
            className="flex-1 h-11 rounded-2xl bg-black/5 dark:bg-white/5 border border-border/60 flex items-center justify-center gap-2 hover:bg-black/10 dark:hover:bg-white/10 transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Zaloguj przez Google"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-[11px] font-semibold text-foreground/70">Google</span>
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => {
              setSuccessMsg("");
              setError("Logowanie przez Apple będzie dostępne wkrótce");
            }}
            className="flex-1 h-11 rounded-2xl bg-black/5 dark:bg-white/5 border border-border/60 flex items-center justify-center gap-2 hover:bg-black/10 dark:hover:bg-white/10 transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Zaloguj przez Apple"
          >
            <Apple className="w-4 h-4 text-foreground/70" />
            <span className="text-[11px] font-semibold text-foreground/70">Apple</span>
          </button>
        </div>

        {/* Przełącznik logowanie/rejestracja */}
        <div className="flex items-center justify-center gap-1.5 mt-8 mb-4">
          <span className="text-[11px] text-muted dark:text-muted-foreground/70">
            {mode === AUTH_MODES.LOGIN
              ? "Nie masz jeszcze konta?"
              : "Masz już konto?"}
          </span>
          <button
            type="button"
            onClick={toggleMode}
            className="text-[11px] font-bold text-foreground underline underline-offset-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            {mode === AUTH_MODES.LOGIN ? "Zarejestruj się" : "Zaloguj się"}
          </button>
        </div>
      </main>

      {/* ========== BOTTOM NAV ========== */}
      <BottomNav />

      {/* ========== MODAL RESETU HASŁA ========== */}
      <AnimatePresence>
        {showResetModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResetModal(false)}
              className="absolute inset-0 bg-black/40 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute inset-0 z-50 flex items-center justify-center p-6"
              onClick={(e) => e.target === e.currentTarget && setShowResetModal(false)}
            >
              <div className="w-full max-w-sm bg-card rounded-3xl shadow-2xl p-6">
                {!resetSent ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-foreground">Reset hasła</h3>
                      <button
                        onClick={() => {
                          setShowResetModal(false);
                          setResetSent(false);
                        }}
                        className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4 text-muted dark:text-muted-foreground/70" />
                      </button>
                    </div>
                    <p className="text-[11px] text-muted dark:text-muted-foreground/70 mb-4 leading-relaxed">
                      Podaj adres email powiązany z kontem, a wyślemy Ci link do resetowania hasła.
                    </p>
                    <form onSubmit={handleResetPassword} className="flex flex-col gap-3">
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30 pointer-events-none" />
                        <input
                          id="reset-email"
                          name="reset-email"
                          type="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          placeholder="jan@example.com"
                          className="w-full h-11 pl-10 pr-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-border/60 text-xs text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-foreground/30 transition-all"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submitting || !resetEmail.trim()}
                        className="w-full h-10 rounded-2xl bg-foreground text-background text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
                      >
                        {submitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Wyślij link resetujący"
                        )}
                      </button>
                    </form>
                    {error && (
                      <p className="text-[10px] text-red-400 mt-2 text-center">{error}</p>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center py-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 15, stiffness: 200 }}
                      className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4"
                    >
                      <Check className="w-6 h-6 text-emerald-500" />
                    </motion.div>
                    <h3 className="text-sm font-bold text-foreground mb-1">Link wysłany!</h3>
                    <p className="text-[11px] text-muted dark:text-muted-foreground/70 text-center leading-relaxed">
                      Sprawdź swoją skrzynkę odbiorczą. Link resetujący został wysłany na{" "}
                      <span className="font-semibold text-foreground">{resetEmail}</span>.
                    </p>
                    <button
                      onClick={() => {
                        setShowResetModal(false);
                        setResetSent(false);
                        setResetEmail("");
                      }}
                      className="mt-5 px-5 py-2.5 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      Rozumiem
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// STRONA AUTH
// ============================================================
export default function AuthPage() {
  return (
    <>
      {/* === WIDOK MOBILNY (pełny ekran) === */}
      <div className="flex md:hidden h-screen w-full">
        <AuthContent />
      </div>

      {/* === WIDOK DESKTOPOWY (symulator telefonu) === */}
      <div className="hidden md:flex min-h-screen w-full items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#0a2540] via-[#1a3a5c] to-[#0a2540]">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-accent/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute top-[30%] right-[15%] w-[300px] h-[300px] rounded-full bg-accent/5 blur-[80px] pointer-events-none" />

        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
          <span className="text-white/40 text-xs tracking-[0.3em] uppercase font-medium">
            Ville Kołobrzeg
          </span>
          <span className="text-white/20 text-[10px] tracking-wider">
            Mobilna platforma rezerwacji willi
          </span>
        </div>

        <div
          className="relative"
          style={{ width: "390px", height: "844px" }}
        >
          <div
            className="absolute inset-0 rounded-[55px] shadow-[0_60px_120px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.08)] overflow-hidden"
            style={{
              background: "linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 30%, #0d0d0d 60%, #1a1a1a 100%)",
            }}
          >
            <div
              className="absolute rounded-[48px] overflow-hidden bg-background"
              style={{ inset: "8px" }}
            >
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center"
                style={{ width: "130px", height: "34px" }}
              >
                <div className="w-full h-full rounded-b-3xl bg-black/90 flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-zinc-700" />
                  <div className="w-14 h-1.5 rounded-full bg-zinc-800" />
                  <div className="w-2 h-2 rounded-full bg-zinc-600 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-zinc-500" />
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 pt-[34px]">
                <AuthContent />
              </div>
            </div>
            <div
              className="absolute rounded-r-sm bg-zinc-700"
              style={{ right: "-3px", top: "160px", width: "3px", height: "60px" }}
            />
            <div
              className="absolute rounded-l-sm bg-zinc-700"
              style={{ left: "-3px", top: "140px", width: "3px", height: "40px" }}
            />
            <div
              className="absolute rounded-l-sm bg-zinc-700"
              style={{ left: "-3px", top: "195px", width: "3px", height: "40px" }}
            />
            <div
              className="absolute rounded-l-sm bg-zinc-700"
              style={{ left: "-3px", top: "100px", width: "3px", height: "28px" }}
            />
          </div>
          <div
            className="absolute pointer-events-none rounded-[48px] opacity-20"
            style={{
              inset: "8px",
              background: "linear-gradient(120deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%)",
            }}
          />
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <span className="text-white/20 text-[10px] tracking-widest uppercase">
            © 2026 Ville Kołobrzeg
          </span>
        </div>
      </div>
    </>
  );
}
