import { describe, expect, it } from "vitest";
import { liteColumnAllowed, liteFieldHidden, litePageAllowed, liteRouteAllowed, liteTabAllowed } from "./liteUi";

describe("lightweight UI visibility", () => {
  it.each(["home", "api-keys", "models", "new_usage"])("keeps the core employee page %s", (page) =>
    expect(litePageAllowed(page, "Internal User")).toBe(true),
  );

  it.each(["logs", "users", "settings", "router-settings", "logging-and-alerts", "admin-panel"])(
    "reserves %s for administrators",
    (page) => {
      expect(litePageAllowed(page, "Internal User")).toBe(false);
      expect(litePageAllowed(page, "Admin")).toBe(true);
    },
  );

  it.each([
    "api-reference",
    "playground",
    "agents",
    "mcp-servers",
    "guardrails",
    "teams",
    "organizations",
    "budgets",
    "chat",
    "moyai",
  ])("blocks direct access to %s for both roles", (route) => {
    expect(liteRouteAllowed(route, "Internal User")).toBe(false);
    expect(liteRouteAllowed(route, "Admin")).toBe(false);
  });

  it.each(["Internal User", "Admin"])("hides Playground and API Reference navigation for %s", (role) => {
    expect(litePageAllowed("llm-playground", role)).toBe(false);
    expect(litePageAllowed("api_ref", role)).toBe(false);
  });

  it.each(["login", "onboarding", "change-password", "mcp"])("preserves identity flow %s", (route) => {
    expect(liteRouteAllowed(route, "")).toBe(true);
  });

  it("keeps model administration available only in the administrator view", () => {
    expect(liteTabAllowed("models-and-endpoints", "add", false)).toBe(false);
    expect(liteTabAllowed("models-and-endpoints", "add", true)).toBe(true);
    expect(liteTabAllowed("models-and-endpoints", "auto-routers", true)).toBe(false);
    expect(liteTabAllowed("playground", "chat", false)).toBe(true);
    expect(liteTabAllowed("playground", "compare", true)).toBe(false);
  });

  it("hides advanced fields while preserving provider authentication and basic budgets", () => {
    expect(liteFieldHidden("api-keys", "guardrails")).toBe(true);
    expect(liteFieldHidden("users", "teams.0.team_id")).toBe(true);
    expect(liteFieldHidden("api-keys", "max_budget")).toBe(false);
    expect(liteFieldHidden("models-and-endpoints", "api_key")).toBe(false);
    expect(liteFieldHidden("models-and-endpoints", "project")).toBe(false);
  });

  it("hides management columns without removing administrator ownership information", () => {
    expect(liteColumnAllowed("api-keys", "team_alias", true)).toBe(false);
    expect(liteColumnAllowed("api-keys", "user", true)).toBe(true);
    expect(liteColumnAllowed("api-keys", "user", false)).toBe(false);
    expect(liteColumnAllowed("models-and-endpoints", "litellm_credential_name", false)).toBe(false);
    expect(liteColumnAllowed("models-and-endpoints", "litellm_credential_name", true)).toBe(true);
  });
});
