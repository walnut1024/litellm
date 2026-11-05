import { LocalizedText as L, useTranslation } from "@/contexts/LocaleContext";

import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import { navAccountDisplayName } from "@/components/Navbar/navDisplayName";
import CopyButton from "@/components/shared/CopyButton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/cva.config";
import { uiHref } from "@/utils/uiHref";
import { ChevronsUpDown, Crown, IdCard, KeyRound, LogOut, Mail, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

function hueFromString(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = seed.charCodeAt(i) + ((h << 5) - h);
  }
  return Math.abs(h) % 360;
}

function initialsFromIdentity(email: string | null, userId: string | null): string {
  const local = email?.split("@")[0]?.trim();
  if (local) {
    const parts = local
      .replace(/[^a-zA-Z0-9]+/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]!.charAt(0)}${parts[1]!.charAt(0)}`.toUpperCase();
    }
    if (parts.length === 1) {
      const p = parts[0]!;
      return p.length >= 2 ? p.slice(0, 2).toUpperCase() : `${p.charAt(0)}`.toUpperCase();
    }
  }
  if (userId && userId.length >= 2) {
    return userId.slice(0, 2).toUpperCase();
  }
  if (userId && userId.length === 1) {
    return `${userId.toUpperCase()}•`;
  }
  return "?";
}

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; children: React.ReactNode }> = ({
  icon,
  label,
  children,
}) => (
  <div className="flex min-h-[34px] items-center justify-between gap-3">
    <span className="flex items-center gap-2 text-[13px] text-muted-foreground">
      {icon}
      <L>{label}</L>
    </span>
    {children}
  </div>
);

const MonoValue: React.FC<{ value: string | null; copyLabel: string }> = ({ value, copyLabel }) => (
  <span className="flex min-w-0 items-center gap-1">
    <span className="max-w-[150px] truncate font-mono text-[13px] font-medium text-foreground" title={value || "-"}>
      {value || "-"}
    </span>
    <CopyButton value={value} label={copyLabel} />
  </span>
);

interface SidebarAccountMenuProps {
  onLogout: () => void;
  collapsed?: boolean;
}

const SidebarAccountMenu: React.FC<SidebarAccountMenuProps> = ({ onLogout, collapsed = false }) => {
  const t = useTranslation();
  const { userId, userEmail, userRoleLabel: userRole, premiumUser, loginMethod } = useAuthorized();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const seed = userEmail || userId || "user";
  const initials = initialsFromIdentity(userEmail, userId);
  const hue = hueFromString(seed);
  const displayName = navAccountDisplayName(userEmail, userId, t("Account"));
  const triggerLabel = t("Account menu for {role}, signed in as {identity}", {
    role: t(userRole ?? "Unknown role"),
    identity: userEmail || userId || t("Unknown"),
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "flex w-full items-center rounded-lg border border-transparent transition-colors hover:bg-sidebar-accent",
          collapsed ? "justify-center px-0 py-1" : "gap-2.5 px-2 py-1.5 text-left",
        )}
        aria-label={triggerLabel}
        title={collapsed ? displayName : undefined}
      >
        <Avatar className="size-[30px] shadow-inner ring-1 ring-black/5" aria-hidden>
          <AvatarFallback className="font-semibold text-white" style={{ backgroundColor: `hsl(${hue} 46% 38%)` }}>
            {initials}
          </AvatarFallback>
        </Avatar>
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-[13px] font-medium text-sidebar-foreground">{displayName}</span>
              {userRole && (
                <span className="block truncate text-[11px] text-muted-foreground">
                  <L>{userRole}</L>
                </span>
              )}
            </span>
            <ChevronsUpDown size={16} strokeWidth={1.75} className="shrink-0 text-muted-foreground" aria-hidden />
          </>
        )}
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="start"
        sideOffset={8}
        className="w-[268px] gap-0 overflow-hidden p-0"
        data-testid="sidebar-account-menu-panel"
      >
        <div className="flex items-center gap-2 border-b border-border px-3 py-3">
          <span className="text-[15px] font-bold tracking-tight text-foreground">MoMA 轻量版</span>
        </div>

        <div className="flex flex-col px-3 py-2">
          <InfoRow icon={<Crown className="size-[17px]" />} label="Tier">
            {premiumUser ? (
              <Badge variant="outline" className="gap-1 border-warning/30 bg-warning/10 text-warning">
                <Crown />
                <L>Premium</L>
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1" title={t("Lite edition")}>
                <Crown />
                <L>Lite edition</L>
              </Badge>
            )}
          </InfoRow>
          <InfoRow icon={<ShieldCheck className="size-[17px]" />} label="Role">
            <Badge variant="secondary">
              <L>{userRole}</L>
            </Badge>
          </InfoRow>
          <InfoRow icon={<Mail className="size-[17px]" />} label="Email">
            <MonoValue value={userEmail} copyLabel="Copy email" />
          </InfoRow>
          <InfoRow icon={<IdCard className="size-[17px]" />} label="User ID">
            <MonoValue value={userId} copyLabel="Copy user ID" />
          </InfoRow>
        </div>

        <Separator />

        {loginMethod === "username_password" && (
          <Button
            variant="ghost"
            onClick={() => {
              setOpen(false);
              router.push(uiHref("change-password"));
            }}
            className="h-[42px] w-full justify-start gap-2.5 rounded-none px-3 text-sm font-medium text-foreground"
          >
            <KeyRound className="size-[19px] text-muted-foreground" />
            <L>Change Password</L>
          </Button>
        )}

        <Button
          variant="ghost"
          onClick={onLogout}
          className="h-[42px] w-full justify-start gap-2.5 rounded-none px-3 text-sm font-medium text-foreground"
        >
          <LogOut className="size-[19px] text-muted-foreground" />
          <L>Logout</L>
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default SidebarAccountMenu;
