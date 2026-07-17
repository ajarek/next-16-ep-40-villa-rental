"use client"

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
import type { DatePickerProps } from "@/types/components"

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
      <input
        type='hidden'
        name={name}
        value={value ? format(value, "yyyy-MM-dd") : ""}
      />

      <PopoverTrigger
        render={
          <button
            type='button'
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-2xl bg-black/2 dark:bg-white/2 border border-border/60 hover:border-accent/60 transition-colors cursor-pointer w-full text-left",
              className,
            )}
          />
        }
      >
        <CalendarIcon className='w-5 h-5  shrink-0' />
        <div className='flex flex-col min-w-0'>
          {label && (
            <span className='text-[10px] font-bold text-muted dark:text-muted-foreground/70 uppercase tracking-wider'>
              {label}
            </span>
          )}
          <span
            className={cn(
              "text-sm font-semibold truncate",
              value
                ? "text-foreground"
                : "text-muted dark:text-muted-foreground/70",
            )}
          >
            {value ? format(value, "d MMM yyyy", { locale: pl }) : placeholder}
          </span>
        </div>
      </PopoverTrigger>

      <PopoverContent
        className='w-auto p-0 z-200 bg-popover dark:bg-card'
        align={popoverAlign ?? "start"}
        side='top'
        sideOffset={8}
      >
        <Calendar
          mode='single'
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
