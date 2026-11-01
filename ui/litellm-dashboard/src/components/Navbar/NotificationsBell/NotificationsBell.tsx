"use client";

import { useHealthReadinessDetails } from "@/app/(dashboard)/hooks/healthReadiness/useHealthReadinessDetails";
import { LocalizedText as L, useTranslation } from "@/contexts/LocaleContext";
import { useLiteUi } from "@/contexts/LiteUiContext";
import {
  type LatestReleaseInfo,
  useLatestReleaseInfo,
} from "@/app/(dashboard)/hooks/latestRelease/useLatestReleaseInfo";
import {
  markAnnouncementRead,
  useAnnouncementRead,
  useUnreadAnnouncementCount,
} from "@/app/(dashboard)/hooks/useAnnouncementRead";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/cva.config";
import { isNewerVersion } from "@/utils/versionUtils";
import { Bell } from "lucide-react";
import React, { Fragment } from "react";

export const AUTO_ROUTER_DOCS_URL = "https://docs.litellm.ai/docs/proxy/auto_routing";

interface Announcement {
  readKey: string;
  title: string;
  description: string;
  linkLabel: string;
  href: string;
}

const AUTO_ROUTER_ANNOUNCEMENT: Announcement = {
  readKey: "litellmHideAutoRouterAnnouncement",
  title: "LiteLLM Auto Router",
  description: "Route every request to the cheapest model that can handle it, no prompt changes needed.",
  linkLabel: "Read the docs",
  href: AUTO_ROUTER_DOCS_URL,
};

const describeRelease = (
  { new_features, bug_fixes, other_updates }: LatestReleaseInfo,
  t: ReturnType<typeof useTranslation>,
): string =>
  [
    t(new_features === 1 ? "{count} new feature" : "{count} new features", { count: new_features }),
    t(bug_fixes === 1 ? "{count} fix" : "{count} fixes", { count: bug_fixes }),
    t(other_updates === 1 ? "and {count} other update" : "and {count} other updates", { count: other_updates }),
  ].join(", ");

const upgradeAnnouncement = (
  currentVersion: string | null | undefined,
  latestRelease: LatestReleaseInfo | null | undefined,
  t: ReturnType<typeof useTranslation>,
): Announcement | null => {
  if (!currentVersion || !latestRelease || !isNewerVersion(currentVersion, latestRelease.version)) {
    return null;
  }
  return {
    readKey: `litellm:upgradeBannerDismissed:${latestRelease.version}`,
    title: t("LiteLLM v{version} is available", { version: latestRelease.version }),
    description: t("{changes}. Your current version is v{version}", {
      changes: describeRelease(latestRelease, t),
      version: currentVersion,
    }),
    linkLabel: "View release notes",
    href: latestRelease.release_url,
  };
};

const AnnouncementItem: React.FC<{ announcement: Announcement }> = ({ announcement }) => {
  const t = useTranslation();
  const read = useAnnouncementRead(announcement.readKey);
  return (
    <article aria-label={t(announcement.title)} className="flex flex-col gap-2">
      <p className="text-sm font-medium">
        <L>{announcement.title}</L>
      </p>
      <p className="text-sm leading-snug text-muted-foreground">
        <L>{announcement.description}</L>
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <a
          className={cn(buttonVariants({ size: "sm" }))}
          href={announcement.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          <L>{announcement.linkLabel}</L>
        </a>
        {read ? null : (
          <Button variant="link" size="sm" className="px-1!" onClick={() => markAnnouncementRead(announcement.readKey)}>
            <L>Mark as read</L>
          </Button>
        )}
      </div>
    </article>
  );
};

interface NotificationsBellViewProps {
  currentVersion: string | null | undefined;
  latestRelease: LatestReleaseInfo | null | undefined;
}

export const NotificationsBellView: React.FC<NotificationsBellViewProps> = ({ currentVersion, latestRelease }) => {
  const t = useTranslation();
  const lite = useLiteUi();
  const upgrade = upgradeAnnouncement(currentVersion, latestRelease, t);
  const announcements = [upgrade, lite === null ? AUTO_ROUTER_ANNOUNCEMENT : null].filter(
    (item): item is Announcement => item !== null,
  );
  const unreadCount = useUnreadAnnouncementCount(announcements.map((announcement) => announcement.readKey));

  return (
    <Popover>
      <PopoverTrigger
        className="flex! h-9! w-9! items-center justify-center rounded-md! text-muted-foreground transition-colors hover:bg-accent! hover:text-foreground!"
        aria-label={unreadCount > 0 ? t("Notifications, {count} unread", { count: unreadCount }) : t("Notifications")}
      >
        <span className="relative inline-flex">
          <Bell className="size-4" aria-hidden />
          {unreadCount > 0 ? <Badge className="absolute -top-0.5 -right-1 size-1.5 p-0" aria-hidden /> : null}
        </span>
      </PopoverTrigger>
      <PopoverContent align="end" aria-label={t("Notifications")}>
        {announcements.length === 0 && (
          <p className="text-sm text-muted-foreground">
            <L>No notifications</L>
          </p>
        )}
        {announcements.map((announcement, index) => (
          <Fragment key={announcement.readKey}>
            {index > 0 ? <Separator /> : null}
            <AnnouncementItem announcement={announcement} />
          </Fragment>
        ))}
      </PopoverContent>
    </Popover>
  );
};

export const NotificationsBell: React.FC<{ accessToken: string | null }> = ({ accessToken }) => {
  const { data: healthData } = useHealthReadinessDetails(accessToken);
  const { data: latestRelease } = useLatestReleaseInfo(accessToken);
  return <NotificationsBellView currentVersion={healthData?.litellm_version} latestRelease={latestRelease} />;
};
