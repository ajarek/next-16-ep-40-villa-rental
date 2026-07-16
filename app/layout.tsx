import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/ThemeProvider"
import { AuthProvider } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "Ville Kołobrzeg – Luksusowe Wille i Apartamenty",
  description:
    "Znajdź i zarezerwuj luksusową willę nad Bałtykiem w Kołobrzegu. Ekskluzywne oferty, bezpieczne płatności, sprawdzone opinie gości.",
  keywords: [
    "willa Kołobrzeg",
    "apartament Bałtyk",
    "luksusowy wypoczynek",
    "rezerwacja",
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang='pl'
      className={cn("h-full", "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem("theme");
                  if (theme === "dark") {
                    document.documentElement.classList.add("dark");
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className='min-h-full antialiased bg-background text-foreground'>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
