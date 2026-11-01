import type { KeyResponse } from "@/components/key_team_helpers/key_list";

export type ModelAccessKey = Pick<
  KeyResponse,
  "token" | "models" | "user_id" | "team_id" | "blocked" | "expires" | "deleted_at" | "key_type" | "team_blocked"
>;

export const modelMatches = (model: string, pattern: string): boolean => {
  if (pattern === model || pattern === "*") return true;
  return pattern.endsWith("/*") && model.startsWith(pattern.slice(0, -1));
};

export const modelAccessKey = (
  keys: readonly ModelAccessKey[],
  model: string,
  scope: { userId: string; teamId: string | null; checkedAt: number },
): ModelAccessKey | undefined =>
  keys.find((key) => {
    if (key.user_id !== scope.userId || (key.team_id ?? null) !== scope.teamId) return false;
    if (key.blocked || key.team_blocked) return false;
    if (key.deleted_at) return false;
    if (key.key_type && key.key_type !== "llm_api") return false;
    if (key.expires && !(Date.parse(key.expires) > scope.checkedAt)) return false;
    if (key.models.length === 0 || key.models.includes("all-proxy-models")) return true;
    if (scope.teamId !== null && key.models.includes("all-team-models")) return true;
    return key.models.some((pattern) => modelMatches(model, pattern));
  });
