"use client";

import { useState } from "react";
import ecloudBrand from "../../public/assets/logos/ecloud-brand.png";
import { useTheme as useColorTheme } from "next-themes";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/contexts/LocaleContext";

export function MomaBrand({ className = "h-7 w-auto max-w-full object-contain sm:max-w-40" }: { className?: string }) {
  const { logoUrl, logoUrlDark } = useTheme();
  const { resolvedTheme } = useColorTheme();
  const t = useTranslation();
  const [failedSources, setFailedSources] = useState<readonly string[]>([]);
  const candidates = resolvedTheme === "dark" ? [logoUrlDark, logoUrl, ecloudBrand.src] : [logoUrl, ecloudBrand.src];
  const src = candidates.find((url) => url && !failedSources.includes(url));

  if (!src) return <>MoMA 轻量版</>;

  return (
    <img
      src={src}
      alt={src === ecloudBrand.src ? t("{name} logo", { name: "移动云" }) : t("Custom logo")}
      className={className}
      onError={() => setFailedSources((previous) => [...previous, src])}
    />
  );
}
