import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, CircleOff } from "lucide-react"

export const metadata: Metadata = {
  title: "Strona nie znaleziona",
  description: "Strona, której szukasz nie istnieje lub została przeniesiona.",
}

export default function NotFound() {
  return (
    <main className='flex flex-col items-center justify-center h-screen gap-6  px-4'>
      <div className='flex flex-col items-center gap-2 text-center'>
        <div className='relative text-2xl group-hover:scale-110 transition-transform duration-300'>
          <CircleOff className='w-24 h-24 text-red-500' />
        </div>
        <h2 className='text-3xl font-bold tracking-tight sm:text-4xl dark:text-white text-black'>
          Ups! Strona nie została znaleziona
        </h2>
        <p className='max-w-84 text-muted dark:text-muted-foreground mt-2'>
          Wygląda na to, że zgubiliśmy drogę. Strona, której szukasz, mogła
          zostać usunięta, przeniesiona lub jest tymczasowo niedostępna.
        </p>
      </div>
      <Link
        href='/'
        className='flex items-center justify-center gap-2 w-fit px-8 py-4 bg-green-500 font-rajdhani text-lg font-bold tracking-wider  rounded-xl hover:scale-105 active:scale-95 transition-all duration-300 group '
      >
        <span className='dark:text-white text-black'>
          Wróć na stronę główną
        </span>
        <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
      </Link>
    </main>
  )
}
