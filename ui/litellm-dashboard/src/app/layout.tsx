import type { Metadata } from "next";
import "./globals.css";
import "./moma-theme.css";
import { LocaleProvider } from "@/contexts/LocaleContext";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ThemeProvider } from "next-themes";

import { AuthProvider } from "@/contexts/AuthContext";
import { LiteUiBoundary } from "@/contexts/LiteUiContext";
import ReactQueryProvider from "@/contexts/ReactQueryProvider";
import HotkeysProvider from "@/contexts/HotkeysProvider";
import { TerminologyProvider } from "@/contexts/TerminologyContext";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "MoMA 轻量版",
  description: "MoMA 企业内部模型服务控制台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // next-themes stamps the theme class on <html> before paint, which the exported markup
    // cannot predict; suppressHydrationWarning confines that mismatch to this element.
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <LocaleProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <NuqsAdapter>
              <ReactQueryProvider>
                <TerminologyProvider>
                  <HotkeysProvider>
                    <AuthProvider>
                      <LiteUiBoundary>{children}</LiteUiBoundary>
                    </AuthProvider>
                  </HotkeysProvider>
                </TerminologyProvider>
                <Toaster />
              </ReactQueryProvider>
            </NuqsAdapter>
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
