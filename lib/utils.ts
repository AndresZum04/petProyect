import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAge(ageLabel: string) {
  return ageLabel
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const SPECIES_LABELS: Record<string, string> = {
  dog: 'Dog',
  cat: 'Cat',
  bird: 'Bird',
  rabbit: 'Rabbit',
  other: 'Other',
}

export const SPECIES_COLORS: Record<string, string> = {
  dog: 'bg-amber-100 text-amber-800',
  cat: 'bg-purple-100 text-purple-800',
  bird: 'bg-cyan-100 text-cyan-800',
  rabbit: 'bg-pink-100 text-pink-800',
  other: 'bg-gray-100 text-gray-700',
}

export const SIZE_LABELS: Record<string, string> = {
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
}

export const GENDER_LABELS: Record<string, string> = {
  male: 'Male',
  female: 'Female',
}
