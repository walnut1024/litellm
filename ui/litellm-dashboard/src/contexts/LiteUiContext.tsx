"use client";

import { createContext, useContext, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthContext";
import { isAdminRole } from "@/utils/roles";
import { routeSegmentForPathname } from "@/utils/uiHref";
import { liteRouteAllowed } from "@/utils/liteUi";

export const LiteUiContext = createContext<{ route: string; admin: boolean } | null>(null);
export const useLiteUi = () => useContext(LiteUiContext);

export function LiteUiMask({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const lite = useLiteUi();
  const hidden = lite !== null && (!adminOnly || !lite.admin);
  return (
    <div hidden={hidden} style={{ display: hidden ? "none" : "contents" }}>
      {children}
    </div>
  );
}

export function LiteUiBoundary({ children }: { children: ReactNode }) {
  const { userRole, authLoading } = useAuth();
  const route = routeSegmentForPathname(usePathname() ?? "");
  const allowed = liteRouteAllowed(route, userRole);
  if (!allowed && authLoading) return null;
  return (
    <LiteUiContext.Provider value={{ route, admin: isAdminRole(userRole) }}>
      {allowed ? (
        children
      ) : (
        <div className="flex h-full min-h-64 flex-col items-center justify-center gap-2 p-8 text-center">
          <h1 className="text-2xl font-semibold">Access Denied</h1>
          <p className="text-muted-foreground">This page is not available in this edition.</p>
        </div>
      )}
    </LiteUiContext.Provider>
  );
}
