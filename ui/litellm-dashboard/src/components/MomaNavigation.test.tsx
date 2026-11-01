import { render, screen } from "@testing-library/react";
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
    const keys = screen.getByRole("link", { name: "API 密钥" });
    expect(keys).toHaveAttribute("href", "/ui/api-keys");
    expect(keys).toHaveAttribute("aria-current", "page");
    expect(screen.queryByRole("button", { name: "管理" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "团队" })).toBeVisible();
  });

  it("keeps the existing admin destinations in the management section", async () => {
    state.role = "proxy_admin";
    render(
      <LocaleProvider>
        <MomaNavigation />
      </LocaleProvider>,
    );
    expect(await screen.findByRole("link", { name: "用户管理" })).toHaveAttribute("href", "/ui/users");
    expect(screen.getByRole("link", { name: "访问组" })).toHaveAttribute("href", "/ui/access-groups");
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
