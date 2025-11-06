import { clsx, type ClassValue } from 'clsx';
import { isEmpty } from 'lodash-es';
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

function endpoint(
  route: string,
  opts?: {
    protocol?: 'http' | 'https' | 'ws' | 'wss';
    queryParams?: Record<string, string>;
  },
) {
  const protocol = opts?.protocol || 'http';
  const queryParams = opts?.queryParams ?? {};

  if (isEmpty(queryParams)) {
    return `${protocol}://${API_HOST}${route}`;
  }

  const queryString = new URLSearchParams(queryParams).toString();
  return `${protocol}://${API_HOST}${route}?${queryString}`;
}

const deferSideEffect = setTimeout;

function abbreviate(text: string) {
  const parts = text.split(' ');

  if (parts.length >= 2) {
    return parts.map(n => n[0]).join('');
  }

  if (text.length > 2) {
    return text.substring(0, 2);
  }

  return text;
}

function delay(ms: number) {
  return new Promise<void>(resolve => {
    window.setTimeout(resolve, ms);
  });
}

export { inDesktopEnv, cn, endpoint, deferSideEffect, abbreviate, delay };
