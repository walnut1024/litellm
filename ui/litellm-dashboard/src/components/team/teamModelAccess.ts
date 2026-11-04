import type { Locale } from "@/i18n/translate";
import { translate } from "@/i18n/translate";

import { unfurlWildcardModelsInList } from "../key_team_helpers/fetch_available_models_team_key";

export const ALL_PROXY_MODELS = "all-proxy-models";
export const NO_DEFAULT_MODELS = "no-default-models";

export interface TeamAccessGroupModelGrant {
  access_group_id: string;
  access_group_name: string;
  models: string[];
  mcp_server_ids?: string[];
  agent_ids?: string[];
  skill_names?: string[];
}

export type TeamModelBadgeKind = "all-proxy" | "no-default" | "direct" | "access-group";

export interface TeamModelBadge {
  label: string;
  kind: TeamModelBadgeKind;
  tooltip: string;
}

const ALL_TEAM_MODELS = "all-team-models";
const MODEL_SENTINELS: ReadonlySet<string> = new Set([ALL_PROXY_MODELS, ALL_TEAM_MODELS, NO_DEFAULT_MODELS]);

// Per-model rate limits and budgets are enforced on the model name a request sends,
// so only concrete names are offered: sentinels and wildcard patterns never match one.
export function teamPerModelLimitOptions(
  teamModels: string[],
  accessGroupModels: string[],
  userModels: string[],
): string[] {
  const coversAllModels =
    teamModels.length === 0 || teamModels.includes(ALL_PROXY_MODELS) || teamModels.includes(ALL_TEAM_MODELS);
  const granted = coversAllModels ? userModels : [...new Set([...teamModels, ...accessGroupModels])];
  return unfurlWildcardModelsInList(granted, userModels).filter(
    (model) => !MODEL_SENTINELS.has(model) && !model.endsWith("*"),
  );
}

export function normalizeTeamModelSelection(models: string[] | undefined): string[] {
  return models && models.length > 0 ? models : [NO_DEFAULT_MODELS];
}

const tr = (message: string, locale: Locale, values?: Readonly<Record<string, string | number>>): string =>
  translate(message, locale, values);

export const describeGroups = (names: string[], locale: Locale = "en"): string =>
  names.length > 1
    ? tr("access groups {names}", locale, { names: names.join(", ") })
    : tr("access group {name}", locale, { name: names[0] });

export function computeTeamModelBadges(
  models: string[],
  accessGroupModels: string[],
  accessGroupDetails: TeamAccessGroupModelGrant[] | undefined,
  locale: Locale = "en",
): TeamModelBadge[] {
  const grants = accessGroupDetails ?? [];
  const groupNamesFor = (model: string): string[] =>
    grants.filter((g) => g.models.includes(model)).map((g) => g.access_group_name);
  const viaGroups = (model: string): string => {
    const names = groupNamesFor(model);
    return names.length > 0 ? describeGroups(names, locale) : tr("an access group", locale);
  };

  const allProxy = models.length === 0 || models.includes(ALL_PROXY_MODELS);
  const directModels = allProxy ? [] : models.filter((m) => m !== NO_DEFAULT_MODELS);
  const groupModels = [...new Set(grants.length > 0 ? grants.flatMap((g) => g.models) : accessGroupModels)].filter(
    (m) => !directModels.includes(m),
  );

  const allProxyBadge: TeamModelBadge = {
    label: tr("All proxy models", locale),
    kind: "all-proxy",
    tooltip: models.includes(ALL_PROXY_MODELS)
      ? tr("Granted by the All Proxy Models entry in the team's model list", locale)
      : tr("The team's model list is empty, so it can access every model on the proxy", locale),
  };
  const noDefaultBadge: TeamModelBadge = {
    label: tr("No default models", locale),
    kind: "no-default",
    tooltip: tr("No models are granted directly. Access comes only from access groups", locale),
  };
  const headBadge = (): TeamModelBadge[] => {
    if (allProxy) return [allProxyBadge];
    if (models.includes(NO_DEFAULT_MODELS)) return [noDefaultBadge];
    return [];
  };

  return [
    ...headBadge(),
    ...directModels.map(
      (m): TeamModelBadge => ({
        label: m,
        kind: "direct",
        tooltip:
          groupNamesFor(m).length > 0
            ? tr("Granted directly in the team's model list, and also via {groups}", locale, {
                groups: viaGroups(m),
              })
            : tr("Granted directly in the team's model list", locale),
      }),
    ),
    ...groupModels.map(
      (m): TeamModelBadge => ({
        label: m,
        kind: "access-group",
        tooltip: tr("Granted via {groups}", locale, { groups: viaGroups(m) }),
      }),
    ),
  ];
}
