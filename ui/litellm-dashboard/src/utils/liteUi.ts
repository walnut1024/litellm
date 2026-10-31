import { isAdminRole } from "./roles";

const employeePages = ["home", "api-keys", "models", "new_usage", "api_ref"];
const adminPages = ["logs", "users", "settings", "router-settings", "logging-and-alerts", "admin-panel"];

const routePages: Readonly<Record<string, string>> = {
  "": "home",
  home: "home",
  "api-keys": "api-keys",
  "models-and-endpoints": "models",
  usage: "new_usage",
  "api-reference": "api_ref",
  logs: "logs",
  users: "users",
  "router-settings": "router-settings",
  "logging-and-alerts": "logging-and-alerts",
  "admin-panel": "admin-panel",
};

export const litePageAllowed = (page: string, userRole: string): boolean =>
  employeePages.includes(page) || (isAdminRole(userRole) && adminPages.includes(page));

export const liteRouteAllowed = (route: string, userRole: string): boolean =>
  ["login", "onboarding", "change-password", "mcp"].includes(route) ||
  (routePages[route] !== undefined && litePageAllowed(routePages[route], userRole));

const hiddenTabs: Readonly<Record<string, readonly string[]>> = {
  playground: ["compare", "compliance", "system-one", "agent-builder"],
  "models-and-endpoints": ["auto-routers", "pass-through", "model-group-alias", "access-group-budgets", "price-data"],
  "api-keys": ["savings", "auto-router-usage"],
  users: ["savings", "auto-router-usage"],
  usage: ["mcp", "endpoints"],
  logs: ["deleted keys", "deleted teams"],
  "logging-and-alerts": ["logging-callbacks", "cloudzero-cost-tracking"],
  "admin-panel": ["scim", "hashicorp-vault", "cyberark", "plugins", "web-search-interception"],
};

export const liteTabAllowed = (route: string, tab: string, admin: boolean): boolean => {
  if (hiddenTabs[route]?.includes(tab)) return false;
  if (route === "models-and-endpoints" && !admin) {
    return !["add", "llm-credentials", "health", "retry-settings", "raw"].includes(tab);
  }
  return true;
};

const hiddenFields = [
  "organization_id",
  "organization_ids",
  "team_id",
  "project_id",
  "access_group_ids",
  "model_access_group",
  "metadata",
  "tags",
  "guardrails",
  "disable_global_guardrails",
  "policies",
  "prompts",
  "vector_stores",
  "vector_store_ids",
  "allowed_vector_store_ids",
  "allowed_passthrough_routes",
  "allowed_routes",
  "allowed_mcp_servers_and_groups",
  "mcp_servers_and_groups",
  "mcp_tool_permissions",
  "allowed_agents_and_groups",
  "allowed_skills",
  "logging_settings",
  "soft_budget",
  "budget_windows",
  "model_max_budget",
  "budget_fallbacks",
  "end_user_budget_id",
  "tpd_limit",
  "tpm_limit_type",
  "rpm_limit_type",
  "model_tpm_limit",
  "model_rpm_limit",
  "enable_prompt_caching",
  "throttle_on_budget_exceeded",
  "default_estimated_output_tokens",
  "default_estimated_output_tokens_per_model",
  "use_in_pass_through",
  "kubernetes_pod_discovery",
  "cache_control",
  "cache_control_injection_points",
  "litellm_extra_params",
  "model_info_params",
  "ptu_count",
  "cost_per_ptu_per_hour",
  "ptu_effective_from",
  "ptu_effective_to",
];

export const liteFieldHidden = (route: string, name: string): boolean =>
  ["api-keys", "models-and-endpoints", "users"].includes(route) &&
  (hiddenFields.includes(name) || name.startsWith("teams."));

export const liteColumnAllowed = (route: string, column: string, admin: boolean): boolean => {
  if (["api-keys", "models-and-endpoints", "logs"].includes(route)) {
    if (
      [
        "team_id",
        "team",
        "team_alias",
        "team_name",
        "organization_id",
        "organization_alias",
        "org_id",
        "project_id",
        "request_tags",
        "tags",
        "end_user",
        "model_info_team_id",
        "model_info_access_groups",
      ].includes(column)
    )
      return false;
  }
  if (!admin && route === "api-keys" && ["user_id", "user", "user_email"].includes(column)) return false;
  if (!admin && route === "models-and-endpoints") {
    return !["litellm_credential_name", "input_cost", "actions"].includes(column);
  }
  return true;
};
