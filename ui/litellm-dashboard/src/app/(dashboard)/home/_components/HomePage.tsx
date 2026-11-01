"use client";

import Link from "next/link";
import { ArrowUpRight, Boxes, KeyRound, Plus } from "lucide-react";
import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import { useAllProxyModels } from "@/app/(dashboard)/hooks/models/useModels";
import { Button } from "@/components/ui/button";
import { Page } from "@/components/shared/Page";
import { PageHeader, PageHeaderControls, PageHeaderTitle } from "@/components/shared/PageHeader";
import { LineChart } from "@/components/shared/charts/line_chart";
import { LocalizedText as L, useTranslation } from "@/contexts/LocaleContext";
import { uiHref } from "@/utils/uiHref";
import UsageStatStrip from "@/app/(dashboard)/usage/_components/components/overview/UsageStatStrip";
import { dailyTotals, formatCompact } from "@/app/(dashboard)/usage/_components/components/overview/overviewData";
import { HOME_USAGE_DAYS, useHomeUsage } from "./useHomeUsage";

export default function HomePage() {
  const { isViewOnly } = useAuthorized();
  const usage = useHomeUsage();
  const models = useAllProxyModels();
  const t = useTranslation();
  const renderTrend = () => {
    if (usage.failed)
      return (
        <p className="text-sm text-muted-foreground">
          <L>Failed to load usage</L>
        </p>
      );
    if (usage.loading)
      return (
        <p role="status">
          <L>Loading…</L>
        </p>
      );
    return (
      <LineChart
        data={dailyTotals(usage.results)}
        index="date"
        categories={["tokens"]}
        colors={["indigo"]}
        valueFormatter={formatCompact}
        showLegend={false}
        showDots
        className="h-64"
      />
    );
  };
  const renderModels = () => {
    if (models.isError)
      return (
        <p role="alert">
          <L>Failed to load models</L>
        </p>
      );
    if (models.isPending)
      return (
        <p role="status">
          <L>Loading models…</L>
        </p>
      );
    if (models.data?.data.length === 0)
      return (
        <p className="text-muted-foreground">
          <L>No models available. Contact your administrator.</L>
        </p>
      );
    return (
      <div className="moma-model-grid">
        {models.data?.data.slice(0, 3).map((model) => (
          <Link key={model.id} className="moma-model-card hover:border-primary" href={uiHref("models-and-endpoints")}>
            <Boxes className="size-7 text-primary" />
            <h3>{model.id}</h3>
            <span className="text-xs text-primary">
              <L>View model and activate</L>
            </span>
          </Link>
        ))}
      </div>
    );
  };
  return (
    <Page>
      <PageHeader className="flex flex-wrap items-center justify-between gap-4">
        <PageHeaderTitle>
          <L>Welcome to your workspace</L>
        </PageHeaderTitle>
        {!isViewOnly && (
          <PageHeaderControls className="mt-0">
            <Button render={<Link href={uiHref("api-keys?create=true")} />}>
              <Plus />
              <L>Create New Virtual Key</L>
            </Button>
          </PageHeaderControls>
        )}
      </PageHeader>
      <section aria-label={t("Usage, last {days} days", { days: HOME_USAGE_DAYS })}>
        {usage.failed ? (
          <div role="alert" className="moma-panel flex items-center justify-between gap-2">
            <span className="text-destructive">
              <L>Failed to load usage</L>
            </span>
            <Button variant="outline" onClick={usage.retry}>
              <L>Retry</L>
            </Button>
          </div>
        ) : (
          <UsageStatStrip
            results={usage.results}
            totals={usage.totals}
            loading={usage.loading}
            requestCountsPending={usage.requestCountsPending}
            budget={usage.budget}
          />
        )}
      </section>
      <div className="grid gap-6 min-[1100px]:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]">
        <section className="moma-panel" aria-labelledby="home-usage-trend">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 id="home-usage-trend" className="moma-panel-title">
              <L>Token usage trend</L>
            </h2>
            <span className="text-xs text-muted-foreground">{t("Last {days} days", { days: HOME_USAGE_DAYS })}</span>
          </div>
          {renderTrend()}
        </section>
        <section className="moma-panel flex flex-col gap-6" aria-labelledby="home-start">
          <h2 id="home-start" className="moma-panel-title">
            <L>Start using models</L>
          </h2>
          <div className="flex gap-4">
            <Boxes className="size-6 shrink-0 text-primary" />
            <div>
              <h3 className="font-medium">
                <L>Activate a model</L>
              </h3>
              <p className="mt-2 text-xs leading-6 text-muted-foreground">
                <L>Choose an available model and activate access without an order or approval.</L>
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <KeyRound className="size-6 shrink-0 text-primary" />
            <div>
              <h3 className="font-medium">
                <L>Call with an API key</L>
              </h3>
              <p className="mt-2 text-xs leading-6 text-muted-foreground">
                <L>Use the model name and your API key in an OpenAI-compatible client.</L>
              </p>
            </div>
          </div>
          <Button className="mt-auto" render={<Link href={uiHref("models-and-endpoints")} />}>
            <L>Browse models</L>
            <ArrowUpRight />
          </Button>
        </section>
      </div>
      <section className="moma-panel" aria-labelledby="home-models">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 id="home-models" className="moma-panel-title">
            <L>Available models</L>
          </h2>
          <Button variant="ghost" size="sm" render={<Link href={uiHref("models-and-endpoints")} />}>
            <L>View all</L>
            <ArrowUpRight />
          </Button>
        </div>
        {renderModels()}
      </section>
    </Page>
  );
}
