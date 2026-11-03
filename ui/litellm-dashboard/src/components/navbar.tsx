import { useWorker } from "@/hooks/useWorker";
import { uiHref } from "@/utils/uiHref";
import { revokeSessionAndClearClientState, useLogout } from "@/app/(dashboard)/hooks/useLogout";
import { getLoginUrl } from "@/utils/returnUrlUtils";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import React from "react";
import { NotificationsBell } from "./Navbar/NotificationsBell/NotificationsBell";
import UserDropdown from "./Navbar/UserDropdown/UserDropdown";
import ThemeToggle from "./ThemeToggle/ThemeToggle";
import ViewSwitcher from "./Navbar/ViewSwitcher";
import WorkerDropdown from "./Navbar/WorkerDropdown/WorkerDropdown";

interface NavbarProps {
  accessToken: string | null;
  isPublicPage: boolean;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  deploymentHealth?: React.ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({
  accessToken,
  isPublicPage = false,
  sidebarCollapsed = false,
  onToggleSidebar,
  deploymentHealth,
}) => {
  const { isControlPlane, selectedWorker } = useWorker();
  const showWorkerSwitch = isControlPlane && selectedWorker !== null;

  const handleLogout = useLogout(accessToken);

  const handleWorkerSwitch = (workerId: string) => {
    void revokeSessionAndClearClientState(accessToken).finally(() => {
      window.location.href = `${getLoginUrl()}?worker=${encodeURIComponent(workerId)}`;
    });
  };

  return (
    <nav className="sticky top-0 z-chrome border-b border-border bg-card">
      <div className="w-full">
        <div className="flex h-14 items-center px-4">
          <div className="flex shrink-0 items-center">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="mr-2 flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <span className="text-lg">
                  {sidebarCollapsed ? (
                    <PanelLeftOpen className="size-[18px]" />
                  ) : (
                    <PanelLeftClose className="size-[18px]" />
                  )}
                </span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <Link href={uiHref("home")} className="moma-brand">
                MoMA 轻量版
              </Link>
            </div>
          </div>

          {!isPublicPage && (
            <div className="ml-4 flex shrink-0 items-center border-l border-border pl-4">
              <ViewSwitcher />
            </div>
          )}

          <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-4">
            {showWorkerSwitch && (
              <div className="flex shrink-0 items-center">
                <WorkerDropdown onWorkerSwitch={handleWorkerSwitch} />
              </div>
            )}

            {!isPublicPage && (
              <div className="flex shrink-0 items-center border-l border-border pl-4">
                <div className="flex items-center gap-0.5 rounded-lg bg-muted px-1 py-0 transition-colors hover:bg-accent">
                  <ThemeToggle />
                  <span className="mx-0.5 h-6 w-px shrink-0 bg-border" aria-hidden />
                  {deploymentHealth}
                  <NotificationsBell accessToken={accessToken} />
                  <span className="mx-0.5 h-6 w-px shrink-0 bg-border" aria-hidden />
                  <UserDropdown onLogout={handleLogout} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
