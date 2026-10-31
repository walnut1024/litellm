"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import React from "react";

import { useTranslation } from "@/contexts/LocaleContext";

import { Button } from "@/components/ui/button";

const ThemeToggle: React.FC = () => {
  const t = useTranslation();
  const { setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const label = t(isDark ? "Switch to light mode" : "Switch to dark mode");

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      title={label}
      className="text-muted-foreground"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Moon /> : <Sun />}
    </Button>
  );
};

export default ThemeToggle;
