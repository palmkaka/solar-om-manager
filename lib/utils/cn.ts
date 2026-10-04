import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * ผสม class names โดย resolve Tailwind conflicts อัตโนมัติ
 * @example cn('px-4 py-2', condition && 'bg-blue-500', 'hover:bg-blue-600')
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
