"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProviderLogo } from "@/components/molecules/models/ProviderLogo";
import { getDisplayModelName } from "@/components/view_model/model_name_display";
import type { ModelData } from "@/components/model_dashboard/types";
import { Button } from "@/components/ui/button";
import { LocalizedText as L } from "@/contexts/LocaleContext";
import { uiHref } from "@/utils/uiHref";

export function ModelCatalog({
  models,
  onModelClick,
}: {
  models: readonly ModelData[];
  onModelClick: (modelId: string) => void;
}) {
  return (
    <div className="moma-model-grid">
      {models.map((model) => {
        const modelName = getDisplayModelName(model);
        return (
          <article key={model.model_info.id} className="moma-model-card">
            <div className="flex items-start gap-2">
              <ProviderLogo provider={model.provider} className="size-7 shrink-0" />
              <div className="min-w-0 flex-1">
                <h3>
                  <button className="text-left hover:text-primary" onClick={() => onModelClick(model.model_info.id)}>
                    {modelName}
                  </button>
                </h3>
              </div>
            </div>
            <dl className="grid gap-2 text-sm text-muted-foreground">
              <div className="flex min-w-0 justify-between gap-4">
                <dt className="shrink-0">
                  <L>Provider</L>
                </dt>
                <dd className="min-w-0 wrap-anywhere text-right text-foreground">{model.provider}</dd>
              </div>
              <div className="flex min-w-0 justify-between gap-4">
                <dt className="shrink-0">
                  <L>Status</L>
                </dt>
                <dd className="text-right text-foreground">
                  <L>{model.model_info.blocked ? "Paused" : "Available"}</L>
                </dd>
              </div>
              {(model.max_input_tokens ?? model.max_tokens) != null && (
                <div className="flex min-w-0 justify-between gap-4">
                  <dt className="shrink-0">
                    <L>Context window</L>
                  </dt>
                  <dd className="min-w-0 text-right text-foreground tabular-nums">
                    {(model.max_input_tokens ?? model.max_tokens)?.toLocaleString()} Token
                  </dd>
                </div>
              )}
            </dl>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t pt-2">
              <Button variant="ghost" size="sm" onClick={() => onModelClick(model.model_info.id)}>
                <L>View details</L>
                <ArrowUpRight />
              </Button>
              <Button
                size="sm"
                disabled={Boolean(model.model_info.blocked)}
                render={model.model_info.blocked ? undefined : <Link href={uiHref("api-keys")} />}
              >
                <L>Use model</L>
              </Button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
