import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders, testQueryClient } from "../../tests/test-utils";
import { keyKeys } from "@/app/(dashboard)/hooks/keys/useKeys";
import { ModelCatalog } from "./ModelCatalog";
import type { ModelData } from "./model_dashboard/types";

const auth = vi.hoisted(() => ({
  accessToken: "test-session",
  userId: "employee",
  userRole: "Internal User",
  isViewOnly: false,
  disabledPersonalKeyCreation: false,
}));
vi.mock("@/app/(dashboard)/hooks/useAuthorized", () => ({ default: () => auth }));

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

describe("model activation", () => {
  beforeEach(() => {
    testQueryClient.clear();
    auth.userRole = "Internal User";
    auth.isViewOnly = false;
    auth.disabledPersonalKeyCreation = false;
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const requestUrl = (input: RequestInfo | URL): string => {
    if (typeof input === "string") return input;
    return input instanceof URL ? input.href : input.url;
  };

  const setup = (
    options: {
      existing?: boolean;
      fail?: boolean;
      allowed?: boolean;
      laterPage?: boolean;
      listFailure?: boolean;
      teamId?: string;
      publicName?: string;
    } = {},
  ) => {
    const writes: unknown[] = [];
    let didCreate = false;
    let serverHasKey = Boolean(options.existing);
    const publicName = options.publicName ?? model.model_name;
    const catalogModel = { ...model, model_info: { ...model.model_info, team_public_model_name: options.publicName } };
    const key = {
      token: "test-key-hash",
      user_id: "employee",
      team_id: options.teamId ?? null,
      models: [publicName],
      key_type: "llm_api",
      blocked: false,
      expires: null,
    };
    const existingHere = (page: number) => serverHasKey && (!options.laterPage || page === 2);
    const fetcher = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(requestUrl(input), "http://localhost");
      if (url.pathname.endsWith("/key/generate")) {
        writes.push(JSON.parse(String(init?.body)));
        didCreate = !options.fail;
        return options.fail
          ? Response.json({ error: { message: "Model access denied" } }, { status: 403 })
          : Response.json({ key: "sk-test-created-key" });
      }
      if (url.pathname.endsWith("/key/list")) {
        if (options.listFailure) return Response.json({ error: { message: "List unavailable" } }, { status: 503 });
        const page = Number(url.searchParams.get("page") ?? "1");
        const pageResponse = {
          keys: existingHere(page) || didCreate ? [key] : [],
          current_page: page,
          total_pages: options.laterPage ? 2 : 1,
          total_count: serverHasKey || didCreate ? 1 : 0,
        };
        return Response.json(pageResponse);
      }
      if (url.pathname.endsWith("/models"))
        return Response.json({ data: options.allowed === false ? [] : [{ id: publicName }] });
      return Response.json({});
    });
    vi.stubGlobal("fetch", fetcher);
    renderWithProviders(
      <ModelCatalog models={[catalogModel]} teamId={options.teamId ?? null} onModelClick={vi.fn()} />,
    );
    return {
      writes,
      fetcher,
      setServerKey: (exists: boolean) => {
        serverHasKey = exists;
      },
    };
  };

  it("creates a model-scoped key in one click and shows the secret only in the result dialog", async () => {
    const { writes } = setup();
    const activate = await screen.findByRole("button", { name: "Activate" });
    await waitFor(() => expect(activate).toBeEnabled());
    fireEvent.click(activate);
    fireEvent.click(activate);
    expect(await screen.findByRole("dialog", { name: "Model activated" })).toHaveTextContent("sk-test-created-key");
    expect(writes).toHaveLength(1);
    const expectedPayload = { user_id: "employee", models: [model.model_name], team_id: null, key_type: "llm_api" };
    expect(writes[0]).toEqual(expect.objectContaining(expectedPayload));
    expect([...Object.values(localStorage), ...Object.values(sessionStorage)].join()).not.toContain(
      "sk-test-created-key",
    );
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByText("sk-test-created-key")).not.toBeInTheDocument());
    expect(await screen.findByRole("link", { name: "Use model" })).toHaveAttribute(
      "href",
      "/ui/api-keys?key=test-key-hash",
    );
  });
  it("keeps administrator personal-key creation available when the restriction targets employees", async () => {
    auth.userRole = "Admin";
    auth.disabledPersonalKeyCreation = true;
    setup();
    await waitFor(() => expect(screen.getByRole("button", { name: "Activate" })).toBeEnabled());
  });
  it("uses the same team public model name for display, authorization and key creation", async () => {
    const publicName = "team-public-chat";
    const { writes } = setup({ teamId: "team-a", publicName });
    expect(screen.getByRole("heading", { name: publicName })).toBeInTheDocument();
    const activate = screen.getByRole("button", { name: "Activate" });
    await waitFor(() => expect(activate).toBeEnabled());
    fireEvent.click(activate);
    await screen.findByRole("dialog", { name: "Model activated" });
    expect(writes[0]).toEqual(expect.objectContaining({ models: [publicName], team_id: "team-a" }));
  });
  it("checks later key pages before offering activation", async () => {
    const { writes } = setup({ existing: true, laterPage: true });
    expect(await screen.findByRole("link", { name: "Use model" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Activate" })).not.toBeInTheDocument();
    expect(writes).toHaveLength(0);
  });
  it("refreshes activation after a standard key-list mutation removes the credential", async () => {
    const { setServerKey } = setup({ existing: true });
    await screen.findByRole("link", { name: "Use model" });
    setServerKey(false);
    await testQueryClient.invalidateQueries({ queryKey: keyKeys.lists() });
    await waitFor(() => expect(screen.getByRole("button", { name: "Activate" })).toBeEnabled());
    expect(screen.queryByRole("link", { name: "Use model" })).not.toBeInTheDocument();
  });
  it("does not show success when the backend rejects activation", async () => {
    const { writes } = setup({ fail: true });
    const activate = await screen.findByRole("button", { name: "Activate" });
    await waitFor(() => expect(activate).toBeEnabled());
    fireEvent.click(activate);
    await waitFor(() => expect(writes).toHaveLength(1));
    await waitFor(() => expect(activate).toBeEnabled());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByText("Activated")).not.toBeInTheDocument();
  });
  it("keeps activation within the chosen team", async () => {
    const { writes } = setup({ teamId: "team-a" });
    const activate = await screen.findByRole("button", { name: "Activate" });
    await waitFor(() => expect(activate).toBeEnabled());
    fireEvent.click(activate);
    await screen.findByRole("dialog", { name: "Model activated" });
    expect(writes[0]).toEqual(expect.objectContaining({ team_id: "team-a", models: [model.model_name] }));
  });
  it.each(["view-only", "personal-disabled", "unauthorized", "list-error"])(
    "blocks activation for %s",
    async (reason) => {
      auth.isViewOnly = reason === "view-only";
      auth.disabledPersonalKeyCreation = reason === "personal-disabled";
      const { writes } = setup({ allowed: reason !== "unauthorized", listFailure: reason === "list-error" });
      const activate = await screen.findByRole("button", { name: "Activate" });
      await waitFor(() => expect(fetch).toHaveBeenCalled());
      await waitFor(() => expect(testQueryClient.isFetching()).toBe(0));
      expect(activate).toBeDisabled();
      fireEvent.click(activate);
      expect(writes).toHaveLength(0);
    },
  );
});
