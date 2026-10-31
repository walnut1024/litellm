"use client";

import { createContext, useContext, useMemo } from "react";
import { useTranslation } from "./LocaleContext";
import { useUIConfig } from "@/app/(dashboard)/hooks/uiConfig/useUIConfig";
import { keepTerminology, toSiTerminology, type Term } from "@/lib/terminology";

const TerminologyContext = createContext<Term>(keepTerminology);

export function TerminologyProvider({ children }: { children: React.ReactNode }) {
  const { data: uiConfig } = useUIConfig();
  const t = useTranslation();
  const term = useMemo(
    () => (text: string) => t(uiConfig?.use_si_terminology ? toSiTerminology(text) : text),
    [t, uiConfig?.use_si_terminology],
  );
  return <TerminologyContext.Provider value={term}>{children}</TerminologyContext.Provider>;
}

export const useTerminology = (): Term => useContext(TerminologyContext);
