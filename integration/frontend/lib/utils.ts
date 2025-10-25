import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatAddress(address: string): string {
  if (address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'open':
      return 'bg-green-500'
    case 'full':
      return 'bg-yellow-500'
    case 'active':
      return 'bg-blue-500'
    case 'completed':
      return 'bg-gray-500'
    case 'cancelled':
      return 'bg-red-500'
    default:
      return 'bg-gray-400'
  }
}

export function getStatusText(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}
