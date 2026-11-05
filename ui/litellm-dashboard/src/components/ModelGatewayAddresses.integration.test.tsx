import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen } from "../../tests/test-utils";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { getGatewayBaseUrl } from "@/components/networking";
import { ModelGatewayAddresses } from "./ModelGatewayAddresses";

vi.mock("@/components/networking", () => ({ getGatewayBaseUrl: vi.fn(() => "https://gateway.example") }));
afterEach(() => localStorage.removeItem("moma.locale"));

describe("gateway protocol addresses", () => {
  it.each([
    ["https://gateway.example/", "https://gateway.example/v1", "https://gateway.example"],
    ["https://gateway.example/proxy///", "https://gateway.example/proxy/v1", "https://gateway.example/proxy"],
    ["https://worker.example/v1/", "https://worker.example/v1", "https://worker.example"],
    ["https://gateway.example/proxy/v1///", "https://gateway.example/proxy/v1", "https://gateway.example/proxy"],
  ])("copies both protocol addresses from %s", async (gateway, openAiUrl, anthropicUrl) => {
    vi.mocked(getGatewayBaseUrl).mockReturnValue(gateway);
    const user = userEvent.setup();
    renderWithProviders(<ModelGatewayAddresses />);
    expect(screen.getByText(openAiUrl, { exact: true })).toBeVisible();
    expect(screen.getByText(anthropicUrl, { exact: true })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Copy OpenAI URL" }));
    expect(await navigator.clipboard.readText()).toBe(openAiUrl);
    await user.click(screen.getByRole("button", { name: "Copy Anthropic URL" }));
    expect(await navigator.clipboard.readText()).toBe(anthropicUrl);
  });

  it("explains both protocol addresses in Chinese", () => {
    renderWithProviders(
      <LocaleProvider>
        <ModelGatewayAddresses />
      </LocaleProvider>,
    );
    expect(screen.getByRole("region", { name: "OpenAI 协议 Base URL" })).toBeVisible();
    expect(screen.getByRole("region", { name: "Anthropic 协议 Base URL" })).toBeVisible();
    expect(screen.getByText("填写到 OpenAI 兼容客户端的 Base URL，保留末尾 /v1。")).toBeVisible();
    expect(screen.getByText("填写到 Anthropic SDK 的 base_url 或 ANTHROPIC_BASE_URL，不添加 /v1。")).toBeVisible();
  });
});
