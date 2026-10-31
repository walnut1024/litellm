"use client";

import { Globe2 } from "lucide-react";
import { useLocale, useTranslation } from "@/contexts/LocaleContext";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const t = useTranslation();
  return (
    <Button
      variant="ghost"
      size="sm"
      className="moma-language"
      aria-label={t("Language")}
      onClick={() => setLocale(locale === "zh-CN" ? "en" : "zh-CN")}
    >
      <Globe2 className="size-4" />
      <span className="moma-language-label">{locale === "zh-CN" ? "中文 / EN" : "EN / 中文"}</span>
      <span className="moma-language-short">{locale === "zh-CN" ? "中" : "EN"}</span>
    </Button>
  );
}
