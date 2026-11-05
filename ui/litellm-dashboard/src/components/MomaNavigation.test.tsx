import { render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { MomaNavigation } from "./MomaNavigation";

const state = vi.hoisted(() => ({ role: "internal_user", enabledPages: null as string[] | null }));
vi.mock("next/navigation", () => ({ usePathname: () => "/ui/api-keys" }));
vi.mock("@/app/(dashboard)/hooks/useAuthorized", () => ({
  default: () => ({ userRole: state.role, userId: "employee", isViewOnly: false }),
}));
vi.mock("@/app/(dashboard)/hooks/useIsOrgAdmin", () => ({ default: () => false }));
vi.mock("@/app/(dashboard)/hooks/teams/useTeams", () => ({ useTeams: () => ({ data: [] }) }));
vi.mock("@/app/(dashboard)/hooks/uiSettings/useUISettings", () => ({
  useUISettings: () => ({ data: { values: { enabled_ui_pages_internal_users: state.enabledPages } } }),
}));

afterEach(() => {
  state.role = "internal_user";
  state.enabledPages = null;
  localStorage.clear();
});

describe("MomaNavigation", () => {
  it("keeps employee routes and selected state without exposing admin management", () => {
    render(
      <LocaleProvider>
        <MomaNavigation />
      </LocaleProvider>,
    );
    expect(screen.getByRole("link", { name: "模型广场" })).toHaveAttribute("href", "/ui/model-hub-table");
    expect(screen.queryByRole("link", { name: "模型管理" })).not.toBeInTheDocument();
    const keys = screen.getByRole("link", { name: "API 密钥" });
    expect(keys).toHaveAttribute("href", "/ui/api-keys");
    expect(keys).toHaveAttribute("aria-current", "page");
    const accessControl = within(screen.getByRole("region", { name: "访问控制" }));
    expect(accessControl.getByRole("link", { name: "团队" })).toBeVisible();
    expect(accessControl.getAllByRole("link")).toHaveLength(1);
    expect(screen.queryByRole("region", { name: "系统设置" })).not.toBeInTheDocument();
  });

  it("separates admin access control and system settings with their existing destinations", () => {
    state.role = "proxy_admin";
    render(
      <LocaleProvider>
        <MomaNavigation />
      </LocaleProvider>,
    );
    expect(screen.getByRole("link", { name: "模型管理" })).toHaveAttribute("href", "/ui/models-and-endpoints");
    expect(screen.getByRole("link", { name: "模型广场" })).toHaveAttribute("href", "/ui/model-hub-table");
    const accessControl = within(screen.getByRole("region", { name: "访问控制" }));
    expect(accessControl.getAllByRole("link")).toHaveLength(4);
    expect(accessControl.getByRole("link", { name: "团队" })).toHaveAttribute("href", "/ui/teams");
    expect(accessControl.getByRole("link", { name: "用户管理" })).toHaveAttribute("href", "/ui/users");
    expect(accessControl.getByRole("link", { name: "访问组" })).toHaveAttribute("href", "/ui/access-groups");
    expect(accessControl.getByRole("link", { name: "预算" })).toHaveAttribute("href", "/ui/budgets");
    const systemSettings = within(screen.getByRole("region", { name: "系统设置" }));
    expect(systemSettings.getAllByRole("link")).toHaveLength(4);
    expect(systemSettings.getByRole("link", { name: "界面主题" })).toHaveAttribute("href", "/ui/ui-theme");
    expect(systemSettings.getByRole("link", { name: "路由设置" })).toHaveAttribute("href", "/ui/router-settings");
    expect(systemSettings.getByRole("link", { name: "日志与告警" })).toHaveAttribute("href", "/ui/logging-and-alerts");
    expect(systemSettings.getByRole("link", { name: "系统设置" })).toHaveAttribute("href", "/ui/admin-panel");
    expect(screen.queryByRole("region", { name: "管理", exact: true })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Projects|Organizations|Playground/ })).not.toBeInTheDocument();
  });

  it("honors the configured employee page visibility", () => {
    state.enabledPages = ["api-keys", "teams"];
    render(
      <LocaleProvider>
        <MomaNavigation />
      </LocaleProvider>,
    );
    expect(screen.queryByRole("link", { name: "模型广场" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "API 密钥" })).toBeVisible();
  });
});
