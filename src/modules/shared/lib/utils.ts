import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

declare global {
  interface Window {
    IN_DESKTOP_ENV?: boolean;
  }
}

export function inDesktopEnv() {
  return !!window.IN_DESKTOP_ENV;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
