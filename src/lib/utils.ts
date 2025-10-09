import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { ar } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimestamp(timestamp: any, formatString: string = 'PPpp'): string {
  if (!timestamp) return '-';
  // Firestore timestamps can be objects with seconds and nanoseconds
  const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
  return format(date, formatString, { locale: ar });
}

export function formatShortDate(timestamp: any): string {
    if (!timestamp) return '-';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return format(date, 'dd/MM/yyyy', { locale: ar });
}
