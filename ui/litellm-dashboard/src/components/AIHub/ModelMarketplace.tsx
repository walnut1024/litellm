"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { parseAsString, useQueryStates } from "nuqs";
import { ArrowUpRight, ChevronDown, ChevronUp, RefreshCw, Search } from "lucide-react";
import coverOne from "../../../public/assets/moma-lite/model-cover-1.webp";
import coverTwo from "../../../public/assets/moma-lite/model-cover-2.webp";
import coverThree from "../../../public/assets/moma-lite/model-cover-3.webp";
import { useModelHub, type ModelHubGroup } from "@/app/(dashboard)/hooks/models/useModels";
import { ModelCatalog, modelCapabilities } from "@/components/ModelCatalog";
import { ModelGatewayAddresses } from "@/components/ModelGatewayAddresses";
import { PageHeader, PageHeaderTitle, PageHeaderDescription, PageHeaderControls } from "@/components/shared/PageHeader";
import CopyButton from "@/components/shared/CopyButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
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
const spotlightCovers = [coverOne, coverTwo, coverThree];

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

function MarketplaceIntro({
  models,
  loaded,
  onModelClick,
}: {
  models: readonly ModelHubGroup[];
  loaded: boolean;
  onModelClick: (modelName: string) => void;
}) {
  const [showSpotlights, setShowSpotlights] = useState(true);
  const spotlights = spotlightCovers.flatMap((cover, index) => {
    const model = models[index];
    return model ? [{ cover, model }] : [];
  });
  const hasSpotlights = loaded && spotlights.length > 0;
  return (
    <>
      <PageHeader>
        <PageHeaderTitle>Model marketplace</PageHeaderTitle>
        <PageHeaderDescription>
          Explore models available to your account and learn how to call them.
        </PageHeaderDescription>
        {hasSpotlights && (
          <PageHeaderControls>
            <Button
              variant="ghost"
              aria-expanded={showSpotlights}
              aria-controls="model-spotlights"
              onClick={() => setShowSpotlights(!showSpotlights)}
            >
              {showSpotlights ? <ChevronUp /> : <ChevronDown />}
              <L>{showSpotlights ? "Hide featured models" : "Show featured models"}</L>
            </Button>
          </PageHeaderControls>
        )}
      </PageHeader>
      {hasSpotlights && (
        <div id="model-spotlights" className="moma-model-spotlights" hidden={!showSpotlights}>
          {spotlights.map(({ model, cover }) => (
            <button
              key={model.model_group}
              type="button"
              className="moma-model-spotlight"
              onClick={() => onModelClick(model.model_group)}
            >
              <Image src={cover} alt="" fill className="moma-spotlight-art" />
              <span className="moma-spotlight-copy">
                <span className="text-xs">{model.providers.join(", ")}</span>
                <strong>{model.model_group}</strong>
                <Badge className="border-0 bg-white/20 text-white">
                  <L>{formatModelModeLabel(model.mode ?? undefined)}</L>
                </Badge>
                <span className="flex items-center gap-1.5 text-xs">
                  <L>View details</L>
                  <ArrowUpRight className="size-3.5" />
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </>
  );
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
  const openModel = (model: string) => void setParams({ model });
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
      <MarketplaceIntro models={models} loaded={loaded} onModelClick={openModel} />
      <ModelGatewayAddresses />
      <div className="moma-catalog-toolbar">
        <InputGroup className="w-full sm:w-64 lg:w-[min(36%,360px)]">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            aria-label={t("Search models")}
            placeholder={t("Search models")}
            value={params.search}
            onChange={(event) => void setParams({ search: event.target.value || null })}
          />
        </InputGroup>
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
          <ModelCatalog models={visibleModels} onModelClick={openModel} />
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
        <DialogContent className="moma-catalog-detail max-h-[85dvh] overflow-y-auto sm:max-w-3xl">
          {selectedModel && (
            <>
              <DialogHeader className="pr-6 wrap-anywhere">
                <DialogTitle>{selectedModel.model_group}</DialogTitle>
              </DialogHeader>
              <div className="flex items-center gap-2 text-muted-foreground">
                <ProviderLogo provider={selectedModel.providers[0] ?? ""} className="size-6" />
                {selectedModel.providers.join(", ")}
              </div>
              {selectedModel.description && <p className="text-sm">{selectedModel.description}</p>}
              <div className="flex min-w-0 flex-wrap items-center gap-2 rounded bg-muted px-4 py-2">
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
              <dl className="grid gap-px overflow-hidden rounded-xl bg-border sm:grid-cols-2">
                {details.map(({ label, value }) => (
                  <div key={label} className="bg-muted p-4">
                    <dt className="text-xs text-muted-foreground">
                      <L>{label}</L>
                    </dt>
                    <dd className="mt-1 font-medium tabular-nums">{value}</dd>
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
