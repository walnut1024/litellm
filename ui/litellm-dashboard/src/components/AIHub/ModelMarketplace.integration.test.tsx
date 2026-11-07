import { afterEach, expect, it, vi } from "vitest";
import { fireEvent, renderWithProviders, screen, within } from "../../../tests/test-utils";
import ModelMarketplace from "./ModelMarketplace";

vi.mock("@/app/(dashboard)/hooks/useAuthorized", () => ({
  default: () => ({ accessToken: "sk-test", userId: "catalog-reader", userRole: "internal_user" }),
}));

afterEach(() => vi.unstubAllGlobals());

it("uses the authorized catalog for featured cards and opens the same shareable model detail", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (request: Request | string) => {
      const url = typeof request === "string" ? request : request.url;
      return url.endsWith("/model_group/info")
        ? Response.json({
            data: [
              { model_group: "catalog-chat", providers: ["openai"], mode: "chat" },
              { model_group: "agent-resource", providers: ["a2a"] },
            ],
          })
        : Response.json({}, { status: 404 });
    }),
  );
  const onUrlUpdate = vi.fn();
  renderWithProviders(<ModelMarketplace />, { onUrlUpdate });

  const hideCards = await screen.findByRole("button", { name: "Hide featured models", expanded: true });
  expect(screen.queryByRole("button", { name: /agent-resource/ })).not.toBeInTheDocument();
  fireEvent.click(hideCards);
  expect(screen.queryByRole("button", { name: /catalog-chat.*View details/ })).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "catalog-chat", exact: true })).toBeVisible();

  fireEvent.click(screen.getByRole("button", { name: "Show featured models", expanded: false }));
  fireEvent.click(screen.getByRole("button", { name: /catalog-chat.*View details/ }));
  const detail = await screen.findByRole("dialog", { name: "catalog-chat" });
  expect(within(detail).getByRole("button", { name: "Copy model ID" })).toBeVisible();
  expect(onUrlUpdate).toHaveBeenCalledWith(expect.objectContaining({ queryString: "?model=catalog-chat" }));
});
