"use client";

export type CookieConsent = {
  necessary: true; // always on, not user-configurable
  analytics: boolean;
  marketing: boolean;
};

const STORAGE_KEY = "ld_cookie_consent";

export function getStoredConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storeConsent(consent: Omit<CookieConsent, "necessary">) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ necessary: true, ...consent }));
  } catch {
    // localStorage unavailable (private mode, etc.) — consent banner will just re-show next visit
  }
}
