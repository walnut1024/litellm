"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import useIsOrgAdmin from "@/app/(dashboard)/hooks/useIsOrgAdmin";
import { useTeams } from "@/app/(dashboard)/hooks/teams/useTeams";
import { useUISettings } from "@/app/(dashboard)/hooks/uiSettings/useUISettings";
import {
  menuGroups,
  visibleMenuGroups,
  routeOf,
  labelText,
  type MenuVisibilityContext,
  type MenuItem,
} from "@/components/leftnav";
import { useTranslation } from "@/contexts/LocaleContext";
import { isUserTeamAdminForAnyTeam } from "@/utils/roles";
import { routeSegmentForPathname, uiHref } from "@/utils/uiHref";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const primaryPages = new Set(["home", "api-keys", "models", "new_usage", "teams"]);

export function MomaNavigation() {
  const { userRole, userId, isViewOnly } = useAuthorized();
  const isOrgAdmin = useIsOrgAdmin();
  const { data: teams } = useTeams();
  const { data: settings } = useUISettings();
  const values = settings?.values;
  const t = useTranslation();
  const current = routeSegmentForPathname(usePathname()) || "home";
  const visibility: MenuVisibilityContext = {
    userRole,
    isViewOnly,
    isOrgAdmin,
    isTeamAdmin: isUserTeamAdminForAnyTeam(teams ?? null, userId ?? ""),
    enabledPagesInternalUsers: values?.enabled_ui_pages_internal_users ?? null,
    enableProjectsUI: Boolean(values?.enable_projects_ui),
    disableAgentsForInternalUsers: Boolean(values?.disable_agents_for_internal_users),
    allowAgentsForTeamAdmins: Boolean(values?.allow_agents_for_team_admins),
    disableVectorStoresForInternalUsers: Boolean(values?.disable_vector_stores_for_internal_users),
    allowVectorStoresForTeamAdmins: Boolean(values?.allow_vector_stores_for_team_admins),
  };
  const groups = visibleMenuGroups(menuGroups, visibility);
  const items = groups.flatMap((group) => group.items);
  const primary = items.filter((item) => primaryPages.has(item.page));
  const management = items.filter((item) => !primaryPages.has(item.page)).flatMap((item) => item.children ?? [item]);
  const link = (item: MenuItem) => (
    <Link
      key={item.key}
      href={uiHref(routeOf(item))}
      aria-current={current === routeOf(item) ? "page" : undefined}
      className="moma-nav-link"
    >
      {item.icon}
      {t(labelText(item))}
    </Link>
  );
  return (
    <nav aria-label={t("Navigation")} className="moma-navigation">
      {primary.map(link)}
      {management.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger
            className="moma-nav-link"
            data-active={management.some((item) => routeOf(item) === current) || undefined}
          >
            {t("Management")}
            <ChevronDown className="size-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-44">
            {management.map((item) => (
              <DropdownMenuItem key={item.key} render={<Link href={uiHref(routeOf(item))} />}>
                {item.icon}
                {t(labelText(item))}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </nav>
  );
}
