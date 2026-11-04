import React from "react";
import { Globe2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LocalizedText as L } from "@/contexts/LocaleContext";
import { cn } from "@/lib/cva.config";

interface GuardrailSettingsViewProps {
  globalGuardrailNames: Set<string>;
  teamGuardrails?: string[];
  optedOutGlobalGuardrails?: string[];
  killSwitchOn?: boolean;
  variant?: "card" | "inline";
  className?: string;
}

export function GuardrailSettingsView({
  globalGuardrailNames,
  teamGuardrails = [],
  optedOutGlobalGuardrails = [],
  killSwitchOn = false,
  variant = "card",
  className = "",
}: GuardrailSettingsViewProps) {
  const optedOutSet = new Set(optedOutGlobalGuardrails);
  const globalsRunning = Array.from(globalGuardrailNames).filter((n) => !optedOutSet.has(n));
  const nonGlobalOptIns = teamGuardrails.filter((n) => !globalGuardrailNames.has(n));

  const isEmpty = !killSwitchOn && globalsRunning.length === 0 && nonGlobalOptIns.length === 0;

  const content = isEmpty ? (
    <span className="block text-muted-foreground">
            <L>No guardrails configured</L>
          </span>
  ) : (
    <div className="flex flex-col gap-4">
      <div>
        <span className="mb-2 flex items-center gap-1 text-sm font-medium text-foreground">
          <Globe2 className="size-4" aria-label="Global guardrail" />
          <L>Global</L>
        </span>
        {killSwitchOn ? (
          <Badge variant="outline">
              <L>Bypassed for this team</L>
            </Badge>
        ) : globalsRunning.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {globalsRunning.map((name) => (
              <Badge key={name}>{name}</Badge>
            ))}
          </div>
        ) : (
          <span className="block text-sm text-muted-foreground">
              <L>None configured</L>
            </span>
        )}
      </div>
      <div>
        <span className="mb-2 block text-sm font-medium text-foreground">
            <L>Team-specific</L>
          </span>
        {nonGlobalOptIns.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {nonGlobalOptIns.map((name) => (
              <Badge key={name}>{name}</Badge>
            ))}
          </div>
        ) : (
          <span className="block text-sm text-muted-foreground">
              <L>None configured</L>
            </span>
        )}
      </div>
    </div>
  );

  if (variant === "card") {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>
              <L>Guardrails Settings</L>
            </CardTitle>
          <CardDescription>
              <L>Global and team-specific guardrails applied to this team</L>
            </CardDescription>
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>
    );
  }

  return (
    <div className={cn(className)}>
      <span className="mb-3 block font-medium text-foreground">
          <L>Guardrails Settings</L>
        </span>
      {content}
    </div>
  );
}

export default GuardrailSettingsView;
