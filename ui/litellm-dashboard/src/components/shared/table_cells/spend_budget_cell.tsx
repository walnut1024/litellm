"use client";

import { useTranslation } from "@/contexts/LocaleContext";

import { InheritedBudgetHint, type InheritedBudgetGate } from "@/components/shared/InheritedBudgetHint";
import { Meter, MeterIndicator, MeterTrack } from "@/components/shared/Meter";
import { formatNumberWithCommas, getSpendString } from "@/utils/dataUtils";

interface SpendBudgetCellProps {
  spend: number | null | undefined;
  maxBudget: number | null | undefined;
  teamMemberGate?: InheritedBudgetGate | null;
  inheritedGates?: readonly InheritedBudgetGate[];
  spendDecimals?: number;
  budgetDecimals?: number;
}

export const getSpendBudgetMeterTone = (pct: number): "default" | "warning" | "over" => {
  if (pct > 100) return "over";
  if (pct >= 80) return "warning";
  return "default";
};

const getBudgetLabel = (
  formattedBudget: string | null,
  usesTeamMemberBudget: boolean,
  memberSpendText: string,
  t: ReturnType<typeof useTranslation>,
): string => {
  if (formattedBudget === null) return t("· Unlimited");
  if (usesTeamMemberBudget) {
    return t("· {spend} of ¥{budget} (team member)", { spend: memberSpendText, budget: formattedBudget });
  }
  return t("of ¥{budget}", { budget: formattedBudget });
};

const getMeterValueText = (
  hasBudget: boolean,
  formattedBudget: string | null,
  meterSpendText: string,
  t: ReturnType<typeof useTranslation>,
): string => {
  if (!hasBudget || formattedBudget === null) return "";
  return t("{spend} of ¥{budget}", { spend: meterSpendText, budget: formattedBudget });
};

export function SpendBudgetCell({
  spend,
  maxBudget,
  teamMemberGate = null,
  inheritedGates = [],
  spendDecimals = 4,
  budgetDecimals = 0,
}: SpendBudgetCellProps) {
  const t = useTranslation();
  const spendValue = typeof spend === "number" && !Number.isNaN(spend) ? spend : 0;
  const ownBudget = maxBudget ?? null;
  const budget = ownBudget ?? teamMemberGate?.maxBudget ?? null;
  const usesTeamMemberBudget = ownBudget === null && teamMemberGate !== null;
  const memberSpendValue =
    typeof teamMemberGate?.spend === "number" && !Number.isNaN(teamMemberGate.spend) ? teamMemberGate.spend : 0;
  const meterSpendValue = usesTeamMemberBudget ? memberSpendValue : spendValue;
  const hasBudget = typeof budget === "number" && budget > 0;
  const pct = hasBudget ? (meterSpendValue / budget) * 100 : 0;

  const spendText = spendValue > 0 ? getSpendString(spendValue, spendDecimals) : "¥0.00";
  const memberSpendText = memberSpendValue > 0 ? getSpendString(memberSpendValue, spendDecimals) : "¥0.00";
  const formattedBudget = budget === null ? null : formatNumberWithCommas(budget, budgetDecimals);
  const budgetLabel = getBudgetLabel(formattedBudget, usesTeamMemberBudget, memberSpendText, t);
  const meterSpendText = usesTeamMemberBudget ? t("team member spend {spend}", { spend: memberSpendText }) : spendText;
  const meterValueText = getMeterValueText(hasBudget, formattedBudget, meterSpendText, t);

  return (
    <div className="flex min-w-[130px] flex-col gap-1">
      <div className="whitespace-nowrap text-xs">
        <span className="font-medium tabular-nums text-foreground">{spendText}</span>{" "}
        <span className="text-muted-foreground">{budgetLabel}</span>
        {ownBudget === null && <InheritedBudgetHint gates={inheritedGates} />}
      </div>
      {hasBudget && (
        <Meter value={meterSpendValue} max={budget} aria-valuetext={meterValueText}>
          <MeterTrack>
            <MeterIndicator tone={getSpendBudgetMeterTone(pct)} />
          </MeterTrack>
        </Meter>
      )}
    </div>
  );
}
