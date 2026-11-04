import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/zh-cn";
import utc from "dayjs/plugin/utc";

import type { Locale } from "@/i18n/translate";
import { translate } from "@/i18n/translate";

dayjs.extend(utc);

const dayjsLocale = (locale: Locale): string => (locale === "zh-CN" ? "zh-cn" : "en");
const tr = (message: string, locale: Locale, values?: Readonly<Record<string, string | number>>): string =>
  translate(message, locale, values);

export function formatBudgetReset(iso: string | null | undefined, locale: Locale = "en"): string | null {
  if (!iso) return null;
  const resetDate = dayjs(iso);
  if (!resetDate.isValid()) return null;
  return resetDate.locale(dayjsLocale(locale)).format("MMM D, YYYY");
}

export function formatBudgetResetUtc(iso: string | null | undefined, locale: Locale = "en"): string | null {
  if (!iso) return null;
  const resetDate = dayjs.utc(iso);
  if (!resetDate.isValid()) return null;
  return resetDate.locale(dayjsLocale(locale)).format("MMM D, YYYY");
}

export interface BudgetResetSchedule {
  label: string;
  resetAt: string | null;
  period: string | null;
  tooltip: string;
}

const ROLLOVER_NOTE = "Spend above a rollover cap at reset carries into the next period.";

const DURATION_WORD_ALIASES: Record<string, string> = {
  hourly: "1h",
  daily: "24h",
  weekly: "7d",
  monthly: "30d",
};

const DURATION_PATTERN = /^(\d+)(mo|[smhdw])$/;

// Mirrors the proxy's get_budget_window_start: "30d" and "Nmo" span calendar months,
// everything else is a fixed length, and an unrecognised duration resets at the next midnight.
export function getBudgetPeriodStart(budgetDuration: string, resetAt: Dayjs): Dayjs {
  const trimmed = budgetDuration.trim();
  const normalized = DURATION_WORD_ALIASES[trimmed.toLowerCase()] ?? trimmed;
  const match = DURATION_PATTERN.exec(normalized);
  if (!match) return resetAt.subtract(1, "day");
  const value = Number(match[1]);
  switch (match[2]) {
    case "mo":
      return resetAt.subtract(value, "month");
    case "d":
      return value === 30 ? resetAt.subtract(1, "month") : resetAt.subtract(value, "day");
    case "w":
      return resetAt.subtract(value, "week");
    case "h":
      return resetAt.subtract(value, "hour");
    case "m":
      return resetAt.subtract(value, "minute");
    default:
      return resetAt.subtract(value, "second");
  }
}

export function formatBudgetPeriod(start: Dayjs, end: Dayjs, locale: Locale = "en"): string {
  const dayjsLc = dayjsLocale(locale);
  const windowSeconds = end.diff(start, "second");
  if (windowSeconds < 24 * 60 * 60) {
    const time = windowSeconds < 60 ? "HH:mm:ss" : "HH:mm";
    const endFormat = start.isSame(end, "day") ? time : `MMM D, YYYY ${time}`;
    return `${start.locale(dayjsLc).format(`MMM D, YYYY ${time}`)} - ${end.locale(dayjsLc).format(endFormat)}`;
  }
  if (start.isSame(end, "year"))
    return `${start.locale(dayjsLc).format("MMM D")} - ${end.locale(dayjsLc).format("MMM D, YYYY")}`;
  return `${start.locale(dayjsLc).format("MMM D, YYYY")} - ${end.locale(dayjsLc).format("MMM D, YYYY")}`;
}

export function describeBudgetResetSchedule(
  budgetDuration: string | null | undefined,
  budgetResetAt: string | null | undefined,
  locale: Locale = "en",
): BudgetResetSchedule {
  const resetDate = budgetResetAt ? dayjs(budgetResetAt) : null;
  if (resetDate?.isValid()) {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const label = resetDate.locale(dayjsLocale(locale)).format("MMM D, YYYY HH:mm");
    const period = budgetDuration
      ? formatBudgetPeriod(getBudgetPeriodStart(budgetDuration, resetDate.utc()).local(), resetDate, locale)
      : null;
    const coverage = period
      ? tr("Current Period Spend covers {period} and resets every {duration}.", locale, {
          period,
          duration: String(budgetDuration),
        })
      : tr("Current Period Spend resets on a schedule.", locale);
    return {
      label,
      resetAt: resetDate.toISOString(),
      period,
      tooltip: `${coverage} ${tr("Next reset {label} ({timeZone}). {note}", locale, {
        label,
        timeZone,
        note: tr(ROLLOVER_NOTE, locale),
      })}`,
    };
  }
  if (!budgetDuration) {
    return {
      label: tr("Never resets", locale),
      resetAt: null,
      period: null,
      tooltip: tr(
        "This budget has no reset window, so this is lifetime spend for as long as the membership exists.",
        locale,
      ),
    };
  }
  return {
    label: tr("Unknown", locale),
    resetAt: null,
    period: null,
    tooltip: `${tr("Resets every {duration}, but the next reset time has not been scheduled yet.", locale, {
      duration: budgetDuration,
    })} ${tr(ROLLOVER_NOTE, locale)}`,
  };
}

const BUDGET_DURATION_WORD_ALIASES: Record<string, string> = {
  hourly: "1h",
  daily: "24h",
  weekly: "7d",
  monthly: "30d",
};

const BUDGET_DURATION_UNITS: Record<string, dayjs.ManipulateType> = {
  s: "second",
  m: "minute",
  h: "hour",
  d: "day",
  w: "week",
  mo: "month",
};

export interface BudgetPeriod {
  start: string;
  end: string;
}

/** Mirrors the proxy's get_budget_window_start: `30d` and `Nmo` span calendar months, the rest are fixed deltas. */
export function budgetPeriodRange(
  budgetDuration: string | null | undefined,
  budgetResetAt: string | null | undefined,
): BudgetPeriod | null {
  if (!budgetDuration || !budgetResetAt) return null;
  const end = dayjs.utc(budgetResetAt);
  if (!end.isValid()) return null;
  const normalized = budgetDuration.trim().toLowerCase();
  const match = /^(\d+)(mo|s|m|h|d|w)$/.exec(BUDGET_DURATION_WORD_ALIASES[normalized] ?? normalized);
  if (!match) return null;
  const amount = Number(match[1]);
  if (amount <= 0) return null;
  const start =
    match[2] === "d" && amount === 30
      ? end.subtract(1, "month")
      : end.subtract(amount, BUDGET_DURATION_UNITS[match[2]]);
  return { start: start.toISOString(), end: end.toISOString() };
}
