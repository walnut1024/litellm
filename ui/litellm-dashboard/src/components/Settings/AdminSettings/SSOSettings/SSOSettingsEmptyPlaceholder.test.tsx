import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SSOSettingsEmptyPlaceholder from "./SSOSettingsEmptyPlaceholder";
import { LocaleProvider } from "@/contexts/LocaleContext";

describe("SSOSettingsEmptyPlaceholder", () => {
  it("localizes the empty state and opens configuration", () => {
    localStorage.setItem("moma.locale", "zh-CN");
    const onAdd = vi.fn();
    render(
      <LocaleProvider>
        <SSOSettingsEmptyPlaceholder onAdd={onAdd} />
      </LocaleProvider>,
    );
    expect(screen.getByText("尚未配置单点登录")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "配置单点登录" }));
    expect(onAdd).toHaveBeenCalledOnce();
    localStorage.clear();
  });
  it("should render", () => {
    const onAdd = vi.fn();

    render(<SSOSettingsEmptyPlaceholder onAdd={onAdd} />);

    expect(screen.getByText("No SSO Configuration Found")).toBeInTheDocument();
    expect(screen.getByText("Configure SSO")).toBeInTheDocument();
  });
});
