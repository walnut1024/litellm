import { fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../tests/test-utils";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { ModelCatalog } from "./ModelCatalog";
import type { ModelData } from "./model_dashboard/types";

const model: ModelData = {
  model_name: "demo-chat",
  provider: "openai",
  litellm_model_name: "openai/demo-chat",
  input_cost: null,
  output_cost: null,
  litellm_params: { model: "openai/demo-chat" },
  cleanedLitellmParams: {},
  model_info: {
    id: "model-id",
    created_at: "",
    updated_at: "",
    created_by: "admin",
    team_id: "",
    db_model: true,
    access_groups: [],
  },
};

describe("direct model use", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.removeItem("moma.locale");
  });

  it("offers API key management without checking keys or creating a credential", () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    renderWithProviders(<ModelCatalog models={[model]} onModelClick={vi.fn()} />);

    expect(screen.getByRole("heading", { name: model.model_name })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Use model" })).toHaveAttribute("href", "/ui/api-keys");
    expect(screen.getByText("Available")).toBeInTheDocument();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("uses a team public name while opening the original model details", () => {
    const publicName = "team-public-chat";
    const onModelClick = vi.fn();
    renderWithProviders(
      <ModelCatalog
        models={[{ ...model, model_info: { ...model.model_info, team_public_model_name: publicName } }]}
        onModelClick={onModelClick}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: publicName }));
    fireEvent.click(screen.getByRole("button", { name: "View details" }));
    expect(onModelClick.mock.calls).toEqual([[model.model_info.id], [model.model_info.id]]);
    expect(screen.getByRole("link", { name: "Use model" })).toHaveAttribute("href", "/ui/api-keys");
  });

  it("keeps paused models unavailable", () => {
    renderWithProviders(
      <ModelCatalog
        models={[{ ...model, model_info: { ...model.model_info, blocked: true } }]}
        onModelClick={vi.fn()}
      />,
    );

    expect(screen.getByText("Paused")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Use model" })).toBeDisabled();
  });

  it("shows direct use in Chinese without requiring a key query", () => {
    localStorage.setItem("moma.locale", "zh-CN");
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    renderWithProviders(
      <LocaleProvider>
        <ModelCatalog models={[model]} onModelClick={vi.fn()} />
      </LocaleProvider>,
    );

    expect(screen.getByRole("link", { name: "立即使用" })).toHaveAttribute("href", "/ui/api-keys");
    expect(screen.getByText("可用")).toBeInTheDocument();
    expect(fetcher).not.toHaveBeenCalled();
  });
});
