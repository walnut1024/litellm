import { describe, expect, it } from "vitest";
import { navAccountDisplayName } from "./navDisplayName";

describe("navAccountDisplayName", () => {
  it("should prefer email when present", () => {
    expect(navAccountDisplayName("x@y.com", "ignored", "账户")).toBe("x@y.com");
  });

  it("should map default_user_id placeholder to Account", () => {
    expect(navAccountDisplayName(null, "default_user_id", "账户")).toBe("账户");
    expect(navAccountDisplayName(null, "DEFAULT_USER_ID", "Account")).toBe("Account");
  });

  it("should show a sensible token when user id is non-placeholder", () => {
    expect(navAccountDisplayName(null, "user-uuid-123", "账户")).toBe("user-uuid-123");
    expect(navAccountDisplayName(null, "Home", "账户")).toBe("Home");
  });
});
