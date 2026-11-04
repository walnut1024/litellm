import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { MomaBrand } from "./MomaBrand";

const state = vi.hoisted(() => ({
  logoUrl: null as string | null,
  logoUrlDark: null as string | null,
  theme: "light",
}));
vi.mock("@/contexts/ThemeContext", () => ({ useTheme: () => state }));
vi.mock("next-themes", () => ({ useTheme: () => ({ resolvedTheme: state.theme }) }));
afterEach(() => {
  state.logoUrl = null;
  state.logoUrlDark = null;
  state.theme = "light";
});

describe("MomaBrand", () => {
  it("uses the text brand when no custom light logo is configured", () => {
    state.logoUrlDark = "https://assets.example.test/dark.png";
    render(<MomaBrand />);
    expect(screen.getByText("MoMA 轻量版")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
  it("previews new URLs and follows the active color theme", () => {
    state.logoUrl = "https://assets.example.test/light.png";
    state.logoUrlDark = "https://assets.example.test/dark.png";
    const { rerender } = render(
      <LocaleProvider>
        <MomaBrand />
      </LocaleProvider>,
    );
    expect(screen.getByRole("img", { name: "自定义品牌标志" })).toHaveAttribute("src", state.logoUrl);
    state.theme = "dark";
    rerender(
      <LocaleProvider>
        <MomaBrand />
      </LocaleProvider>,
    );
    expect(screen.getByRole("img")).toHaveAttribute("src", state.logoUrlDark);
    state.logoUrlDark = "https://assets.example.test/new.png";
    rerender(
      <LocaleProvider>
        <MomaBrand />
      </LocaleProvider>,
    );
    expect(screen.getByRole("img")).toHaveAttribute("src", state.logoUrlDark);
  });
  it("falls back from a failed dark logo to the light logo and then to text", () => {
    state.theme = "dark";
    state.logoUrl = "https://assets.example.test/light.png";
    state.logoUrlDark = "https://assets.example.test/dark.png";
    render(<MomaBrand />);
    fireEvent.error(screen.getByRole("img"));
    expect(screen.getByRole("img")).toHaveAttribute("src", state.logoUrl);
    fireEvent.error(screen.getByRole("img"));
    expect(screen.getByText("MoMA 轻量版")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
