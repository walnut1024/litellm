import { describe, expect, it } from "vitest";
import type { ProviderCreateInfo } from "../networking";
import { getModelProviders, MOMA_PROVIDER } from "./modelProviders";

const metadata: ProviderCreateInfo[] = [
  { provider: "Anthropic", provider_display_name: "Anthropic", litellm_provider: "anthropic", credential_fields: [] },
  { provider: "Deepseek", provider_display_name: "Deepseek", litellm_provider: "deepseek", credential_fields: [] },
  {
    provider: MOMA_PROVIDER,
    provider_display_name: "OpenAI-compatible endpoints",
    litellm_provider: "openai",
    credential_fields: [{ key: "api_base", label: "API Base", required: true }],
  },
  { provider: "OpenAI", provider_display_name: "OpenAI", litellm_provider: "openai", credential_fields: [] },
];

describe("model creation provider catalog", () => {
  it("offers MoMA first and domestic suppliers with their original adapters and fields", () => {
    const options = getModelProviders(metadata);
    expect(options.map((option) => option.provider_display_name)).toEqual(["移动云 MoMA", "DeepSeek（深度求索）"]);
    expect(options[0].litellm_provider).toBe("openai");
    expect(options[0].credential_fields).toEqual(metadata[2].credential_fields);
    expect(options[1].litellm_provider).toBe(metadata[1].litellm_provider);
    expect(metadata[2].provider_display_name).toBe("OpenAI-compatible endpoints");
  });

  it("does not fabricate unavailable suppliers while metadata is loading", () => {
    expect(getModelProviders()).toEqual([]);
  });
});
