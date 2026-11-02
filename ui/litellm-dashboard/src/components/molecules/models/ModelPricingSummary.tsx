import { ModelData, ModelInfo } from "@/components/model_dashboard/types";
import { Badge } from "@/components/ui/badge";
import { formatPerSecondCost } from "@/utils/dataUtils";
import { LocalizedText as L, useTranslation } from "@/contexts/LocaleContext";

type PricingFields = Pick<
  ModelData,
  "input_cost" | "output_cost" | "output_cost_per_second" | "output_cost_per_second_tiers"
> & { model_info?: Pick<ModelInfo, "pricing_overrides"> };

function PricingSource({ overrides }: { overrides: string[] | undefined }) {
  if (overrides === undefined) return null;
  if (overrides.length === 0) {
    return (
      <p className="mt-2 text-xs text-muted-foreground">
        <L>Follows the model cost map</L>
      </p>
    );
  }
  return (
    <p className="mt-2 text-xs text-muted-foreground">
      <Badge variant="outline" className="mr-1">
        <L>Custom pricing</L>
      </Badge>
      <L>Overrides the model cost map for</L> {overrides.join(", ")}
    </p>
  );
}

export function ModelPricingSummary({ model }: { model: PricingFields }) {
  const t = useTranslation();
  const perSecond = model.output_cost_per_second;
  const hasPerSecond = perSecond != null;
  const showInput = model.input_cost != null && (!hasPerSecond || Number(model.input_cost) > 0);
  const showOutput = model.output_cost != null && (!hasPerSecond || Number(model.output_cost) > 0);

  if (!showInput && !showOutput && !hasPerSecond) {
    return <p className="mt-2 text-sm text-muted-foreground">-</p>;
  }

  return (
    <div className="mt-2">
      {showInput && <p className="text-sm">{t("Input: ¥{cost}/1M tokens", { cost: model.input_cost ?? "" })}</p>}
      {showOutput && <p className="text-sm">{t("Output: ¥{cost}/1M tokens", { cost: model.output_cost ?? "" })}</p>}
      {hasPerSecond && (
        <p className="text-sm">
          <L>Output:</L> {formatPerSecondCost(perSecond)}
        </p>
      )}
      {(model.output_cost_per_second_tiers ?? []).map(({ resolution, cost }) => (
        <p key={resolution} className="text-sm">
          <L>Output</L> ({resolution}): {formatPerSecondCost(cost)}
        </p>
      ))}
      <PricingSource overrides={model.model_info?.pricing_overrides} />
    </div>
  );
}
