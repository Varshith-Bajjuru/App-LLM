import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRandomGradient() {
  const gradients = [
    'from-purple-600 via-pink-600 to-blue-600',
    'from-blue-600 via-green-600 to-yellow-600',
    'from-red-600 via-purple-600 to-blue-600',
    'from-teal-600 via-cyan-600 to-blue-600',
  ];
  return gradients[Math.floor(Math.random() * gradients.length)];
}