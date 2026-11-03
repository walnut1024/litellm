import { describe, expect, it } from "vitest";
import { systemResourceLabel } from "./systemResourceLabel";

describe("systemResourceLabel", () => {
  it.each([
    ["litellm-internal-health-check", "系统健康检查", "System health check"],
    ["key-hash-litellm-internal-health-check", "系统健康检查", "System health check"],
    ["litellm_proxy_master_key", "平台主密钥", "Gateway master key"],
    ["key-hash-litellm_proxy_master_key", "平台主密钥", "Gateway master key"],
    ["litellm-dashboard", "控制台团队", "Console team"],
  ])("labels the reserved resource %s in both languages", (id, chinese, english) => {
    expect(systemResourceLabel(id, "zh-CN")).toBe(chinese);
    expect(systemResourceLabel(id, "en")).toBe(english);
  });

  it.each(["Home", "custom-litellm-dashboard", "model-with-litellm-in-name", "user@example.test"])(
    "preserves user-owned text %s",
    (value) => {
      expect(systemResourceLabel(value, "zh-CN")).toBe(value);
    },
  );
});
