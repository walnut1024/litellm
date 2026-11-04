import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import { ThemeProvider, useTheme } from "./ThemeContext";
import { uiHref } from "@/utils/uiHref";

vi.mock("@/components/networking", () => ({ getProxyBaseUrl: () => null }));
afterEach(() => {
  vi.unstubAllGlobals();
  document.head.querySelectorAll("link[rel*='icon']").forEach((link) => link.remove());
});

function Controls() {
  const { logoUrl, logoUrlDark, setLogoUrl, setLogoUrlDark, setFaviconUrl } = useTheme();
  return (
    <>
      <button
        onClick={() => {
          setLogoUrl("https://assets.example.test/custom.png");
          setLogoUrlDark("https://assets.example.test/custom-dark.png");
          setFaviconUrl("https://assets.example.test/custom.ico");
        }}
      >
        自定义
      </button>
      <button
        onClick={() => {
          setLogoUrl(null);
          setLogoUrlDark(null);
          setFaviconUrl(null);
        }}
      >
        恢复
      </button>
      <output aria-label="普通标志">{logoUrl ?? "默认"}</output>
      <output aria-label="深色标志">{logoUrlDark ?? "默认"}</output>
    </>
  );
}

it("restores the default favicon when theme settings clear the custom URL", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ values: {} })));
  render(
    <ThemeProvider>
      <Controls />
    </ThemeProvider>,
  );
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "自定义" }));
  await waitFor(() =>
    expect(document.head.querySelector("link[rel='icon']")).toHaveAttribute(
      "href",
      "https://assets.example.test/custom.ico",
    ),
  );
  await user.click(screen.getByRole("button", { name: "恢复" }));
  await waitFor(() =>
    expect(document.head.querySelector("link[rel='icon']")).toHaveAttribute("href", uiHref("favicon.ico")),
  );
});

it.each(["自定义", "恢复"])("does not overwrite %s with a late initial theme response", async (action) => {
  const response = Promise.withResolvers<Response>();
  vi.stubGlobal("fetch", vi.fn().mockReturnValue(response.promise));
  render(
    <ThemeProvider>
      <Controls />
    </ThemeProvider>,
  );
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "自定义" }));
  if (action === "恢复") await user.click(screen.getByRole("button", { name: "恢复" }));
  const staleSettings = {
    values: {
      logo_url: "https://assets.example.test/old.png",
      logo_url_dark: "https://assets.example.test/old-dark.png",
      favicon_url: "https://assets.example.test/old.ico",
    },
  };
  await act(async () => response.resolve(Response.json(staleSettings)));
  expect(screen.getByLabelText("普通标志")).toHaveTextContent(
    action === "恢复" ? "默认" : "https://assets.example.test/custom.png",
  );
  expect(screen.getByLabelText("深色标志")).toHaveTextContent(
    action === "恢复" ? "默认" : "https://assets.example.test/custom-dark.png",
  );
  expect(document.head.querySelector("link[rel='icon']")).toHaveAttribute(
    "href",
    action === "恢复" ? uiHref("favicon.ico") : "https://assets.example.test/custom.ico",
  );
});
