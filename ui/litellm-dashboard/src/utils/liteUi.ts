import { isAdminRole } from "./roles";

const employeePages = ["home", "api-keys", "models", "new_usage"];
const accessControlPages = ["teams", "users", "access-groups", "budgets"];
const adminPages = ["logs", "settings", "router-settings", "logging-and-alerts", "admin-panel"];

const routePages: Readonly<Record<string, string>> = {
  "": "home",
  home: "home",
  "api-keys": "api-keys",
  "models-and-endpoints": "models",
  usage: "new_usage",
  logs: "logs",
  users: "users",
  teams: "teams",
  organizations: "organizations",
  "access-groups": "access-groups",
  budgets: "budgets",
  "router-settings": "router-settings",
  "logging-and-alerts": "logging-and-alerts",
  "admin-panel": "admin-panel",
};

export const litePageAllowed = (page: string, userRole: string): boolean =>
  accessControlPages.includes(page) ||
  employeePages.includes(page) ||
  (isAdminRole(userRole) && adminPages.includes(page));

export const liteRouteAllowed = (route: string, userRole: string): boolean =>
  ["login", "onboarding", "change-password", "mcp"].includes(route) ||
  (routePages[route] !== undefined && litePageAllowed(routePages[route], userRole));

const hiddenTabs: Readonly<Record<string, readonly string[]>> = {
  "models-and-endpoints": ["auto-routers", "pass-through", "model-group-alias", "access-group-budgets", "price-data"],
  "api-keys": ["savings", "auto-router-usage"],
  usage: ["mcp", "endpoints"],
  logs: ["audit logs", "deleted keys", "deleted teams"],
  teams: ["default-settings"],
  "access-groups": ["mcp-servers", "mcp", "agents", "skills"],
  "logging-and-alerts": ["logging-callbacks", "cloudzero-cost-tracking", "ms-teams-alerts"],
  "admin-panel": [
    "sso-settings",
    "security-settings",
    "scim",
    "hashicorp-vault",
    "cyberark",
    "plugins",
    "web-search-interception",
  ],
};

export const liteTabAllowed = (route: string, tab: string, admin: boolean): boolean => {
  if (hiddenTabs[route]?.includes(tab)) return false;
  if (route === "models-and-endpoints" && !admin) {
    return !["add", "llm-credentials", "health", "retry-settings", "raw"].includes(tab);
  }
  return true;
};

const enterpriseFields = [
  "organization_id",
  "organization_ids",
  "secret_manager_settings",
  "model_max_budget",
  "team_member_model_max_budget",
  "allowed_passthrough_routes",
  "logging_settings",
  "disable_global_guardrails",
];

export const liteResourceFields: readonly string[] = [
  "allowed_mcp_servers_and_groups",
  "mcp_servers_and_groups",
  "mcp_tool_permissions",
  "allowed_agents_and_groups",
  "agents_and_groups",
  "allowed_skills",
  "skills",
  "object_permission_search_tools",
  "object_permission_skills",
  "vector_stores",
  "allowed_vector_store_ids",
];

const hiddenFields = [
  "project_id",
  "metadata",
  "tags",
  "guardrails",
  "disable_global_guardrails",
  "policies",
  "prompts",
  "vector_store_ids",
  "allowed_passthrough_routes",
  "allowed_routes",
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

const commonHiddenFields = [...enterpriseFields, ...liteResourceFields];

export const liteFieldHidden = (route: string, name: string): boolean =>
  commonHiddenFields.includes(name) ||
  (["api-keys", "models-and-endpoints"].includes(route) && hiddenFields.includes(name));

export const liteColumnAllowed = (route: string, column: string, admin: boolean): boolean => {
  if (["organization_id", "organization_alias"].includes(column)) return false;
  if (["api-keys", "models-and-endpoints", "logs"].includes(route)) {
    if (["project_id", "request_tags", "tags", "end_user"].includes(column)) return false;
  }
  if (!admin && route === "api-keys" && ["user_id", "user", "user_email"].includes(column)) return false;
  if (!admin && route === "models-and-endpoints") {
    return !["litellm_credential_name", "input_cost", "actions"].includes(column);
  }
  return true;
};
