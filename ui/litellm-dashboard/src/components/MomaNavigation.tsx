"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
const servicePages = ["home", "models", "api-keys"];
const usagePages = ["new_usage", "logs"];

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
  const sections = [
    { label: "Model services", items: servicePages.flatMap((page) => items.filter((item) => item.page === page)) },
    { label: "Usage and costs", items: items.filter((item) => usagePages.includes(item.page)) },
    ...groups
      .filter((group) => ["ACCESS CONTROL", "SETTINGS"].includes(group.groupLabel))
      .map((group) => ({
        label: group.groupLabel === "ACCESS CONTROL" ? "Access Control" : "System Settings",
        items: group.items,
      })),
  ];
  const link = (item: MenuItem) => (
    <Link
      key={item.key}
      href={uiHref(routeOf(item))}
      aria-current={current === routeOf(item) ? "page" : undefined}
      className="moma-nav-link"
    >
      {item.icon}
      {t(item.page === "models" ? "Model marketplace" : labelText(item))}
    </Link>
  );
  return (
    <nav aria-label={t("Navigation")} className="moma-navigation">
      {sections
        .filter((section) => section.items.length > 0)
        .map((section) => (
          <section key={section.label} aria-label={t(section.label)}>
            <div className="moma-nav-section">{t(section.label)}</div>
            {section.items.flatMap((item) => item.children ?? [item]).map(link)}
          </section>
        ))}
    </nav>
  );
}
