import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { LiteUiContext } from "@/contexts/LiteUiContext";
import { DashboardHeader } from "./DashboardHeader";
const state = vi.hoisted(() => ({ desktop: false, logout: vi.fn() }));
vi.mock("usehooks-ts", () => ({ useMediaQuery: () => state.desktop }));
vi.mock("@/contexts/ThemeContext", () => ({ useTheme: () => ({ logoUrl: null, logoUrlDark: null }) }));
vi.mock("@/app/(dashboard)/hooks/useLogout", () => ({ useLogout: () => state.logout }));
vi.mock("@/hooks/useWorker", () => ({ useWorker: () => ({ isControlPlane: false, selectedWorker: null }) }));
vi.mock("@/app/(dashboard)/hooks/useDisableShowPrompts", () => ({ useDisableShowPrompts: () => false }));
vi.mock("@/components/LanguageSwitcher", () => ({ LanguageSwitcher: () => <button>Language</button> }));
vi.mock("@/components/SidebarAccountMenu/SidebarAccountMenu", () => ({
  default: ({ onLogout }: { onLogout: () => void }) => <button onClick={onLogout}>Logout</button>,
}));
vi.mock("@/components/ThemeToggle/ThemeToggle", () => ({ default: () => <button>Theme</button> }));
vi.mock("@/components/CommandPalette/CommandPaletteTrigger", () => ({
  CommandPaletteTrigger: () => <button>Search</button>,
}));
vi.mock("@/components/Navbar/BlogDropdown/BlogDropdown", () => ({ BlogDropdown: () => null }));
vi.mock("@/components/Navbar/DocsLink/DocsLink", () => ({
  DocsLink: () => <a href="https://docs.litellm.ai">Docs</a>,
}));
vi.mock("@/components/Navbar/CommunityEngagementButtons/CommunityEngagementButtons", () => ({
  CommunityEngagementButtons: () => null,
}));
vi.mock("@/components/Navbar/NotificationsBell/NotificationsBell", () => ({
  NotificationsBell: () => <button>Notifications</button>,
}));
vi.mock("@/components/Navbar/WorkerDropdown/WorkerDropdown", () => ({ default: () => null }));
vi.mock("@/components/Navbar/ViewSwitcher", () => ({ default: () => <button>Switch workspace</button> }));
vi.mock("@/components/liteadmin/LiteAdmin", () => ({ default: () => <button>Aria Agent</button> }));
const header = () => (
  <LiteUiContext.Provider value={{ route: "home", admin: false }}>
    <DashboardHeader
      accessToken="test-session"
      navigationTrigger={<button>Navigation</button>}
      deploymentHealth={<button>Health</button>}
    />
  </LiteUiContext.Provider>
);
afterEach(() => {
  state.desktop = false;
  vi.clearAllMocks();
});
describe("MoMA header", () => {
  it("links the text brand to Home and keeps navigation and account actions available", () => {
    render(header());
    expect(screen.getByRole("link", { name: "MoMA 轻量版" })).toHaveAttribute("href", "/ui/home");
    expect(screen.getByRole("button", { name: "Navigation" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Logout" }));
    expect(state.logout).toHaveBeenCalledOnce();
  });
  it("keeps masked promotion and workspace controls out of the compact tools", async () => {
    render(header());
    fireEvent.click(screen.getByRole("button", { name: "More options" }));
    const tools = await screen.findByRole("dialog", { name: "Gateway tools" });
    expect(within(tools).getByRole("button", { name: "Theme" })).toBeVisible();
    expect(within(tools).queryByRole("button", { name: "Switch workspace" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Docs" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Aria Agent" })).not.toBeInTheDocument();
  });
  it("closes compact tools when the viewport becomes desktop", async () => {
    const { rerender } = render(header());
    fireEvent.click(screen.getByRole("button", { name: "More options" }));
    await screen.findByRole("dialog", { name: "Gateway tools" });
    state.desktop = true;
    rerender(header());
    expect(screen.queryByRole("dialog", { name: "Gateway tools" })).not.toBeInTheDocument();
    state.desktop = false;
    rerender(header());
    expect(screen.queryByRole("dialog", { name: "Gateway tools" })).not.toBeInTheDocument();
  });
});
