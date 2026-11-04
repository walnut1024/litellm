import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../../../../../tests/test-utils";
import AddSSOSettingsModal from "./AddSSOSettingsModal";
import { LocaleProvider } from "@/contexts/LocaleContext";

const state = vi.hoisted(() => ({ isPending: false }));
vi.mock("@/app/(dashboard)/hooks/sso/useEditSSOSettings", () => ({
  useEditSSOSettings: () => ({ isPending: state.isPending, mutateAsync: vi.fn() }),
}));
afterEach(() => {
  localStorage.clear();
  state.isPending = false;
});

// Mock networking functions
vi.mock("@/components/networking", () => ({
  updateSSOSettings: vi.fn(),
}));

// Mock error utils
vi.mock("@/components/shared/errorUtils", () => ({
  parseErrorMessage: vi.fn((error) => error?.message || "Unknown error"),
}));

// Mock the useAuthorized hook
vi.mock("@/app/(dashboard)/hooks/useAuthorized", () => ({
  default: () => ({
    accessToken: "test-access-token",
    userId: "test-user-id",
    userEmail: "test@example.com",
    userRole: "admin",
  }),
}));

describe("AddSSOSettingsModal", () => {
  it.each([false, true])("localizes the conditional submit button, pending=%s", (pending) => {
    state.isPending = pending;
    localStorage.setItem("moma.locale", "zh-CN");
    renderWithProviders(
      <LocaleProvider>
        <AddSSOSettingsModal isVisible onCancel={vi.fn()} onSuccess={vi.fn()} />
      </LocaleProvider>,
    );
    expect(screen.getByRole("button", { name: pending ? "正在添加…" : "添加单点登录配置" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "取消" })).toBeInTheDocument();
  });
  it("should render", () => {
    const onCancel = vi.fn();
    const onSuccess = vi.fn();

    renderWithProviders(<AddSSOSettingsModal isVisible={true} onCancel={onCancel} onSuccess={onSuccess} />);

    expect(screen.getByText("SSO Provider")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getAllByText("Add SSO")).toHaveLength(2); // Title and button
  });
});
