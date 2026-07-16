export interface DatePickerProps {
  name: string
  value?: Date
  onChange?: (date: Date | undefined) => void
  label?: string
  placeholder?: string
  fromDate?: Date
  className?: string
  popoverAlign?: "start" | "center" | "end"
}

export type MobileMenuProps = {
  isOpen: boolean
  onClose: () => void
}
