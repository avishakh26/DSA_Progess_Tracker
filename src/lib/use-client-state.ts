"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Boolean flag persisted to localStorage.
 *
 * Written with useSyncExternalStore rather than useState + useEffect so the
 * stored value is read during render on the client (no post-mount flash) while
 * still returning `initial` on the server.
 */
export function usePersistedFlag(
  key: string,
  initial = false,
): [boolean, (next: boolean) => void] {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const handler = (e: StorageEvent) => {
        if (e.key === null || e.key === key) onChange();
      };
      window.addEventListener("storage", handler);
      window.addEventListener(`local-store:${key}`, onChange);
      return () => {
        window.removeEventListener("storage", handler);
        window.removeEventListener(`local-store:${key}`, onChange);
      };
    },
    [key],
  );

  const value = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(key) === "1",
    () => initial,
  );

  const set = useCallback(
    (next: boolean) => {
      localStorage.setItem(key, next ? "1" : "0");
      // Same-tab writes don't fire `storage`, so nudge subscribers directly.
      window.dispatchEvent(new Event(`local-store:${key}`));
    },
    [key],
  );

  return [value, set];
}

/** Tracks a CSS media query, returning `false` during server render. */
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
