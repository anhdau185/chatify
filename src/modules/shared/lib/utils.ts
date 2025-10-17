import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { API_HOST } from '../constants';

declare global {
  interface Window {
    IN_DESKTOP_ENV?: boolean;
  }
}

function inDesktopEnv() {
  return !!window.IN_DESKTOP_ENV;
}

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function endpoint(route: string) {
  return `${API_HOST}${route}`;
}

const deferSideEffect = setTimeout;

export { inDesktopEnv, cn, endpoint, deferSideEffect };
