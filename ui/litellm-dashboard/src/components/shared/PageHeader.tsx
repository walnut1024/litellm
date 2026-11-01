"use client";

import { LocalizedText, useTranslation } from "@/contexts/LocaleContext";

import type { ComponentProps } from "react";

import { cn } from "@/lib/cva.config";

export function PageHeader({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="page-header" className={cn("shrink-0", className)} {...props} />;
}

export function PageHeaderTitle({ className, children, ...props }: ComponentProps<"h1">) {
  return (
    <h1
      className={cn(
        "flex items-center gap-2.5 text-2xl font-semibold tracking-tight text-foreground [&_svg]:size-5 [&_svg]:flex-none [&_svg]:stroke-[1.75]",
        className,
      )}
      {...props}
    >
      <LocalizedText>{children}</LocalizedText>
    </h1>
  );
}

export function PageHeaderDescription({ className, children, ...props }: ComponentProps<"p">) {
  return (
    <p className={cn("mt-1.5 text-sm text-muted-foreground", className)} {...props}>
      <LocalizedText>{children}</LocalizedText>
    </p>
  );
}

export function PageHeaderControls({ className, ...props }: ComponentProps<"div">) {
  const t = useTranslation();
  return (
    <div
      data-slot="page-controls"
      role="group"
      aria-label={t("Page controls")}
      className={cn("mt-5 flex min-h-9 items-center gap-2", className)}
      {...props}
    />
  );
}
