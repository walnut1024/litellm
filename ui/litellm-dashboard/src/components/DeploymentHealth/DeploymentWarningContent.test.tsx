import { describe, expect, it } from "vitest";
import { deploymentWarningContent } from "./DeploymentWarningContent";

const NOW = new Date("2026-10-14T12:00:00Z");

describe("deploymentWarningContent", () => {
  it.each([
    { expiry: "2026-10-14", title: "Your enterprise license expires today (Oct 14, 2026)" },
    { expiry: "2026-10-15", title: "Your enterprise license expires in 1 day (Oct 15, 2026)" },
    { expiry: "2026-11-13", title: "Your enterprise license expires in 30 days (Nov 13, 2026)" },
    { expiry: "2026-10-13", title: "Your enterprise license expired on Oct 13, 2026" },
  ])("titles a license expiring on $expiry by its distance from today", ({ expiry, title }) => {
    expect(deploymentWarningContent(`license_expiry:${expiry}`, NOW).title).toBe(title);
  });

  it("keeps actionable security guidance in Chinese", () => {
    const content = deploymentWarningContent("env_credential_login", NOW, "zh-CN");
    expect(content.title).toBe("已启用环境变量账号登录");
    expect(content.fix).toContain("独立密码的管理员账户");
    expect(content.fix).toContain("general_settings.disable_env_credential_login");
  });

  it("localizes a license expiry without upstream sales links", () => {
    const content = deploymentWarningContent("license_expiry:2026-10-13", NOW, "zh-CN");
    expect(content.title).toBe("企业许可证已于 2026年10月13日 到期");
    expect(content.fix).toBe("企业功能已停用，请联系管理员恢复访问");
  });

  it("keeps debug and multi-worker risks actionable", () => {
    expect(deploymentWarningContent("detailed_debug", NOW, "zh-CN").fix).toContain("生产环境应关闭");
    expect(deploymentWarningContent("no_redis", NOW, "zh-CN").fix).toContain("花费可能超出预算");
  });

  it("preserves an unknown warning identifier", () => {
    expect(deploymentWarningContent("future_warning", NOW)).toEqual({ title: "future_warning" });
  });
});
