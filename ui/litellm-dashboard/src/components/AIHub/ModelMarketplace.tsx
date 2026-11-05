"use client";

import { useMemo } from "react";
import { parseAsString, useQueryStates } from "nuqs";
import { RefreshCw } from "lucide-react";
import { useModelHub, type ModelHubGroup } from "@/app/(dashboard)/hooks/models/useModels";
import { ModelCatalog, modelCapabilities } from "@/components/ModelCatalog";
import { ModelGatewayAddresses } from "@/components/ModelGatewayAddresses";
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from "@/components/shared/PageHeader";
import CopyButton from "@/components/shared/CopyButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getGatewayBaseUrl } from "@/components/networking";
import { generateCodeSnippet } from "@/components/chat_ui/CodeSnippets";
import { getEndpointType } from "@/components/chat_ui/mode_endpoint_mapping";
import { valueFormatterSpend } from "@/components/UsagePage/utils/value_formatters";
import { LocalizedText as L, useLocale, useTranslation } from "@/contexts/LocaleContext";
import { filterBySearchTerm } from "@/utils/searchUtils";
import { ProviderLogo, formatModelModeLabel } from "./ModelHubProviders";

const catalogParams = {
  search: parseAsString.withDefault(""),
  provider: parseAsString.withDefault(""),
  mode: parseAsString.withDefault(""),
  model: parseAsString.withDefault(""),
};

const pricePerMillion = (cost: number | null | undefined, missing: string): string =>
  cost == null ? missing : valueFormatterSpend(cost * 1_000_000);

function modelExample(model: ModelHubGroup): string {
  const params: Parameters<typeof generateCodeSnippet>[0] = {
    apiKeySource: "custom",
    accessToken: null,
    apiKey: "YOUR_API_KEY",
    inputMessage: "Hello",
    chatHistory: [{ role: "user", content: "Hello", isImage: false }],
    selectedTags: [],
    selectedVectorStores: [],
    selectedGuardrails: [],
    selectedPolicies: [],
    selectedMCPServers: [],
    endpointType: getEndpointType(model.mode ?? "chat"),
    selectedModel: model.model_group,
    selectedSdk: "openai",
    proxySettings: { PROXY_BASE_URL: `${getGatewayBaseUrl().replace(/\/+$/, "").replace(/\/v1$/, "")}/v1` },
  };
  return generateCodeSnippet(params);
}

export default function ModelMarketplace() {
  const t = useTranslation();
  const { locale } = useLocale();
  const { data, isLoading, isError, isFetching, refetch } = useModelHub();
  const [params, setParams] = useQueryStates(catalogParams);
  const models = useMemo(() => (data?.data ?? []).filter((model) => !model.providers.includes("a2a")), [data]);
  const providers = useMemo(() => Array.from(new Set(models.flatMap((model) => model.providers))).sort(), [models]);
  const modes = useMemo(() => Array.from(new Set(models.map((model) => model.mode ?? "chat"))).sort(), [models]);
  const matchingModels = filterBySearchTerm(models, params.search, (model) => [model.model_group, model.description]);
  const visibleModels = matchingModels.filter((model) => {
    const matchesProvider = !params.provider || model.providers.includes(params.provider);
    const matchesMode = !params.mode || (model.mode ?? "chat") === params.mode;
    return matchesProvider && matchesMode;
  });
  const loaded = !isLoading && !isError;
  const selectedModel = models.find((model) => model.model_group === params.model);
  const example = selectedModel ? modelExample(selectedModel) : "";
  const details = selectedModel
    ? [
        { label: "Mode", value: t(formatModelModeLabel(selectedModel.mode ?? undefined)) },
        { label: "Max input tokens", value: selectedModel.max_input_tokens?.toLocaleString(locale) ?? t("Not set") },
        { label: "Max output tokens", value: selectedModel.max_output_tokens?.toLocaleString(locale) ?? t("Not set") },
        {
          label: "Input price per million tokens",
          value: pricePerMillion(selectedModel.input_cost_per_token, t("Not set")),
        },
        {
          label: "Output price per million tokens",
          value: pricePerMillion(selectedModel.output_cost_per_token, t("Not set")),
        },
      ]
    : [];

  return (
    <div className="moma-model-page flex flex-col gap-4">
      <PageHeader>
        <PageHeaderTitle>Model marketplace</PageHeaderTitle>
        <PageHeaderDescription>
          Explore models available to your account and learn how to call them.
        </PageHeaderDescription>
      </PageHeader>
      <ModelGatewayAddresses />
      <div className="moma-catalog-toolbar">
        <Input
          className="min-w-40 flex-1"
          aria-label={t("Search models")}
          placeholder={t("Search models")}
          value={params.search}
          onChange={(event) => void setParams({ search: event.target.value || null })}
        />
        <Select value={params.provider} onValueChange={(provider) => void setParams({ provider: provider || null })}>
          <SelectTrigger aria-label={t("Provider")} className="w-full sm:w-48">
            {params.provider || t("All providers")}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t("All providers")}</SelectItem>
            {providers.map((provider) => (
              <SelectItem key={provider} value={provider}>
                {provider}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={params.mode} onValueChange={(mode) => void setParams({ mode: mode || null })}>
          <SelectTrigger aria-label={t("Mode")} className="w-full sm:w-44">
            {params.mode ? t(formatModelModeLabel(params.mode)) : t("All modes")}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t("All modes")}</SelectItem>
            {modes.map((mode) => (
              <SelectItem key={mode} value={mode}>
                {t(formatModelModeLabel(mode))}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => void refetch()} disabled={isFetching}>
          <RefreshCw />
          <L>Refresh</L>
        </Button>
      </div>
      {isLoading && (
        <p role="status">
          <L>Loading models…</L>
        </p>
      )}
      {isError && (
        <div role="alert">
          <L>Unable to load models. Please try again.</L>
        </div>
      )}
      {loaded &&
        (visibleModels.length > 0 ? (
          <ModelCatalog models={visibleModels} onModelClick={(model) => void setParams({ model })} />
        ) : (
          <div className="py-10 text-center text-muted-foreground">
            <p>
              <L>
                {models.length === 0
                  ? "No models available. Contact your administrator."
                  : "No models match your search or filters. Try resetting them."}
              </L>
            </p>
            {models.length > 0 && (
              <Button variant="ghost" onClick={() => void setParams({ search: null, provider: null, mode: null })}>
                <L>Reset filters</L>
              </Button>
            )}
          </div>
        ))}
      <Dialog
        open={Boolean(selectedModel)}
        onOpenChange={(open) => {
          if (!open) void setParams({ model: null });
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          {selectedModel && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedModel.model_group}</DialogTitle>
              </DialogHeader>
              <div className="flex items-center gap-2 text-muted-foreground">
                <ProviderLogo provider={selectedModel.providers[0] ?? ""} className="size-6" />
                {selectedModel.providers.join(", ")}
              </div>
              {selectedModel.description && <p className="text-sm">{selectedModel.description}</p>}
              <div className="flex min-w-0 items-center gap-2">
                <span className="text-muted-foreground">
                  <L>API model ID</L>
                </span>
                <code className="min-w-0 break-all">{selectedModel.model_group}</code>
                <CopyButton value={selectedModel.model_group} label="Copy model ID" />
              </div>
              <div className="flex flex-wrap gap-1">
                {modelCapabilities(selectedModel).map((label) => (
                  <Badge key={label} variant="secondary">
                    <L>{label}</L>
                  </Badge>
                ))}
              </div>
              <dl className="grid gap-3 sm:grid-cols-2">
                {details.map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-sm text-muted-foreground">
                      <L>{label}</L>
                    </dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="flex items-center justify-between">
                <h3 className="font-medium">
                  <L>Usage example</L>
                </h3>
                <CopyButton value={example} label="Copy code" variant="action" />
              </div>
              <pre className="max-h-80 overflow-auto rounded-lg bg-muted p-3 text-sm">
                <code>{example}</code>
              </pre>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
