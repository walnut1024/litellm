"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ModelHubGroup } from "@/app/(dashboard)/hooks/models/useModels";
import { ProviderLogo, formatModelModeLabel } from "@/components/AIHub/ModelHubProviders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CopyButton from "@/components/shared/CopyButton";
import { LocalizedText as L } from "@/contexts/LocaleContext";
import { uiHref } from "@/utils/uiHref";

export const modelCapabilities = (model: ModelHubGroup): readonly string[] =>
  [
    model.supports_vision && "Vision",
    model.supports_function_calling && "Function calling",
    model.supports_reasoning && "Reasoning",
    model.supports_web_search && "Web search",
  ].filter((label): label is string => Boolean(label));

export function ModelCatalog({
  models,
  onModelClick,
}: {
  models: readonly ModelHubGroup[];
  onModelClick: (modelName: string) => void;
}) {
  return (
    <div className="moma-model-grid">
      {models.map((model) => (
        <article key={model.model_group} className="moma-model-card">
          <div className="flex items-center gap-3">
            <ProviderLogo provider={model.providers[0] ?? ""} className="size-10 shrink-0" />
            <h3 className="min-w-0 flex-1">
              <button className="text-left hover:text-primary" onClick={() => onModelClick(model.model_group)}>
                {model.model_group}
              </button>
            </h3>
          </div>
          {model.description && <p className="line-clamp-3 text-sm text-muted-foreground">{model.description}</p>}
          <dl className="grid gap-2 text-sm text-muted-foreground">
            <div className="flex min-w-0 justify-between gap-4">
              <dt>
                <L>Provider</L>
              </dt>
              <dd className="min-w-0 wrap-anywhere text-right text-foreground">{model.providers.join(", ")}</dd>
            </div>
            <div className="flex min-w-0 justify-between gap-4">
              <dt>
                <L>Mode</L>
              </dt>
              <dd className="text-foreground">
                <L>{formatModelModeLabel(model.mode ?? undefined)}</L>
              </dd>
            </div>
            <div className="flex min-w-0 items-center justify-between gap-4">
              <dt className="shrink-0">
                <L>API model ID</L>
              </dt>
              <dd className="flex min-w-0 items-center gap-1 text-foreground">
                <code className="min-w-0 wrap-anywhere text-right">{model.model_group}</code>
                <CopyButton value={model.model_group} label="Copy model ID" className="shrink-0" />
              </dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-1">
            {modelCapabilities(model).map((label) => (
              <Badge key={label} variant="secondary">
                <L>{label}</L>
              </Badge>
            ))}
          </div>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t pt-2">
            <Button variant="ghost" size="sm" onClick={() => onModelClick(model.model_group)}>
              <L>View details</L>
              <ArrowUpRight />
            </Button>
            <Button size="sm" render={<Link href={uiHref("api-keys")} />}>
              <L>Use model</L>
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
