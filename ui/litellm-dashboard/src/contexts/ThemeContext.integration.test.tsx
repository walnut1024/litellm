import { render, screen, waitFor } from "@testing-library/react";
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
  const { setFaviconUrl } = useTheme();
  return (
    <>
      <button onClick={() => setFaviconUrl("https://assets.example.test/custom.ico")}>自定义</button>
      <button onClick={() => setFaviconUrl(null)}>恢复</button>
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
