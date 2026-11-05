import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { chooseSelectOption, renderWithProviders, testQueryClient } from "../../../../tests/test-utils";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { modelHubCall } from "@/components/networking";
import type { ModelHubGroup } from "@/app/(dashboard)/hooks/models/useModels";
import ModelHubTablePage from "./page";

vi.mock("@/app/(dashboard)/hooks/useAuthorized", () => ({
  default: () => ({ accessToken: "test-key", userId: "employee", userRole: "Internal User" }),
}));
vi.mock("@/components/networking", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/components/networking")>()),
  modelHubCall: vi.fn(),
  getGatewayBaseUrl: () => "https://gateway.example",
}));
const model: ModelHubGroup = {
  model_group: "catalog-chat",
  providers: ["openai"],
  mode: "chat",
  description: "Catalog model description",
  is_public_model_group: false,
  supported_openai_params: [],
  supports_fast_mode: false,
  supports_function_calling: true,
  supports_parallel_function_calling: false,
  supports_reasoning: false,
  supports_url_context: false,
  supports_vision: false,
  supports_web_search: false,
  input_cost_per_token: 0,
  output_cost_per_token: 0.000002,
};
const embedding = { ...model, model_group: "catalog-embedding", mode: "embedding", providers: ["anthropic"] };

beforeEach(() => {
  testQueryClient.clear();
  vi.clearAllMocks();
  vi.mocked(modelHubCall).mockResolvedValue({
    data: [model, embedding, { ...model, model_group: "a2a/catalog-agent", providers: ["a2a"] }],
  });
});
afterEach(() => {
  testQueryClient.clear();
  localStorage.removeItem("moma.locale");
});

describe("signed-in model marketplace", () => {
  it("shows the authorized group catalog and both protocol addresses without management or agent entries", async () => {
    renderWithProviders(
      <LocaleProvider>
        <ModelHubTablePage />
      </LocaleProvider>,
    );
    expect(await screen.findByRole("heading", { name: model.model_group })).toBeVisible();
    expect(screen.getByRole("region", { name: "OpenAI 协议 Base URL" })).toBeVisible();
    expect(screen.getByRole("region", { name: "Anthropic 协议 Base URL" })).toBeVisible();
    expect(screen.queryByText("a2a/catalog-agent")).not.toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "添加模型" })).not.toBeInTheDocument();
    expect(modelHubCall).toHaveBeenCalledWith("test-key");
    expect(screen.getAllByRole("link", { name: "立即使用" })).toHaveLength(2);
  });

  it("opens model group details and copies a call example with a placeholder key", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <LocaleProvider>
        <ModelHubTablePage />
      </LocaleProvider>,
    );
    await user.click(await screen.findByRole("button", { name: model.model_group, exact: true }));
    const dialog = await screen.findByRole("dialog", { name: model.model_group });
    expect(within(dialog).getByText("输入价格（元/百万 Token）")).toBeVisible();
    expect(within(dialog).getByText("¥0")).toBeVisible();
    await user.click(within(dialog).getByRole("button", { name: "复制代码" }));
    const code = await navigator.clipboard.readText();
    expect(code).toContain(model.model_group);
    expect(code).toContain("https://gateway.example/v1");
    expect(code).toContain("YOUR_API_KEY");
    expect(code).not.toContain("test-key");
  });

  it("filters by search and mode and generates an embedding example for an embedding model", async () => {
    const user = userEvent.setup();
    const onUrlUpdate = vi.fn();
    renderWithProviders(<ModelHubTablePage />, { onUrlUpdate });
    await screen.findByRole("heading", { name: model.model_group });
    fireEvent.change(screen.getByRole("textbox", { name: "Search models" }), { target: { value: "embedding" } });
    await waitFor(() => expect(screen.queryByRole("heading", { name: model.model_group })).not.toBeInTheDocument());
    await chooseSelectOption(user, screen.getByRole("combobox", { name: "Mode" }), "Embedding");
    await user.click(screen.getByRole("button", { name: embedding.model_group, exact: true }));
    const dialog = await screen.findByRole("dialog", { name: embedding.model_group });
    expect(within(dialog).getByText(/client.embeddings.create/)).toBeVisible();
    expect(onUrlUpdate.mock.calls.at(-1)?.[0].searchParams.get("search")).toBe("embedding");
  });

  it("handles load failure and retries through the visible refresh action", async () => {
    vi.mocked(modelHubCall).mockRejectedValueOnce(new Error("unavailable"));
    const user = userEvent.setup();
    renderWithProviders(
      <LocaleProvider>
        <ModelHubTablePage />
      </LocaleProvider>,
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("模型加载失败，请重试。");
    await user.click(screen.getByRole("button", { name: "刷新" }));
    expect(await screen.findByRole("heading", { name: model.model_group })).toBeVisible();
  });
});
