import messages from "./zh-CN.json";

export type Locale = "zh-CN" | "en";
const chinese: ReadonlyMap<string, string> = new Map(Object.entries(messages));

export function translate(
  message: string,
  locale: Locale,
  values: Readonly<Record<string, string | number>> = {},
): string {
  const text = message.trim().replace(/\s+/g, " ");
  const translated = locale === "zh-CN" ? chinese.get(text) : undefined;
  const result = translated === undefined ? message : message.replace(message.trim(), translated);
  return result.replace(/\{(\w+)\}/g, (placeholder: string, key: string) =>
    values[key] === undefined ? placeholder : String(values[key]),
  );
}
