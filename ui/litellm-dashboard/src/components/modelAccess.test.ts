import { describe, expect, it } from "vitest";
import { modelAccessKey, modelMatches, type ModelAccessKey } from "./modelAccess";

const now = Date.parse("2026-01-10T00:00:00Z");
const scope = { userId: "employee", teamId: null, checkedAt: now };
const key = (patch: Partial<ModelAccessKey> = {}): ModelAccessKey => ({
  token: "key-hash",
  models: ["demo-chat"],
  user_id: "employee",
  team_id: null,
  blocked: false,
  team_blocked: false,
  expires: "",
  key_type: "llm_api",
  ...patch,
});

describe("modelAccessKey", () => {
  it("finds an active personal key that covers the selected model", () => {
    const existing = key();
    expect(modelAccessKey([existing], "demo-chat", scope)).toBe(existing);
    expect(modelAccessKey([existing], "another-model", scope)).toBeUndefined();
  });
  it.each([[], ["*"], ["all-proxy-models"]])(
    "recognizes unrestricted model lists %j within the same scope",
    (...models) => {
      expect(modelAccessKey([key({ models })], "demo-chat", scope)).toBeDefined();
    },
  );
  it("keeps user and team ownership separate", () => {
    const shared = key({ team_id: "team-a", models: ["all-team-models"] });
    expect(modelAccessKey([shared], "demo-chat", { ...scope, teamId: "team-a" })).toBeDefined();
    expect(modelAccessKey([shared], "demo-chat", scope)).toBeUndefined();
    expect(modelAccessKey([shared], "demo-chat", { ...scope, teamId: "team-b" })).toBeUndefined();
    expect(modelAccessKey([key({ user_id: "someone-else" })], "demo-chat", scope)).toBeUndefined();
  });
  it.each<Partial<ModelAccessKey>>([
    { blocked: true },
    { team_blocked: true },
    { deleted_at: "2026-01-01" },
    { expires: "2026-01-01" },
    { expires: "invalid" },
    { key_type: "management" },
    { key_type: "read_only" },
  ])("rejects a credential that cannot call a model %j", (patch) => {
    expect(modelAccessKey([key(patch)], "demo-chat", scope)).toBeUndefined();
  });
  it("accepts a future expiry without changing its value", () => {
    expect(modelAccessKey([key({ expires: new Date(now + 1000).toISOString() })], "demo-chat", scope)).toBeDefined();
  });
});

describe("modelMatches", () => {
  it("matches provider wildcards without leaking into adjacent providers", () => {
    expect(modelMatches("provider/model", "provider/*")).toBe(true);
    expect(modelMatches("provider-other/model", "provider/*")).toBe(false);
    expect(modelMatches("demo-chat", "demo")).toBe(false);
  });
});
