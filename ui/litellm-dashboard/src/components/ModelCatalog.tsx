"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { ArrowUpRight, Check, Loader2 } from "lucide-react";
import CopyButton from "@/components/shared/CopyButton";
import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import { useAllProxyModels, useSelectedTeamModels } from "@/app/(dashboard)/hooks/models/useModels";
import { keyKeys, useInfiniteKeys } from "@/app/(dashboard)/hooks/keys/useKeys";
import { ProviderLogo } from "@/components/molecules/models/ProviderLogo";
import { getDisplayModelName } from "@/components/view_model/model_name_display";
import type { ModelData } from "@/components/model_dashboard/types";
import { modelAccessKey, modelMatches } from "@/components/modelAccess";
import { getGatewayBaseUrl, keyCreateCall } from "@/components/networking";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { LocalizedText as L, useTranslation } from "@/contexts/LocaleContext";
import { toast } from "@/lib/toast";
import { uiHref } from "@/utils/uiHref";
import { isAdminRole } from "@/utils/roles";

const createdKeySchema = z.object({ key: z.string().min(1) });

export function ModelCatalog({
  models,
  teamId,
  onModelClick,
}: {
  models: readonly ModelData[];
  teamId: string | null;
  onModelClick: (modelId: string) => void;
}) {
  const { accessToken, userId, userRole, isViewOnly, disabledPersonalKeyCreation } = useAuthorized();
  const t = useTranslation();
  const client = useQueryClient();
  const keys = useInfiniteKeys(100, { userID: userId, status: "active" });
  const personalModels = useAllProxyModels();
  const teamModels = useSelectedTeamModels(teamId);
  const allowedModels = teamId ? teamModels : personalModels;
  const [pending, setPending] = useState<string | null>(null);
  const inFlight = useRef(false);
  const [created, setCreated] = useState<{ key: string; model: string } | null>(null);
  const allKeys = keys.data?.pages.flatMap((page) => page.keys) ?? [];
  const keysLoading = keys.isPending || keys.isFetching || keys.hasNextPage;
  const unavailable = keys.isError || allowedModels.isError;
  const modelsReady = !allowedModels.isPending && !allowedModels.isFetching;
  const accessReady = !keysLoading && !unavailable && modelsReady;
  const personalRestricted = Boolean(disabledPersonalKeyCreation) && !isAdminRole(userRole);
  const personalAllowed = teamId !== null || !personalRestricted;
  const canWrite = !isViewOnly && pending === null && accessReady;
  const scope = { userId: userId ?? "", teamId, checkedAt: keys.dataUpdatedAt };
  const { hasNextPage, isFetching, isError, fetchNextPage } = keys;

  useEffect(() => {
    if (hasNextPage && !isFetching && !isError) void fetchNextPage();
  }, [hasNextPage, isFetching, isError, fetchNextPage]);

  const activate = async (model: string) => {
    if (inFlight.current || isViewOnly) return;
    if (!accessToken || !userId || !accessReady) return;
    if (!personalAllowed) return;
    if (!allowedModels.data?.data.some((entry) => modelMatches(model, entry.id)) || model.includes("*")) return;
    if (modelAccessKey(allKeys, model, scope)) return;
    inFlight.current = true;
    setPending(model);
    try {
      const payload = {
        key_alias: `${model.slice(0, 70)}-${crypto.randomUUID().slice(0, 8)}`,
        models: [model],
        team_id: teamId,
        key_type: "llm_api",
      };
      const response: unknown = await keyCreateCall(accessToken, userId, payload);
      const parsed = createdKeySchema.safeParse(response);
      if (parsed.success) {
        setCreated({ key: parsed.data.key, model });
        toast.success(t("Model activated"));
      } else {
        toast.fromError(t("Check API keys before trying again"));
      }
    } catch (error) {
      toast.fromError(error);
    } finally {
      await client.invalidateQueries({ queryKey: keyKeys.lists() });
      inFlight.current = false;
      setPending(null);
    }
  };

  return (
    <>
      {unavailable && (
        <p role="alert" className="mb-4 text-destructive">
          <L>Unable to check model access. Refresh and try again.</L>
        </p>
      )}
      {!personalAllowed && (
        <p className="mb-4 text-muted-foreground">
          <L>Select a team to activate a model.</L>
        </p>
      )}
      <div className="moma-model-grid">
        {models.map((model) => {
          const modelName = getDisplayModelName(model);
          const existing = userId ? modelAccessKey(allKeys, modelName, scope) : undefined;
          const allowed = allowedModels.data?.data.some((entry) => modelMatches(modelName, entry.id));
          const scopeAvailable = personalAllowed && !model.model_info.blocked && !modelName.includes("*");
          const disabled = !(canWrite && scopeAvailable && allowed);
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
                  {existing && (
                    <span className="mt-1 flex items-center gap-1 text-xs text-success">
                      <Check className="size-3.5" />
                      <L>Activated</L>
                    </span>
                  )}
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                <div className="flex min-w-0 justify-between gap-1">
                  <dt>
                    <L>Provider</L>
                  </dt>
                  <dd className="min-w-0 break-words text-right">{model.provider}</dd>
                </div>
                <div className="flex justify-between gap-1">
                  <dt>
                    <L>Status</L>
                  </dt>
                  <dd>
                    <L>{model.model_info.blocked ? "Paused" : "Available"}</L>
                  </dd>
                </div>
                {(model.max_input_tokens ?? model.max_tokens) != null && (
                  <div className="col-span-2 flex justify-between gap-4">
                    <dt>
                      <L>Context window</L>
                    </dt>
                    <dd>{(model.max_input_tokens ?? model.max_tokens)?.toLocaleString()} Token</dd>
                  </div>
                )}
              </dl>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t pt-2">
                <Button variant="ghost" size="sm" onClick={() => onModelClick(model.model_info.id)}>
                  <L>View details</L>
                  <ArrowUpRight />
                </Button>
                {existing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    render={<Link href={uiHref(`api-keys?key=${encodeURIComponent(existing.token)}`)} />}
                  >
                    <L>Use model</L>
                  </Button>
                ) : (
                  <Button size="sm" disabled={disabled} onClick={() => void activate(modelName)}>
                    {pending === modelName && <Loader2 className="animate-spin" />}
                    <L>{pending === modelName ? "Activating" : "Activate"}</L>
                  </Button>
                )}
              </div>
            </article>
          );
        })}
      </div>
      <Dialog
        open={created !== null}
        onOpenChange={(open) => {
          if (!open) setCreated(null);
        }}
      >
        <DialogContent>
          <DialogTitle>
            <L>Model activated</L>
          </DialogTitle>
          <DialogDescription>
            <L>Save this key now. It will only be shown once.</L>
          </DialogDescription>
          <div className="break-all rounded-lg bg-muted p-4 font-mono text-xs">{created?.key}</div>
          <div className="text-sm">
            <L>Model</L>
            <div className="mt-1 break-all font-mono text-xs">{created?.model}</div>
          </div>
          <div className="text-sm">
            Base URL
            <div className="mt-1 break-all font-mono text-xs">{`${getGatewayBaseUrl().replace(/\/$/, "")}/v1`}</div>
          </div>
          <CopyButton value={created?.key} label="Copy API key" variant="action" />
          <Button variant="outline" render={<Link href={uiHref("api-keys")} />}>
            <L>Manage API keys</L>
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
