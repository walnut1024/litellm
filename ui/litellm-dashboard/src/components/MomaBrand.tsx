"use client";

import { useState } from "react";
import { useTheme as useColorTheme } from "next-themes";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/contexts/LocaleContext";

export function MomaBrand({ className = "h-7 max-w-40 object-contain" }: { className?: string }) {
  const { logoUrl, logoUrlDark } = useTheme();
  const { resolvedTheme } = useColorTheme();
  const t = useTranslation();
  const [failedSources, setFailedSources] = useState<readonly string[]>([]);
  const candidates = resolvedTheme === "dark" ? [logoUrlDark, logoUrl] : [logoUrl];
  const src = candidates.find((url) => url && !failedSources.includes(url));

  if (!src) return <>MoMA 轻量版</>;

  return (
    <img
      src={src}
      alt={t("Custom logo")}
      className={className}
      onError={() => setFailedSources((previous) => [...previous, src])}
    />
  );
}
