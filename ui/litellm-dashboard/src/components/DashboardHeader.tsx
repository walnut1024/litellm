"use client";

import { LocalizedText as L } from "@/contexts/LocaleContext";

import { LiteUiMask } from "@/contexts/LiteUiContext";

import { ToolbarSeparator } from "@/components/shared/ToolbarSeparator";
import Link from "next/link";
import { uiHref } from "@/utils/uiHref";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import SidebarAccountMenu from "@/components/SidebarAccountMenu/SidebarAccountMenu";
import { useLogout } from "@/app/(dashboard)/hooks/useLogout";
import { NotificationsBell } from "@/components/Navbar/NotificationsBell/NotificationsBell";
import ViewSwitcher from "@/components/Navbar/ViewSwitcher";
import LiteAdmin from "@/components/liteadmin/LiteAdmin";
import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";
import WorkerDropdown from "@/components/Navbar/WorkerDropdown/WorkerDropdown";
import { useWorker } from "@/hooks/useWorker";
import { clearTokenCookies } from "@/utils/cookieUtils";
import { clearStoredReturnUrl, getLoginUrl } from "@/utils/returnUrlUtils";
import { useState, type ReactNode } from "react";
import { useMediaQuery } from "usehooks-ts";
import { Ellipsis } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { CommandPaletteTrigger } from "@/components/CommandPalette/CommandPaletteTrigger";

export function DashboardHeader({
  accessToken,
  navigationTrigger,
  deploymentHealth,
}: {
  accessToken: string | null;
  navigationTrigger?: ReactNode;
  deploymentHealth?: ReactNode;
}) {
  const logout = useLogout(accessToken);
  const isDesktop = useMediaQuery("(min-width: 768px)", { initializeWithValue: false });
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  if (isDesktop && mobileToolsOpen) setMobileToolsOpen(false);
  const { isControlPlane, selectedWorker } = useWorker();
  const showWorkerSwitch = isControlPlane && selectedWorker !== null;

  const handleWorkerSwitch = (workerId: string) => {
    clearTokenCookies();
    clearStoredReturnUrl();
    localStorage.removeItem("litellm_selected_worker_id");
    localStorage.removeItem("litellm_worker_url");
    window.location.href = `${getLoginUrl()}?worker=${encodeURIComponent(workerId)}`;
  };

  return (
    <header className="moma-header flex flex-none items-center border-b border-border bg-background">
      {navigationTrigger}
      <Link href={uiHref("home")} className="moma-brand">
        MoMA 轻量版
      </Link>

      <div className="ml-auto flex shrink-0 items-center gap-1">
        <LanguageSwitcher />
        <div className="max-md:hidden">
          <CommandPaletteTrigger compact />
        </div>
        <LiteUiMask>
          <LiteAdmin />
        </LiteUiMask>
        <div className="flex flex-none items-center gap-1 max-md:hidden">
          {showWorkerSwitch && (
            <>
              <WorkerDropdown onWorkerSwitch={handleWorkerSwitch} />
              <ToolbarSeparator />
            </>
          )}
          <ToolbarSeparator />
          <ThemeToggle />
          {deploymentHealth}
          <NotificationsBell accessToken={accessToken} />
        </div>
        <div className="flex shrink-0 items-center gap-1 md:hidden">
          <CommandPaletteTrigger mobile />
          {deploymentHealth}
          <NotificationsBell accessToken={accessToken} />
          <Popover open={!isDesktop && mobileToolsOpen} onOpenChange={setMobileToolsOpen}>
            <PopoverTrigger
              render={<Button variant="ghost" size="icon" className="size-11" aria-label="More options" />}
            >
              <Ellipsis />
            </PopoverTrigger>
            <PopoverContent align="end" className="max-w-[calc(100vw-2rem)]">
              <PopoverTitle>
                <L>Gateway tools</L>
              </PopoverTitle>
              <LiteUiMask>
                <ViewSwitcher />
              </LiteUiMask>
              {showWorkerSwitch && <WorkerDropdown onWorkerSwitch={handleWorkerSwitch} />}
              <div className="flex flex-wrap items-center gap-2">
                <ThemeToggle />
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="moma-header-account">
          <SidebarAccountMenu onLogout={logout} />
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
