import { LocalizedText as L, useTranslation } from "@/contexts/LocaleContext";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { groupKey, groupLabel, pctLabel, type AutoRouterBenchmarkGroup } from "./autoRouterBenchmarks";
import { usd } from "./costOptimizationUtils";

interface AutoRouterSummaryTableProps {
  groups: readonly AutoRouterBenchmarkGroup[];
  selectedGroup: AutoRouterBenchmarkGroup | null;
}

export default function AutoRouterSummaryTable({ groups, selectedGroup }: AutoRouterSummaryTableProps) {
  const t = useTranslation();
  const visibleGroups = selectedGroup ? [selectedGroup] : groups;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <L>Router usage and savings</L>
        </CardTitle>
        <CardDescription>
          <L>
            Selected UTC days. Cost includes LLM calls and classification. Tokens count routed LLM input and output.
          </L>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table aria-label={t("Router usage and savings")}>
          <TableHeader>
            <TableRow>
              <TableHead>
                <L>Auto-router</L>
              </TableHead>
              <TableHead className="text-right whitespace-normal">
                <L>Tokens through router</L>
              </TableHead>
              <TableHead className="text-right whitespace-normal">
                <L>Cost via router</L>
              </TableHead>
              <TableHead className="text-right whitespace-normal">
                <L>Cost per 1M tokens</L>
              </TableHead>
              <TableHead className="text-right whitespace-normal">
                <L>Saved vs. premium model</L>
              </TableHead>
              <TableHead className="text-right">
                <L>% saved</L>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleGroups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  <L>No auto-routers in this range</L>
                </TableCell>
              </TableRow>
            ) : (
              visibleGroups.map((group) => (
                <TableRow key={groupKey(group)}>
                  <TableCell className="font-medium">{groupLabel(group, groups)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {group.total_tokens == null ? t("Unavailable") : group.total_tokens.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{usd(group.spend)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {group.total_tokens != null && group.total_tokens > 0
                      ? usd((group.spend * 1_000_000) / group.total_tokens)
                      : t("Unavailable")}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {group.saved_spend == null ? t("Unavailable") : usd(group.saved_spend)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {group.saved_pct == null ? t("Unavailable") : pctLabel(group.saved_pct)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <p className="mt-3 text-xs text-muted-foreground">
          <L>
            Savings are estimated against each router&apos;s premium baseline. Token totals and unit costs are
            unavailable for usage recorded before token tracking; unit cost also requires nonzero tokens.
          </L>
        </p>
      </CardContent>
    </Card>
  );
}
