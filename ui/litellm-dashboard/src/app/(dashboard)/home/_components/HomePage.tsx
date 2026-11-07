"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Boxes, KeyRound, Plus } from "lucide-react";
import welcomeArt from "../../../../../public/assets/moma-lite/orbit.svg";
import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import { useAllProxyModels } from "@/app/(dashboard)/hooks/models/useModels";
import { Button } from "@/components/ui/button";
import { Page } from "@/components/shared/Page";
import { PageHeader, PageHeaderControls, PageHeaderDescription, PageHeaderTitle } from "@/components/shared/PageHeader";
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
        className="h-[250px]"
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
          <Link key={model.id} className="moma-model-card hover:border-primary" href={uiHref("model-hub-table")}>
            <Boxes className="size-7 text-primary" />
            <h3>{model.id}</h3>
            <span className="text-xs text-primary">
              <L>View details</L>
            </span>
          </Link>
        ))}
      </div>
    );
  };
  return (
    <Page className="moma-home">
      <div className="moma-home-welcome">
        <Image src={welcomeArt} alt="" width={480} height={280} className="moma-home-welcome-art" />
        <PageHeader>
          <PageHeaderTitle>Welcome to your workspace</PageHeaderTitle>
          <PageHeaderDescription>
            Explore models available to your account and learn how to call them.
          </PageHeaderDescription>
          {!isViewOnly && (
            <PageHeaderControls>
              <Button render={<Link href={uiHref("api-keys?create=true")} />}>
                <Plus />
                <L>Create New Virtual Key</L>
              </Button>
            </PageHeaderControls>
          )}
        </PageHeader>
      </div>
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
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <h2 id="home-usage-trend" className="moma-panel-title">
              <L>Token usage trend</L>
            </h2>
            <span className="text-xs text-muted-foreground">{t("Last {days} days", { days: HOME_USAGE_DAYS })}</span>
          </div>
          {renderTrend()}
        </section>
        <section className="moma-panel moma-home-start flex flex-col gap-3" aria-labelledby="home-start">
          <h2 id="home-start" className="moma-panel-title">
            <L>Start using models</L>
          </h2>
          <div className="moma-home-step">
            <Boxes className="size-5 shrink-0 text-primary" />
            <div>
              <h3 className="font-medium">
                <L>Browse models</L>
              </h3>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                <L>Choose a model you have access to. No activation is required.</L>
              </p>
            </div>
          </div>
          <div className="moma-home-step">
            <KeyRound className="size-5 shrink-0 text-primary" />
            <div>
              <h3 className="font-medium">
                <L>Call with an API key</L>
              </h3>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                <L>Use the model name and your API key in an OpenAI-compatible client.</L>
              </p>
            </div>
          </div>
          <Button className="mt-auto self-start" render={<Link href={uiHref("model-hub-table")} />}>
            <L>Browse models</L>
            <ArrowUpRight />
          </Button>
        </section>
      </div>
      <section className="moma-panel" aria-labelledby="home-models">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 id="home-models" className="moma-panel-title">
            <L>Available models</L>
          </h2>
          <Button variant="ghost" size="sm" render={<Link href={uiHref("model-hub-table")} />}>
            <L>View all</L>
            <ArrowUpRight />
          </Button>
        </div>
        {renderModels()}
      </section>
    </Page>
  );
}
