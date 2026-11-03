import { getLocale } from "@/contexts/LocaleContext";
import { translate, type Locale } from "@/i18n/translate";

const SYSTEM_NAMES: ReadonlyMap<string, string> = new Map([
  ["litellm-internal-health-check", "System health check"],
  ["key-hash-litellm-internal-health-check", "System health check"],
  ["litellm_proxy_master_key", "Gateway master key"],
  ["key-hash-litellm_proxy_master_key", "Gateway master key"],
  ["litellm-dashboard", "Console team"],
]);

export function systemResourceLabel(value: string, locale: Locale = getLocale()): string {
  const label = SYSTEM_NAMES.get(value);
  return label ? translate(label, locale) : value;
}
