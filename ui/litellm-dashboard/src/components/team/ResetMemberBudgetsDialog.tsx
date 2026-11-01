import { LocalizedText as L } from "@/contexts/LocaleContext";

import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatNumberWithCommas } from "@/utils/dataUtils";
import { pluralize } from "./memberBudgetReset";
import type { MemberBudgetResetState } from "./useMemberBudgetReset";

interface ResetMemberBudgetsDialogProps {
  state: MemberBudgetResetState;
  onReset: () => void;
  onRetry: () => void;
  onKeep: () => void;
  onDismiss: () => void;
}

export default function ResetMemberBudgetsDialog({
  state,
  onReset,
  onRetry,
  onKeep,
  onDismiss,
}: ResetMemberBudgetsDialogProps) {
  const open = state.phase !== "idle";
  const busy = state.phase === "resetting";
  const failed = state.phase === "resetFailed";
  const memberCount = state.phase === "idle" ? 0 : state.pending.userIds.length;
  const newBudget = state.phase === "idle" ? 0 : state.pending.newBudget;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !busy) onDismiss();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <L>Reset member budgets?</L>
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {memberCount} {pluralize(memberCount, "member has", "members have")}
          <L> a custom budget, so the new team default of ¥</L>
          {formatNumberWithCommas(newBudget, 2)}
          <L> will not apply to </L>
          {pluralize(memberCount, "that member", "them")}
          <L>. Reset </L>
          {pluralize(memberCount, "it", "them")}
          <L> to the default, or keep the custom</L> {pluralize(memberCount, "budget", "budgets")}?
        </p>
        <DialogFooter>
          {failed ? (
            <>
              <Button variant="outline" onClick={onDismiss}>
                <L>Cancel</L>
              </Button>
              <Button onClick={onRetry}>
                <L>Retry reset</L>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={onDismiss} disabled={busy}>
                <L>Cancel</L>
              </Button>
              <Button variant="outline" onClick={onKeep} disabled={busy}>
                <L>Keep custom </L>
                {pluralize(memberCount, "budget", "budgets")}
              </Button>
              <Button onClick={onReset} disabled={busy}>
                {pluralize(memberCount, "Reset", "Reset all")}
                <L> to ¥</L>
                {formatNumberWithCommas(newBudget, 2)}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
