import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from "react";
import { getProxyBaseUrl } from "@/components/networking";
import { z } from "zod";
import { uiHref } from "@/utils/uiHref";

interface ThemeContextType {
  logoUrl: string | null;
  setLogoUrl: (url: string | null) => void;
  logoUrlDark: string | null;
  setLogoUrlDark: (url: string | null) => void;
  faviconUrl: string | null;
  setFaviconUrl: (url: string | null) => void;
}

const themeImagesSchema = z.object({
  values: z.object({
    logo_url: z.string().nullish(),
    logo_url_dark: z.string().nullish(),
    favicon_url: z.string().nullish(),
  }),
  logo_url_via_proxy: z.boolean().optional(),
  logo_url_dark_via_proxy: z.boolean().optional(),
});

export function resolveThemeImages(
  data: unknown,
  proxyBaseUrl: string | null,
): Pick<ThemeContextType, "logoUrl" | "logoUrlDark" | "faviconUrl"> {
  const settings = themeImagesSchema.parse(data);
  const imageUrl = `${proxyBaseUrl ?? ""}/get_image`;
  return {
    logoUrl: settings.logo_url_via_proxy ? imageUrl : settings.values.logo_url || null,
    logoUrlDark: settings.logo_url_dark_via_proxy ? `${imageUrl}?theme=dark` : settings.values.logo_url_dark || null,
    faviconUrl: settings.values.favicon_url || null,
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
  accessToken?: string | null;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, accessToken }) => {
  const [logoUrl, setLogoUrlValue] = useState<string | null>(null);
  const [logoUrlDark, setLogoUrlDarkValue] = useState<string | null>(null);
  const [faviconUrl, setFaviconUrlValue] = useState<string | null>(null);

  const editRevision = useRef(0);
  const setLogoUrl = useCallback((url: string | null) => {
    editRevision.current += 1;
    setLogoUrlValue(url);
  }, []);
  const setLogoUrlDark = useCallback((url: string | null) => {
    editRevision.current += 1;
    setLogoUrlDarkValue(url);
  }, []);
  const setFaviconUrl = useCallback((url: string | null) => {
    editRevision.current += 1;
    setFaviconUrlValue(url);
  }, []);

  useEffect(() => {
    const loadThemeSettings = async () => {
      const revision = editRevision.current;
      try {
        const proxyBaseUrl = getProxyBaseUrl();
        const url = proxyBaseUrl ? `${proxyBaseUrl}/get/ui_theme_settings` : "/get/ui_theme_settings";
        const response = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          const images = resolveThemeImages(await response.json(), proxyBaseUrl);
          if (editRevision.current !== revision) return;
          setLogoUrlValue(images.logoUrl);
          setLogoUrlDarkValue(images.logoUrlDark);
          setFaviconUrlValue(images.faviconUrl);
        }
      } catch (error) {
        console.warn("Failed to load theme settings from backend:", error);
      }
    };

    loadThemeSettings();
  }, []);

  useEffect(() => {
    const iconUrl = faviconUrl || uiHref("favicon.ico");
    const existingLinks = document.querySelectorAll("link[rel*='icon']");
    if (existingLinks.length > 0) {
      existingLinks.forEach((link) => {
        (link as HTMLLinkElement).href = iconUrl;
      });
    } else {
      const link = document.createElement("link");
      link.rel = "icon";
      link.href = iconUrl;
      document.head.appendChild(link);
    }
  }, [faviconUrl]);

  return (
    <ThemeContext.Provider value={{ logoUrl, setLogoUrl, logoUrlDark, setLogoUrlDark, faviconUrl, setFaviconUrl }}>
      {children}
    </ThemeContext.Provider>
  );
};
