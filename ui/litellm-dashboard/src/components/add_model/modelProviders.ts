import type { ProviderCreateInfo } from "../networking";

export const MOMA_PROVIDER = "OpenAI_Compatible";

const MODEL_PROVIDER_NAMES: Readonly<Record<string, string>> = {
  [MOMA_PROVIDER]: "移动云 MoMA",
  Deepseek: "DeepSeek（深度求索）",
  Qwen_AI_Platform: "阿里云百炼",
  Dashscope: "阿里云 DashScope",
  QwenCloud: "阿里云 QwenCloud",
  MINIMAX: "MiniMax",
  MOONSHOT: "月之暗面 Moonshot",
  Tencent: "腾讯云",
  VolcEngine: "火山引擎",
};

export const getModelProviders = (metadata: readonly ProviderCreateInfo[] = []): ProviderCreateInfo[] =>
  Object.entries(MODEL_PROVIDER_NAMES).flatMap(([provider, label]) => {
    const info = metadata.find((entry) => entry.provider === provider);
    return info ? [{ ...info, provider_display_name: label }] : [];
  });
