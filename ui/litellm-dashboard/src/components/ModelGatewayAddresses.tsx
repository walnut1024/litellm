"use client";

import { LocalizedText as L } from "@/contexts/LocaleContext";
import CopyButton from "@/components/shared/CopyButton";
import { getGatewayBaseUrl } from "@/components/networking";

export function ModelGatewayAddresses() {
  const gatewayBaseUrl = getGatewayBaseUrl().replace(/\/+$/, "").replace(/\/v1$/, "");
  const openAiBaseUrl = `${gatewayBaseUrl}/v1`;
  return (
    <div className="mb-2 grid min-w-0 gap-4 rounded-lg border bg-card p-3 lg:grid-cols-2">
      <section aria-labelledby="openai-base-url-label" className="flex min-w-0 flex-col gap-2">
        <span id="openai-base-url-label" className="text-sm font-medium">
          <L>OpenAI Base URL</L>
        </span>
        <div className="flex flex-col items-start gap-2 text-sm sm:flex-row sm:flex-wrap sm:items-center">
          <code className="min-w-0 break-all font-mono">{openAiBaseUrl}</code>
          <CopyButton value={openAiBaseUrl} label="Copy OpenAI URL" variant="action" className="shrink-0" />
        </div>
        <p className="text-sm text-muted-foreground">
          <L>Enter this address as the Base URL in an OpenAI-compatible client, including the final /v1.</L>
        </p>
      </section>
      <section aria-labelledby="anthropic-base-url-label" className="flex min-w-0 flex-col gap-2">
        <span id="anthropic-base-url-label" className="text-sm font-medium">
          <L>Anthropic Base URL</L>
        </span>
        <div className="flex flex-col items-start gap-2 text-sm sm:flex-row sm:flex-wrap sm:items-center">
          <code className="min-w-0 break-all font-mono">{gatewayBaseUrl}</code>
          <CopyButton value={gatewayBaseUrl} label="Copy Anthropic URL" variant="action" className="shrink-0" />
        </div>
        <p className="text-sm text-muted-foreground">
          <L>Enter this address in the Anthropic SDK base_url or ANTHROPIC_BASE_URL, without adding /v1.</L>
        </p>
      </section>
    </div>
  );
}
