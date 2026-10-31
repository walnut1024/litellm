"use client";

import { LocalizedText as L } from "@/contexts/LocaleContext";

import { deriveKeyModelScope } from "@/components/key_scope";
import { getModelDisplayName } from "@/components/key_team_helpers/fetch_available_models_team_key";
import { Badge } from "@/components/ui/badge";

import { CellTooltip } from "./cell_tooltip";

interface ModelsCellProps {
  models: string[] | null | undefined;
  maxVisible?: number;
  allowedRoutes?: string[] | null;
  keyType?: string | null;
}

const WILDCARD_MODEL = "all-proxy-models";

const formatModel = (model: string): string => {
  if (model === WILDCARD_MODEL) {
    return "All Proxy Models";
  }
  const name = getModelDisplayName(model);
  return name.length > 30 ? `${name.slice(0, 30)}...` : name;
};

export function ModelsCell({ models, maxVisible = 3, allowedRoutes, keyType }: ModelsCellProps) {
  if (!Array.isArray(models) || models.length === 0) {
    const scope = deriveKeyModelScope(allowedRoutes, keyType);
    if (!scope.hasModelAccess) {
      return (
        <CellTooltip
          content={`Scoped to ${scope.label} routes; this key cannot call any models`}
          trigger={
            <Badge variant="secondary" className="cursor-default">
              <L>No model access</L>
            </Badge>
          }
        />
      );
    }
    return (
      <Badge variant="secondary">
        <L>All Proxy Models</L>
      </Badge>
    );
  }

  const visible = models.slice(0, maxVisible);
  const overflow = models.slice(maxVisible);

  return (
    <div className="flex flex-wrap items-center gap-1">
      {visible.map((model, index) => (
        <Badge key={index} variant={model === WILDCARD_MODEL ? "secondary" : "outline"}>
          {model === WILDCARD_MODEL ? <L>All Proxy Models</L> : formatModel(model)}
        </Badge>
      ))}
      {overflow.length > 0 && (
        <CellTooltip
          content={
            <div className="flex max-w-[280px] flex-col gap-0.5">
              {overflow.map((model, index) => (
                <span key={index}>{model === WILDCARD_MODEL ? <L>All Proxy Models</L> : formatModel(model)}</span>
              ))}
            </div>
          }
          trigger={
            <Badge variant="outline" className="cursor-default">
              +{overflow.length} <L>more</L>
            </Badge>
          }
        />
      )}
    </div>
  );
}
