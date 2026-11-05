import { render, screen, within, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DailyActivityAggregatedResponse } from "@/components/UsagePage/dailyActivityApi";
import { EMPTY_DAILY_ACTIVITY_METADATA } from "@/components/UsagePage/dailyActivityApi";
import { all_admin_roles } from "@/utils/roles";
import HomePage from "./HomePage";

const auth = vi.hoisted(() => ({
  accessToken: "sk-test",
  userRole: "",
  userId: "u1",
  isViewOnly: false,
  isAuthorized: true,
  isLoading: false,
  premiumUser: true,
  token: "test-token",
}));
vi.mock("@/app/(dashboard)/hooks/useAuthorized", () => ({ default: () => auth }));
const network = vi.hoisted(() => ({ aggregated: vi.fn(), gateway: vi.fn(), userInfo: vi.fn() }));
vi.mock("@/components/networking", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/components/networking")>()),
  dailyActivityAggregatedCall: (...args: unknown[]) => network.aggregated(...args),
  gatewayDailyActivityCall: (...args: unknown[]) => network.gateway(...args),
  userGetInfoV2: (...args: unknown[]) => network.userInfo(...args),
  getProxyBaseUrl: () => "http://proxy.test",
}));
const dayResult = (date: string, model: string, tokens: number) => {
  const metrics = {
    spend: 1,
    prompt_tokens: tokens,
    completion_tokens: 0,
    total_tokens: tokens,
    api_requests: 1,
    successful_requests: 1,
    failed_requests: 0,
    cache_read_input_tokens: 0,
    cache_creation_input_tokens: 0,
  };
  return {
    date,
    metrics,
    breakdown: {
      models: {},
      model_groups: { [model]: { metrics, metadata: {}, api_key_breakdown: {} } },
      providers: {},
      api_keys: {},
      entities: {},
      mcp_servers: {},
    },
  };
};

const activity: DailyActivityAggregatedResponse = {
  results: [
    dayResult("2026-10-08", "demo-chat-a", 900),
    dayResult("2026-10-09", "demo-chat-b", 100),
  ] as unknown as DailyActivityAggregatedResponse["results"],
  metadata: {
    ...EMPTY_DAILY_ACTIVITY_METADATA,
    total_spend: 501.74,
    total_api_requests: 5118,
    total_successful_requests: 5075,
    total_failed_requests: 43,
    total_tokens: 98_600_000,
  },
};

const renderHome = () =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <HomePage />
    </QueryClientProvider>,
  );
describe("Home workspace", () => {
  beforeEach(() => {
    auth.isViewOnly = false;
    auth.userRole = all_admin_roles[0]!;
    network.aggregated.mockReset().mockResolvedValue(activity);
    network.gateway.mockReset().mockResolvedValue({ total_successful_requests: 0, total_failed_requests: 0 });
    network.userInfo.mockReset().mockResolvedValue({ user_info: { max_budget: null } });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ data: [{ id: "demo-chat" }] })),
    );
  });
  afterEach(() => vi.unstubAllGlobals());
  it("shows recorded usage and a working key creation entry", async () => {
    renderHome();
    expect(screen.getByRole("heading", { level: 1, name: "Welcome to your workspace" })).toBeInTheDocument();
    expect(await screen.findByText("¥501.74")).toBeInTheDocument();
    expect(screen.getByText("5,118")).toBeInTheDocument();
    expect(screen.getByText("98.6M")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /create new virtual key/i })).toHaveAttribute(
      "href",
      expect.stringMatching(/\/api-keys\?create=true$/),
    );
    expect(network.aggregated).toHaveBeenCalledWith("user", expect.objectContaining({ accessToken: "sk-test" }));
  });
  it("preserves the view-only restriction", () => {
    auth.isViewOnly = true;
    renderHome();
    expect(screen.queryByRole("link", { name: /create new virtual key/i })).not.toBeInTheDocument();
  });
  it("shows retry instead of invented zero totals on a request failure", async () => {
    network.aggregated.mockRejectedValueOnce(new Error("boom"));
    renderHome();
    const alerts = await screen.findAllByRole("alert");
    expect(alerts[0]).toHaveTextContent("Failed to load usage");
    expect(screen.queryByText("¥0.00")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByText("¥501.74")).toBeInTheDocument();
    expect(network.aggregated).toHaveBeenCalledTimes(2);
  });
  it("uses authorized model data for the model cards and links to the catalog", async () => {
    renderHome();
    const models = screen.getByRole("region", { name: "Available models" });
    expect(await within(models).findByRole("link", { name: /demo-chat/ })).toHaveAttribute(
      "href",
      "/ui/model-hub-table",
    );
    expect(within(models).getByRole("link", { name: /demo-chat/ })).toHaveTextContent("View details");
    expect(screen.getByText("Choose a model you have access to. No activation is required.")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Token usage trend" })).toBeInTheDocument();
    expect(screen.getByText("Last 7 days")).toBeInTheDocument();
  });
});
