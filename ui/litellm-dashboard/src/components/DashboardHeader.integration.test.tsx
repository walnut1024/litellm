import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider as ColorThemeProvider } from "next-themes";
import { renderWithProviders, testQueryClient } from "../../tests/test-utils";
import { AuthProvider } from "@/contexts/AuthContext";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { LiteUiContext } from "@/contexts/LiteUiContext";
import { PluginModeProvider } from "@/contexts/PluginModeContext";
import { CommandPaletteProvider } from "@/components/CommandPalette/CommandPaletteProvider";
import { MomaNavigation } from "./MomaNavigation";
import { DashboardHeader } from "./DashboardHeader";

vi.unmock("@/app/(dashboard)/hooks/useAuthorized");
vi.mock("next/navigation", () => ({
  usePathname: () => "/ui/home",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));
beforeEach(() => {
  testQueryClient.clear();
  localStorage.clear();
  localStorage.setItem("moma.locale", "zh-CN");
  const claims = {
    key: "sk-header-test",
    user_id: "header-user",
    user_role: "internal_user",
    login_method: "sso",
    exp: Date.now() / 1000 + 3600,
  };
  document.cookie = `token=${btoa(JSON.stringify({ alg: "none" }))}.${btoa(JSON.stringify(claims))}.test; Path=/`;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const path = new URL(input instanceof Request ? input.url : String(input), "http://localhost").pathname;
      if (path.endsWith("litellm-ui-config"))
        return Response.json({ server_root_path: "", proxy_base_url: "", admin_ui_disabled: false });
      if (path === "/management/v1/users/me")
        return Response.json({
          user_id: "header-user",
          user_role: "internal_user",
          user_email: "employee@example.test",
        });
      if (["/team/list", "/organization/list", "/api/plugins"].includes(path)) return Response.json([]);
      if (path === "/health/deployment_warnings") return Response.json({ warnings: [], ignore_available: false });
      if (path === "/public/litellm_blog_posts") return Response.json({ posts: [] });
      return Response.json({ values: {} });
    }),
  );
});
afterEach(() => {
  testQueryClient.clear();
  vi.unstubAllGlobals();
  localStorage.clear();
  document.cookie = "token=; Max-Age=0; Path=/";
});
const renderHeader = () =>
  renderWithProviders(
    <ColorThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <LocaleProvider>
        <AuthProvider>
          <PluginModeProvider accessToken="sk-header-test">
            <LiteUiContext.Provider value={{ route: "home", admin: false }}>
              <CommandPaletteProvider>
                <DashboardHeader accessToken="sk-header-test" />
                <MomaNavigation />
              </CommandPaletteProvider>
            </LiteUiContext.Provider>
          </PluginModeProvider>
        </AuthProvider>
      </LocaleProvider>
    </ColorThemeProvider>,
  );

describe("header and navigation integration", () => {
  it("applies the header language choice to the real navigation without changing its destinations", async () => {
    renderHeader();
    expect(await screen.findByRole("link", { name: "模型广场" })).toHaveAttribute("href", "/ui/models-and-endpoints");
    fireEvent.click(screen.getByRole("button", { name: "语言" }));
    expect(await screen.findByRole("link", { name: "Model marketplace" })).toHaveAttribute(
      "href",
      "/ui/models-and-endpoints",
    );
    expect(screen.getByRole("link", { name: "Virtual Keys" })).toHaveAttribute("href", "/ui/api-keys");
    expect(screen.queryByRole("link", { name: "Internal Users" })).not.toBeInTheDocument();
  });
  it("keeps the theme control usable in compact tools while masked products remain hidden", async () => {
    renderHeader();
    fireEvent.click(screen.getByRole("button", { name: "更多选项" }));
    const tools = await screen.findByRole("dialog", { name: "网关工具" });
    fireEvent.click(within(tools).getByRole("button", { name: "切换深色主题" }));
    await waitFor(() => expect(document.documentElement).toHaveClass("dark"));
    expect(within(tools).queryByRole("link", { name: "文档" })).not.toBeInTheDocument();
    expect(within(tools).queryByRole("button", { name: /Switch workspace/ })).not.toBeInTheDocument();
  });
});
