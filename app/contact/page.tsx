"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  Check,
  ChevronDown,
  MessageCircle,
  Globe,
  Camera,
  Play,
  Building2,
  LifeBuoy,
  Headphones,
  Sparkles,
  Navigation,
  ExternalLink,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import BottomNav from "@/components/BottomNav"

type ContactSubject = "rezerwacja" | "pytanie" | "reklamacja" | "wspolpraca" | "inny"
type FaqItem = {
  q: string
  a: string
  category: string
}

const contactReasons: { id: ContactSubject; label: string }[] = [
  { id: "rezerwacja", label: "Problem z rezerwacją" },
  { id: "pytanie", label: "Pytanie o ofertę" },
  { id: "reklamacja", label: "Reklamacja" },
  { id: "wspolpraca", label: "Współpraca" },
  { id: "inny", label: "Inne" },
]

const quickContacts = [
  {
    icon: Phone,
    label: "Infolinia",
    value: "+48 536 128 088",
    href: "tel:+48536128088",
    desc: "Pn–Pt 8:00–20:00, Sb–Nd 9:00–18:00",
    color: "bg-emerald-500/10 text-emerald-500",
  },
  {
    icon: Mail,
    label: "E-mail",
    value: "ajarek@poczta.onet.pl",
    href: "mailto:ajarek@poczta.onet.pl",
    desc: "Odpowiadamy w ciągu 2h",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    icon: MapPin,
    label: "Biuro",
    value: "ul. Morska 15, 78-100 Kołobrzeg",
    href: "https://maps.google.com/?q=Kołobrzeg+ul+Morska+15",
    desc: "Zapraszamy po wcześniejszej umowie",
    color: "bg-violet-500/10 text-violet-500",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "+48 536 128 088",
    href: "https://wa.me/48536128088",
    desc: "Szybka odpowiedź na czacie",
    color: "bg-green-500/10 text-green-500",
  },
]

const socialLinks = [
  { icon: Globe, label: "Facebook", href: "#", color: "text-blue-600" },
  { icon: Camera, label: "Instagram", href: "#", color: "text-pink-500" },
  { icon: Play, label: "YouTube", href: "#", color: "text-red-500" },
]

const faqItems: FaqItem[] = [
  {
    q: "Jak anulować rezerwację?",
    a: "Anulowanie rezerwacji jest możliwe bezpłatnie do 48h przed planowanym przyjazdem. W tym celu zaloguj się do swojego profilu, przejdź do zakładki 'Moje rezerwacje' i wybierz opcję anulowania. Potwierdzenie anulowania otrzymasz na e-mail.",
    category: "rezerwacja",
  },
  {
    q: "Jakie metody płatności akceptujecie?",
    a: "Akceptujemy wszystkie popularne metody płatności: karty płatnicze (Visa, Mastercard), BLIK, Apple Pay, Google Pay oraz przelewy online przez Przelewy24. Wszystkie płatności są w pełni szyfrowane i bezpieczne.",
    category: "platnosc",
  },
  {
    q: "Czy mogę przyjechać ze zwierzęciem?",
    a: "To zależy od konkretnej willi. Niektóre nasze obiekty akceptują zwierzęta – informację znajdziesz w szczegółach oferty w sekcji 'Zasady domu'. Zalecamy wcześniejszy kontakt z właścicielem w celu ustalenia szczegółów.",
    category: "obiekt",
  },
  {
    q: "Jaka jest godzina zameldowania i wymeldowania?",
    a: "Standardowe godziny to zameldowanie od 15:00 do 20:00, a wymeldowanie do 11:00. Dokładne godziny różnią się w zależności od willi – sprawdź je w szczegółach oferty. Istnieje możliwość wcześniejszego zameldowania po wcześniejszym uzgodnieniu.",
    category: "obiekt",
  },
  {
    q: "Czy otrzymam fakturę za pobyt?",
    a: "Tak, każda rezerwacja jest dokumentowana fakturą VAT. Faktura zostanie wysłana automatycznie na adres e-mail podany podczas rezerwacji w ciągu 24h od dokonania płatności. Jeśli potrzebujesz faktury z innymi danymi, skontaktuj się z nami przed dokonaniem rezerwacji.",
    category: "platnosc",
  },
  {
    q: "Co w przypadku złej pogody?",
    a: "Wille są w pełni wyposażone, aby zapewnić komfort niezależnie od pogody. Wiele z nich posiada baseny kryte, sauny, kominki i przestronne salony. W razie ekstremalnych warunków pogodowych istnieje możliwość przesunięcia terminu pobytu – zapraszamy do kontaktu.",
    category: "rezerwacja",
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" as const },
  }),
}

function ContactContent() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [subject, setSubject] = useState<ContactSubject>("pytanie")
  const [message, setMessage] = useState("")
  const [showSubjectPicker, setShowSubjectPicker] = useState(false)
  const [sent, setSent] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [faqFilter, setFaqFilter] = useState<string>("wszystkie")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !message) return
    setSent(true)
  }

  const faqCategories = [
    { id: "wszystkie", label: "Wszystkie" },
    { id: "rezerwacja", label: "Rezerwacja" },
    { id: "platnosc", label: "Płatność" },
    { id: "obiekt", label: "Obiekt" },
  ]

  const filteredFaq = faqFilter === "wszystkie"
    ? faqItems
    : faqItems.filter((f) => f.category === faqFilter)

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden bg-background">
      {/* ========== NAGŁÓWEK ========== */}
      <header className="shrink-0 bg-card/80 backdrop-blur-sm border-b border-border/50 z-30">
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Powrót"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-lg font-bold text-foreground tracking-tight">
              Kontakt
            </h1>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/10">
            <Headphones className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[9px] font-semibold text-emerald-500">
              Pomoc 24/7
            </span>
          </div>
        </div>
      </header>

      {/* ========== GŁÓWNA TREŚĆ ========== */}
      <main className="flex-1 overflow-y-auto overscroll-y-contain">
        {/* --- HERO Z KARTAMI KONTAKTOWYMI --- */}
        <section className="px-5 pt-5 pb-2">
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="relative rounded-3xl bg-linear-to-br from-[#1a3a5c] via-[#1a3a5c]/95 to-[#1a3a5c]/80 p-5 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <LifeBuoy className="w-4 h-4 text-white/70" />
                <span className="text-[10px] font-semibold text-white/60 uppercase tracking-wider">
                  Jesteśmy dla Ciebie
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-white mt-1 leading-snug">
                Masz pytania?
                <br />
                <span className="text-white/80">Napisz lub zadzwoń</span>
              </h2>
              <p className="text-[11px] text-white/60 mt-2 leading-relaxed max-w-[90%]">
                Nasz zespół jest do Twojej dyspozycji 7 dni w tygodniu.
                Odpowiadamy średnio w 15 minut!
              </p>
            </div>
          </motion.div>
        </section>

        {/* --- SZYBKI KONTAKT --- */}
        <section className="px-5 py-3">
          <div className="grid grid-cols-2 gap-2.5">
            {quickContacts.map((item, i) => {
              const Icon = item.icon
              return (
                <motion.a
                  key={i}
                  custom={i + 1}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="flex flex-col gap-2 px-3.5 py-3.5 rounded-2xl bg-card border border-border/80 hover:border-accent/40 hover:shadow-md transition-all group"
                >
                  <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold text-muted dark:text-muted-foreground/70 uppercase tracking-wider">
                      {item.label}
                    </p>
                    <p className="text-[11px] font-bold text-foreground truncate mt-0.5 group-hover:text-accent-foreground transition-colors">
                      {item.value}
                    </p>
                    <p className="text-[8px] text-muted dark:text-muted-foreground/50 mt-0.5 leading-tight">
                      {item.desc}
                    </p>
                  </div>
                </motion.a>
              )
            })}
          </div>
        </section>

        {/* --- SOCIAL MEDIA --- */}
        <section className="px-5 py-1">
          <motion.div
            custom={5}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex items-center justify-center gap-4 py-3"
          >
            <span className="text-[9px] text-muted dark:text-muted-foreground/50 uppercase tracking-wider font-semibold">
              Obserwuj nas:
            </span>
            <div className="flex items-center gap-2">
              {socialLinks.map((social, i) => {
                const Icon = social.icon
                return (
                  <Link
                    key={i}
                    href={social.href}
                    className="w-9 h-9 rounded-xl bg-black/3 dark:bg-white/5 border border-border/60 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 hover:scale-105 transition-all"
                  >
                    <Icon className={`w-4.5 h-4.5 ${social.color}`} />
                  </Link>
                )
              })}
            </div>
          </motion.div>
        </section>

        {/* --- FORMULARZ KONTAKTOWY --- */}
        <section className="px-5 py-3">
          <motion.div
            custom={6}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
                <Send className="w-4 h-4 text-accent-foreground" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">
                  Formularz kontaktowy
                </h2>
                <p className="text-[10px] text-muted dark:text-muted-foreground/70">
                  Wyślij wiadomość, odpowiemy najszybciej jak to możliwe
                </p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-3 py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15 }}
                    className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20"
                  >
                    <Check className="w-8 h-8 text-white" strokeWidth={3} />
                  </motion.div>
                  <h3 className="text-base font-extrabold text-foreground">
                    Wiadomość wysłana!
                  </h3>
                  <p className="text-xs text-muted dark:text-muted-foreground/70 text-center max-w-[80%]">
                    Dziękujemy za kontakt. Odpowiemy na podany adres e-mail w
                    ciągu 2 godzin.
                  </p>
                  <button
                    onClick={() => {
                      setSent(false)
                      setName("")
                      setEmail("")
                      setPhone("")
                      setMessage("")
                    }}
                    className="mt-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Wyślij kolejną
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleSubmit}
                  className="space-y-3.5"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-muted dark:text-muted-foreground/70 block mb-1.5 font-medium">
                        Imię i nazwisko *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Jan Kowalski"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/3 dark:bg-white/5 border border-border/60 text-sm text-foreground placeholder:text-muted dark:placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/60 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted dark:text-muted-foreground/70 block mb-1.5 font-medium">
                        Telefon
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+48 123 456 789"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/3 dark:bg-white/5 border border-border/60 text-sm text-foreground placeholder:text-muted dark:placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/60 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-muted dark:text-muted-foreground/70 block mb-1.5 font-medium">
                      Adres e-mail *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jan@example.com"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/3 dark:bg-white/5 border border-border/60 text-sm text-foreground placeholder:text-muted dark:placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/60 transition-colors"
                    />
                  </div>

                  <div className="relative">
                    <label className="text-[10px] text-muted dark:text-muted-foreground/70 block mb-1.5 font-medium">
                      Temat
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowSubjectPicker(!showSubjectPicker)}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-black/3 dark:bg-white/5 border border-border/60 text-sm text-foreground focus:outline-none focus:border-accent/60 transition-colors cursor-pointer text-left"
                    >
                      <span>
                        {contactReasons.find((r) => r.id === subject)?.label}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-muted dark:text-muted-foreground/50 transition-transform ${
                          showSubjectPicker ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {showSubjectPicker && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          className="absolute left-0 right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-xl z-40 overflow-hidden"
                        >
                          {contactReasons.map((r) => (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => {
                                setSubject(r.id)
                                setShowSubjectPicker(false)
                              }}
                              className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                                subject === r.id
                                  ? "bg-accent/10 text-accent-foreground font-medium"
                                  : "text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                              }`}
                            >
                              {r.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div>
                    <label className="text-[10px] text-muted dark:text-muted-foreground/70 block mb-1.5 font-medium">
                      Treść wiadomości *
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Opisz swoją sprawę..."
                      required
                      rows={4}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/3 dark:bg-white/5 border border-border/60 text-sm text-foreground placeholder:text-muted dark:placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/60 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!name || !email || !message}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-foreground text-background text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg"
                  >
                    <Send className="w-4 h-4" />
                    Wyślij wiadomość
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </section>

        {/* --- POMOC AWARYJNA (24/7) --- */}
        <section className="px-5 py-1">
          <motion.div
            custom={7}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="relative rounded-3xl bg-linear-to-br from-red-500/10 via-red-500/5 to-transparent border border-red-500/20 p-5 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 flex items-center justify-center shrink-0">
                <LifeBuoy className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-foreground">
                  Pomoc awaryjna 24/7
                </h3>
                <p className="text-[10px] text-muted dark:text-muted-foreground/70 mt-1 leading-relaxed">
                  Problem z zameldowaniem? Awaria w willi? Pilna sprawa?
                  <br />
                  Nasz dyżurny jest dostępny przez całą dobę.
                </p>
                <a
                  href="tel:+48536128088"
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-md shadow-red-500/20"
                >
                  <Phone className="w-3.5 h-3.5" />
                  +48 536 128 088
                </a>
              </div>
            </div>
          </motion.div>
        </section>

        {/* --- FAQ --- */}
        <section className="px-5 py-4">
          <motion.div
            custom={8}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-4"
          >
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-foreground tracking-tight">
                Często zadawane pytania
              </h2>
              <span className="text-[10px] text-muted dark:text-muted-foreground/50">
                {filteredFaq.length} pytań
              </span>
            </div>

            {/* Filtry kategorii FAQ */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
              {faqCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setFaqFilter(cat.id); setOpenFaq(null) }}
                  className={`shrink-0 px-3.5 py-2 rounded-xl text-[10px] font-semibold transition-all cursor-pointer ${
                    faqFilter === cat.id
                      ? "bg-accent text-accent-foreground shadow-sm"
                      : "bg-black/3 dark:bg-white/5 text-muted dark:text-muted-foreground/70 hover:bg-black/5 dark:hover:bg-white/10"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Lista FAQ */}
            <div className="space-y-2">
              {filteredFaq.map((item, i) => {
                const isOpen = openFaq === i
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card border border-border/80 rounded-2xl overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="w-full flex items-center justify-between px-4 py-3.5 text-left cursor-pointer"
                    >
                      <span className="text-xs font-semibold text-foreground pr-2 flex-1">
                        {item.q}
                      </span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="shrink-0"
                      >
                        <ChevronDown className="w-4 h-4 text-muted dark:text-muted-foreground/50" />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-0">
                            <div className="w-full h-px bg-border/40 mb-3" />
                            <p className="text-[11px] text-muted dark:text-muted-foreground/70 leading-relaxed">
                              {item.a}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>

            {filteredFaq.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-6">
                <p className="text-xs text-muted dark:text-muted-foreground/70">
                  Brak pytań w tej kategorii
                </p>
              </div>
            )}
          </motion.div>
        </section>

        {/* --- MAPA / LOKALIZACJA BIURA --- */}
        <section className="px-5 py-1 mb-4">
          <motion.div
            custom={9}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-violet-500" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">
                    Nasze biuro
                  </h2>
                  <p className="text-[10px] text-muted dark:text-muted-foreground/70">
                    ul. Morska 15, 78-100 Kołobrzeg
                  </p>
                </div>
              </div>
              <a
                href="https://maps.google.com/?q=Kołobrzeg+ul+Morska+15"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-accent/10 text-accent-foreground text-[10px] font-semibold hover:bg-accent/20 transition-colors"
              >
                <Navigation className="w-3 h-3" />
                Mapa
              </a>
            </div>

            {/* Stylizowana mapa */}
            <div className="relative w-full h-[160px] rounded-2xl overflow-hidden bg-linear-to-br from-violet-500/10 to-transparent border border-border/60">
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  background: `
                    radial-gradient(circle at 60% 40%, transparent 0, transparent 80px, rgba(139,92,246,0.1) 81px, transparent 82px),
                    radial-gradient(circle at 60% 40%, transparent 0, transparent 160px, rgba(139,92,246,0.08) 161px, transparent 162px),
                    radial-gradient(circle at 30% 70%, transparent 0, transparent 60px, rgba(59,130,246,0.06) 61px, transparent 62px)
                  `,
                }}
              />
              {/* Znacznik biura */}
              <div className="absolute top-[40%] left-[60%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="mt-1 px-2 py-0.5 bg-card rounded-md text-[9px] font-semibold text-foreground shadow-sm border border-border/60 whitespace-nowrap">
                  Ville Kołobrzeg
                </span>
              </div>
              {/* Etykiety miejsc */}
              <div className="absolute bottom-3 left-3 space-y-0.5">
                <span className="text-[9px] text-muted dark:text-muted-foreground/60 block">
                  Plaża · 200 m
                </span>
                <span className="text-[9px] text-muted dark:text-muted-foreground/60 block">
                  Molo · 500 m
                </span>
              </div>
              {/* Przycisk nawigacji */}
              <div className="absolute bottom-3 right-3">
                <a
                  href="https://maps.google.com/dir/?api=1&destination=Kołobrzeg+ul+Morska+15"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 bg-violet-500 text-white text-[10px] font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-md"
                >
                  <Navigation className="w-3 h-3" />
                  Nawiguj
                </a>
              </div>
            </div>

            {/* Godziny otwarcia */}
            <div className="mt-3 flex items-center gap-3 px-3 py-2.5 rounded-xl bg-black/3 dark:bg-white/5">
              <Clock className="w-4 h-4 text-muted dark:text-muted-foreground/50 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-muted dark:text-muted-foreground/70">
                  Pn–Pt: 8:00–20:00 · Sb–Nd: 9:00–18:00
                </span>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
            </div>
          </motion.div>
        </section>

        {/* Przycisk do płatności */}
        <section className="px-5 pb-4">
          <motion.div
            custom={10}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex items-center justify-between px-4 py-3 rounded-2xl bg-linear-to-r from-accent/5 via-accent/10 to-accent/5 border border-accent/20"
          >
            <div className="flex items-center gap-3">
              <ExternalLink className="w-4 h-4 text-accent-foreground" />
              <span className="text-[11px] text-foreground font-medium">
                Sprawdź proces płatności
              </span>
            </div>
            <button
              onClick={() => router.push("/payment")}
              className="px-4 py-1.5 rounded-xl bg-accent text-accent-foreground text-[10px] font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Zobacz
            </button>
          </motion.div>
        </section>

        {/* Dodatkowy padding dla BottomNav */}
        <div className="h-20" />
      </main>

      {/* ========== BOTTOM NAV ========== */}
      <BottomNav />
    </div>
  )
}

export default function ContactPage() {
  return (
    <>
      <div className="flex md:hidden h-screen w-full">
        <ContactContent />
      </div>

      <div className="hidden md:flex min-h-screen w-full items-center justify-center relative overflow-hidden bg-linear-to-br from-[#0a2540] via-[#1a3a5c] to-[#0a2540]">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-accent/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute top-[30%] right-[15%] w-[300px] h-[300px] rounded-full bg-accent/5 blur-[80px] pointer-events-none" />

        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
          <span className="text-white/40 text-xs tracking-[0.3em] uppercase font-medium">
            Ville Kołobrzeg
          </span>
          <span className="text-white/20 text-[10px] tracking-wider">
            Jesteśmy do Twojej dyspozycji
          </span>
        </div>

        <div className="relative" style={{ width: "390px", height: "844px" }}>
          <div
            className="absolute inset-0 rounded-[55px] shadow-[0_60px_120px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.08)] overflow-hidden"
            style={{
              background:
                "linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 30%, #0d0d0d 60%, #1a1a1a 100%)",
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
                <ContactContent />
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
              background:
                "linear-gradient(120deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%)",
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
  )
}
