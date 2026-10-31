import { describe, expect, it } from "vitest";
import { translate } from "./translate";

describe("translate", () => {
  it("translates UI copy and keeps English available", () => {
    expect(translate("Key Alias", "zh-CN")).toBe("密钥别名");
    expect(translate("Key Alias", "en")).toBe("Key Alias");
  });

  it("keeps unknown text and interpolated data verbatim", () => {
    expect(translate("custom-model-42", "zh-CN")).toBe("custom-model-42");
    expect(translate("constructor", "zh-CN")).toBe("constructor");
    expect(translate("__proto__", "zh-CN")).toBe("__proto__");
    expect(translate("{model}", "zh-CN", { model: "Home" })).toBe("Home");
    expect(translate("Page {page} of {pages}", "zh-CN", { page: 2, pages: 5 })).toBe("第 2 / 5 页");
    expect(translate("missing {value}", "en")).toBe("missing {value}");
  });

  it("normalizes multiline source copy without changing surrounding spacing", () => {
    expect(translate("  Key\n Alias ", "zh-CN")).toBe("  密钥别名 ");
  });
});
