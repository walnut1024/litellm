import { fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../tests/test-utils";
import { TerminologyProvider } from "@/contexts/TerminologyContext";
import Sidebar, { getBreadcrumb } from "./leftnav";

vi.mock("../utils/roles", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../utils/roles")>();
  return {
    ...actual,
    all_admin_roles: ["admin", "admin_viewer"],
    old_admin_roles: ["admin", "admin_viewer"],
    internalUserRoles: ["internal"],
    rolesWithWriteAccess: ["admin", "internal"],
    rolesAllowedToViewWriteScopedPages: ["admin", "internal", "admin_viewer"],
    isAdminRole: (role: string) => role === "admin" || role === "admin_viewer",
    isUserTeamAdminForAnyTeam: actual.isUserTeamAdminForAnyTeam,
  };
});

const navState = vi.hoisted(() => ({ pathname: "/ui/api-keys" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navState.pathname,
  useRouter: () => ({ push: vi.fn() }),
}));

const { mockUseAuthorized, mockUseOrganizations, mockUseTeams } = vi.hoisted(() => {
  const mockUseAuthorized = vi.fn(() => ({
    userId: "test-user-id",
    accessToken: "test-access-token",
    userRole: "admin",
    isViewOnly: false,
    token: "test-token",
    userEmail: "test@example.com",
    premiumUser: false,
    disabledPersonalKeyCreation: false,
    showSSOBanner: false,
  }));

  const mockUseOrganizations = vi.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
  }));

  const mockUseTeams = vi.fn(() => ({
    data: [] as Array<{ members_with_roles: Array<{ user_id: string; role: string }> }>,
    isLoading: false,
    error: null,
  }));

  return { mockUseAuthorized, mockUseOrganizations, mockUseTeams };
});

vi.mock("@/app/(dashboard)/hooks/useAuthorized", () => ({
  default: mockUseAuthorized,
}));

vi.mock("@/app/(dashboard)/hooks/organizations/useOrganizations", () => ({
  useOrganizations: mockUseOrganizations,
}));

vi.mock("@/app/(dashboard)/hooks/teams/useTeams", () => ({
  useTeams: mockUseTeams,
}));

const uiConfig = vi.hoisted(() => ({ data: { admin_ui_disabled: false, use_si_terminology: false } }));

vi.mock("@/app/(dashboard)/hooks/uiConfig/useUIConfig", () => {
  return {
    useUIConfig: () => ({
      data: uiConfig.data,
      isLoading: false,
    }),
  };
});

// The redesigned sidebar reads the custom logo from ThemeContext; the test tree
// has no ThemeProvider, so stub the hook.
const unbrandedTheme = () => ({
  logoUrl: null as string | null,
  logoUrlDark: null as string | null,
  faviconUrl: null as string | null,
  setLogoUrl: vi.fn(),
  setLogoUrlDark: vi.fn(),
  setFaviconUrl: vi.fn(),
});
let mockUseThemeImpl = unbrandedTheme;
vi.mock("@/contexts/ThemeContext", () => ({
  useTheme: () => mockUseThemeImpl(),
}));

// Version tag + logout target come from network hooks; keep them inert in unit tests.
vi.mock("@/app/(dashboard)/hooks/healthReadiness/useHealthReadinessDetails", () => ({
  useHealthReadinessDetails: () => ({ data: undefined }),
}));
vi.mock("./SidebarUsageCard", () => ({ default: () => null }));

vi.mock("@/app/(dashboard)/hooks/useLogout", () => ({
  useLogout: () => vi.fn(),
}));

const teamMemberAuthorization = {
  userId: "team-member-user-id",
  accessToken: "test-access-token",
  userRole: "internal",
  isViewOnly: false,
  token: "test-token",
  userEmail: "teamuser@example.com",
  premiumUser: false,
  disabledPersonalKeyCreation: false,
  showSSOBanner: false,
};

describe("Sidebar (leftnav)", () => {
  const defaultProps = {
    collapsed: false,
  };

  afterEach(() => {
    mockUseAuthorized.mockReset();
    mockUseOrganizations.mockReset();
    mockUseTeams.mockReset();
    mockUseTeams.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });
    mockUseThemeImpl = unbrandedTheme;
    navState.pathname = "/ui/api-keys";
    uiConfig.data = { admin_ui_disabled: false, use_si_terminology: false };
  });

  it("uses SI terminology in section and page labels when the proxy asks for it", () => {
    uiConfig.data = { admin_ui_disabled: false, use_si_terminology: true };
    renderWithProviders(
      <TerminologyProvider>
        <Sidebar {...defaultProps} />
      </TerminologyProvider>,
    );

    expect(screen.getByText("SI GATEWAY")).toBeInTheDocument();
    expect(screen.getByText("Model Management")).toBeInTheDocument();
    expect(screen.queryByText("AI Hub")).not.toBeInTheDocument();
  });

  it("uses the MoMA text brand to return to the dashboard home", () => {
    renderWithProviders(<Sidebar {...defaultProps} />);
    expect(screen.getByRole("link", { name: "MoMA 轻量版" })).toHaveAttribute("href", "/ui/home");
  });

  it("keeps the administrator pages and the original Settings children", () => {
    renderWithProviders(<Sidebar {...defaultProps} enableProjectsUI />);
    for (const label of [
      "Home",
      "Virtual Keys",
      "Model Management",
      "Usage",
      "Logs",
      "Internal Users",
      "Teams",
      "Access Groups",
      "Budgets",
    ]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    for (const label of ["Router Settings", "Logging & Alerts", "Admin Settings", "UI Theme"]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
    for (const label of [
      "MCP Servers",
      "Guardrails",
      "AI Hub",
      "Cost Tracking",
      "Playground",
      "Projects Beta",
      "API Reference",
      "Organizations",
    ]) {
      expect(screen.queryByRole("link", { name: label })).not.toBeInTheDocument();
    }
  });

  it("restores employee access-control menus under the original role checks", () => {
    mockUseAuthorized.mockReturnValue(teamMemberAuthorization);
    renderWithProviders(<Sidebar {...defaultProps} enableProjectsUI />);
    for (const label of ["Home", "Virtual Keys", "Model marketplace", "Usage", "Teams"]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
    for (const label of [
      "Logs",
      "Internal Users",
      "Organizations",
      "Access Groups",
      "Budgets",
      "Projects",
      "MCP Servers",
      "Playground",
      "API Reference",
    ]) {
      expect(screen.queryByRole("link", { name: label })).not.toBeInTheDocument();
    }
    expect(screen.queryByRole("button", { name: "Settings" })).not.toBeInTheDocument();
  });

  it("lets the employee page allowlist further restrict core pages without reopening masked pages", () => {
    mockUseAuthorized.mockReturnValue(teamMemberAuthorization);
    renderWithProviders(<Sidebar {...defaultProps} enabledPagesInternalUsers={["api-keys", "agents", "teams"]} />);
    expect(screen.getByRole("link", { name: "Virtual Keys" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Usage" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Agents" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Teams" })).toBeInTheDocument();
  });

  it("keeps view-only administrators out of the cost-incurring Playground", () => {
    mockUseAuthorized.mockReturnValue({ ...teamMemberAuthorization, userRole: "admin", isViewOnly: true });
    renderWithProviders(<Sidebar {...defaultProps} />);
    expect(screen.queryByRole("link", { name: "Playground" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Model Management" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Logs" })).toBeInTheDocument();
  });

  it("expands the retained Settings group and marks the current child active", () => {
    navState.pathname = "/ui/router-settings";
    renderWithProviders(<Sidebar {...defaultProps} />);
    expect(screen.getByRole("button", { name: "Settings" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Router Settings" })).toHaveAttribute("data-active", "true");
  });

  it("keeps retained menu links usable in the collapsed rail", () => {
    renderWithProviders(<Sidebar {...defaultProps} collapsed />);
    expect(screen.getByRole("link", { name: "Virtual Keys" })).toHaveAttribute("href", "/ui/api-keys");
    expect(screen.queryByRole("link", { name: "Playground" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Usage" })).toHaveAttribute("href", "/ui/usage");
  });
});

describe("getBreadcrumb", () => {
  it("resolves a top-level route to its section + title", () => {
    expect(getBreadcrumb("/ui/api-keys")).toEqual({ section: "AI Gateway", title: "Virtual Keys" });
    expect(getBreadcrumb("/ui/logs")).toEqual({ section: "Observability", title: "Logs" });
  });

  it("resolves routes whose segment differs from the sidebar page id", () => {
    expect(getBreadcrumb("/ui/model-hub-table")).toEqual({ section: "AI Gateway", title: "Model marketplace" });
    expect(getBreadcrumb("/ui/models-and-endpoints")).toEqual({ section: "AI Gateway", title: "Model Management" });
    expect(getBreadcrumb("/ui/usage")).toEqual({ section: "Observability", title: "Usage" });
    expect(getBreadcrumb("/ui/old-usage")).toEqual({ section: "Developer Tools", title: "Old Usage" });
  });

  it("titles the dashboard root as Home", () => {
    expect(getBreadcrumb("/ui/")).toEqual({ section: "AI Gateway", title: "Home" });
  });

  it("resolves a nested child route to its parent section", () => {
    expect(getBreadcrumb("/ui/search-tools/")).toEqual({ section: "AI Gateway", title: "Search Tools" });
  });

  it("resolves router-settings under the Settings section", () => {
    expect(getBreadcrumb("/ui/router-settings")).toEqual({ section: "Settings", title: "Router Settings" });
  });

  it("falls back to a prettified title with no section for unknown routes", () => {
    expect(getBreadcrumb("/ui/some-unknown-page")).toEqual({ section: null, title: "Some Unknown Page" });
  });
});
