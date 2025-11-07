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

/**
 * Defers a side effect just past the current synchronous call stack (no visual delay).
 *
 * Uses a microtask so it runs ASAP after the current tick (so React state/read consistency is preserved)
 * without an artificial delay like setTimeout(0).
 */
function deferMicro(microtask: () => void): void {
  if (typeof queueMicrotask === 'function') {
    queueMicrotask(microtask);
  } else {
    // in case queueMicrotask is not available
    Promise.resolve().then(microtask);
  }
}

/**
 * Coarse macrotask deferral using a zero-delay timeout
 * (as soon as possible, not paint-aware).
 */
function deferMacro(task: () => void): number {
  return window.setTimeout(task, 0);
}

/**
 * Runs callback on the next animation frame (before paint).
 */
function deferToNextFrame(cb: () => void): number {
  return window.requestAnimationFrame(cb);
}
/**
 * Double-rAF pattern: Ensures at least one paint has occurred before running the callback.
 *
 * Useful for deferring the work until after UI has visually settled.
 *
 * rAF #1 -> (paint) -> rAF #2 -> cb
 */
function deferPostPaint(cb: () => void): void {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(cb);
  });
}

export {
  inDesktopEnv,
  cn,
  endpoint,
  abbreviate,
  delay,
  deferMicro,
  deferMacro,
  deferToNextFrame,
  deferPostPaint,
};
