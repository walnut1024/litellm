"use client";

import { useLocale } from "@/contexts/LocaleContext";
import { systemResourceLabel } from "@/utils/systemResourceLabel";
import { ChevronRight } from "lucide-react";
import * as React from "react";

import { useEntityLinkClick } from "@/components/shared/EntityLink";
import { cn } from "@/lib/cva.config";

interface IdentityCellProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
  titleClassName?: string;
}

const INTERACTIVE_CELL_CLASSES =
  "group -mx-2 flex w-[calc(100%+1rem)] cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset";

const NavigationChevron = () => (
  <ChevronRight
    aria-hidden="true"
    className="ml-auto size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary group-focus-visible:text-primary"
  />
);

export function IdentityCell({ title, subtitle, badge, onClick, href, className, titleClassName }: IdentityCellProps) {
  const { locale } = useLocale();
  const displayTitle = typeof title === "string" ? systemResourceLabel(title, locale) : title;
  const displaySubtitle = typeof subtitle === "string" ? systemResourceLabel(subtitle, locale) : subtitle;
  const hasSubtitleRow = (subtitle != null && subtitle !== "") || badge != null;
  const interactive = href != null || onClick != null;

  const body = (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span
        className={cn(
          "truncate text-sm font-medium text-foreground",
          titleClassName,
          interactive &&
            "text-primary underline-offset-4 group-hover:text-accent-foreground group-hover:underline group-focus-visible:underline",
        )}
      >
        {displayTitle}
      </span>
      {hasSubtitleRow && (
        <span className="flex min-w-0 items-center gap-2">
          {subtitle != null && subtitle !== "" && (
            <span className="truncate font-mono text-xs text-muted-foreground">{displaySubtitle}</span>
          )}
          {badge}
        </span>
      )}
    </div>
  );

  if (href != null) {
    return <IdentityCellLink href={href} className={className} body={body} />;
  }

  if (onClick != null) {
    return (
      <button type="button" onClick={onClick} className={cn(INTERACTIVE_CELL_CLASSES, className)}>
        {body}
        <NavigationChevron />
      </button>
    );
  }

  return <div className={cn("min-w-0", className)}>{body}</div>;
}

function IdentityCellLink({ href, className, body }: { href: string; className?: string; body: React.ReactNode }) {
  const handleClick = useEntityLinkClick(href);

  return (
    <a href={href} onClick={handleClick} className={cn(INTERACTIVE_CELL_CLASSES, className)}>
      {body}
      <NavigationChevron />
    </a>
  );
}
