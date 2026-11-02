"use client";

import { Children, createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { translate, type Locale } from "@/i18n/translate";

const localeKey = "moma.locale";
let memoryLocale: Locale = "zh-CN";
const listeners = new Set<() => void>();
export const getLocale = (): Locale => {
  try {
    const saved = localStorage.getItem(localeKey);
    if (saved === "en" || saved === "zh-CN") return saved;
    return saved === null ? memoryLocale : "zh-CN";
  } catch {
    return memoryLocale;
  }
};
const notify = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
};
const setLocale = (locale: Locale) => {
  memoryLocale = locale;
  try {
    localStorage.setItem(localeKey, locale);
  } catch {}
  notify();
};
const LocaleContext = createContext<{ locale: Locale; setLocale: (locale: Locale) => void }>({
  locale: "en",
  setLocale: () => {},
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore<Locale>(subscribe, getLocale, () => "zh-CN");
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  const value = useMemo(() => ({ locale, setLocale }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export const useLocale = () => useContext(LocaleContext);

export function useTranslation() {
  const { locale } = useLocale();
  return useMemo(
    () => (message: string, values?: Readonly<Record<string, string | number>>) => translate(message, locale, values),
    [locale],
  );
}

export function LocalizedText({ children }: { children: ReactNode }) {
  const t = useTranslation();
  return <>{Children.map(children, (child) => (typeof child === "string" ? t(child) : child))}</>;
}

export function LocalizedLabel({ children }: { children: ReactNode }) {
  return (
    <span data-slot="localized-label">
      <LocalizedText>{children}</LocalizedText>
    </span>
  );
}
