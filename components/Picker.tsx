"use client"

import * as React from "react"
import { format } from "date-fns"
import { pl } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  /** Nazwa pola — przekazywana do ukrytego inputa, umożliwia użycie w formularzu */
  name: string
  /** Aktualnie wybrana data */
  value?: Date
  /** Wywoływane po zmianie daty */
  onChange?: (date: Date | undefined) => void
  /** Etykieta wyświetlana nad przyciskiem */
  label?: string
  /** Tekst zastępczy gdy nie wybrano daty */
  placeholder?: string
  /** Minimalna dozwolona data (wcześniejsze są zablokowane) */
  fromDate?: Date
  /** Klasa CSS nadpisująca styl triggera */
  className?: string
  /** Wyrównanie popovera (start = lewa krawędź, end = prawa krawędź, center = środek) */
  popoverAlign?: "start" | "center" | "end"
}

export function DatePicker({
  name,
  value,
  onChange,
  label,
  placeholder = "Wybierz datę",
  fromDate,
  className,
  popoverAlign,
}: DatePickerProps) {
  const minDate = fromDate ?? new Date()

  return (
    <Popover>
      {/* Ukryty input pozwala odczytać wartość przy submit formularza */}
      <input
        type="hidden"
        name={name}
        value={value ? format(value, "yyyy-MM-dd") : ""}
      />

      {/* Base UI PopoverTrigger używa render prop zamiast asChild */}
      <PopoverTrigger
        render={
          <button
            type="button"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-2xl bg-black/2 dark:bg-white/2 border border-border/60 hover:border-accent/60 transition-colors cursor-pointer w-full text-left",
              className
            )}
          />
        }
      >
        <CalendarIcon className="w-5 h-5  shrink-0" />
        <div className="flex flex-col min-w-0">
          {label && (
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
              {label}
            </span>
          )}
          <span
            className={cn(
              "text-sm font-semibold truncate",
              value ? "text-foreground" : "text-muted"
            )}
          >
            {value ? format(value, "d MMM yyyy", { locale: pl }) : placeholder}
          </span>
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0 z-200 bg-popover dark:bg-card" align={popoverAlign ?? "start"} side="top" sideOffset={8}>
        {/* react-day-picker v10: disabled zamiast fromDate */}
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          disabled={{ before: minDate }}
          startMonth={minDate}
          locale={pl}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}

