import { translate, type Locale } from "@/i18n/translate";
import { formatExpiryDate, getDaysUntilExpiration } from "@/utils/licenseUtils";

const LICENSE_EXPIRY_PREFIX = "license_expiry:";

export interface DeploymentWarningContent {
  title: string;
  fix?: string;
}

const STATIC_CONTENT: Readonly<Record<string, DeploymentWarningContent>> = {
  env_credential_login: {
    title: "Environment-credential login is enabled",
    fix: "Environment credentials allow administrator sign-in with a shared secret. Create an administrator account with its own password, then set general_settings.disable_env_credential_login: true.",
  },
  no_redis: {
    title: "No Redis configured",
    fix: "Multiple workers require Redis to share rate limits, budgets, router state and cache invalidation. Without it, each worker enforces its own limits and spend can exceed the budget.",
  },
  detailed_debug: {
    title: "Detailed debug logging is on",
    fix: "Detailed debug logging records extensive diagnostic information and significantly slows the gateway. Enable it only while troubleshooting and turn it off in production.",
  },
};

const licenseTitle = (days: number): string => {
  if (days < 0) return "Your enterprise license expired on {date}";
  if (days === 0) return "Your enterprise license expires today ({date})";
  if (days === 1) return "Your enterprise license expires in 1 day ({date})";
  return "Your enterprise license expires in {days} days ({date})";
};

const licenseExpiryContent = (expirationDate: string, now: Date, locale: Locale): DeploymentWarningContent => {
  const days = getDaysUntilExpiration(expirationDate, now) ?? 0;
  const date = formatExpiryDate(expirationDate, locale === "zh-CN" ? "zh-CN" : "en-US");
  const title = licenseTitle(days);
  return {
    title: translate(title, locale, { date, days }),
    fix: translate(
      days < 0
        ? "Enterprise features are disabled. Contact your administrator to restore access."
        : "Contact your administrator to renew the license before it expires.",
      locale,
    ),
  };
};

export const deploymentWarningContent = (
  warningId: string,
  now: Date = new Date(),
  locale: Locale = "en",
): DeploymentWarningContent => {
  if (warningId.startsWith(LICENSE_EXPIRY_PREFIX)) {
    return licenseExpiryContent(warningId.slice(LICENSE_EXPIRY_PREFIX.length), now, locale);
  }
  const content = STATIC_CONTENT[warningId];
  if (!content) return { title: warningId };
  return {
    title: translate(content.title, locale),
    fix: content.fix ? translate(content.fix, locale) : undefined,
  };
};
