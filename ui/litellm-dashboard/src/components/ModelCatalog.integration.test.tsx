import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../tests/test-utils";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { ModelCatalog } from "./ModelCatalog";
import type { ModelHubGroup } from "@/app/(dashboard)/hooks/models/useModels";

const model: ModelHubGroup = {
  model_group: "catalog-chat",
  providers: ["openai"],
  mode: "chat",
  is_public_model_group: false,
  supported_openai_params: [],
  supports_fast_mode: false,
  supports_function_calling: true,
  supports_parallel_function_calling: false,
  supports_reasoning: false,
  supports_url_context: false,
  supports_vision: false,
  supports_web_search: false,
};

afterEach(() => localStorage.removeItem("moma.locale"));

describe("model group catalog", () => {
  it("uses the callable group name for details and key management", () => {
    const onModelClick = vi.fn();
    renderWithProviders(<ModelCatalog models={[model]} onModelClick={onModelClick} />);
    fireEvent.click(screen.getByRole("button", { name: model.model_group }));
    fireEvent.click(screen.getByRole("button", { name: "View details" }));
    expect(onModelClick.mock.calls).toEqual([[model.model_group], [model.model_group]]);
    expect(screen.getByRole("link", { name: "Use model" })).toHaveAttribute("href", "/ui/api-keys");
    expect(screen.getByText("Function calling")).toBeVisible();
  });

  it("copies the callable model group without opening details", async () => {
    const user = userEvent.setup();
    const onModelClick = vi.fn();
    renderWithProviders(<ModelCatalog models={[model]} onModelClick={onModelClick} />);
    await user.click(screen.getByRole("button", { name: "Copy model ID" }));
    expect(await navigator.clipboard.readText()).toBe(model.model_group);
    expect(onModelClick).not.toHaveBeenCalled();
  });

  it("localizes catalog labels and keeps model descriptions unchanged", () => {
    localStorage.setItem("moma.locale", "zh-CN");
    renderWithProviders(
      <LocaleProvider>
        <ModelCatalog models={[{ ...model, description: "My model description" }]} onModelClick={vi.fn()} />
      </LocaleProvider>,
    );
    expect(screen.getByRole("link", { name: "立即使用" })).toHaveAttribute("href", "/ui/api-keys");
    expect(screen.getByText("调用模型 ID")).toBeVisible();
    expect(screen.getByText("工具调用")).toBeVisible();
    expect(screen.getByText("My model description")).toBeVisible();
  });
});
