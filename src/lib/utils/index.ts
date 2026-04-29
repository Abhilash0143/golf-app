import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'GBP') {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(amount)
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function getMonthName(month: number) {
  return new Date(2000, month - 1).toLocaleString('en-GB', { month: 'long' })
}

export function calculatePrizePool(totalPool: number, rollover: number) {
  return {
    jackpot: totalPool * 0.4 + rollover,
    fourMatch: totalPool * 0.35,
    threeMatch: totalPool * 0.25,
  }
}
