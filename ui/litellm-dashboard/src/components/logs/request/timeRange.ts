import moment from "moment";
import type { Locale } from "@/i18n/translate";

// Add this function to format the time range display
export const getTimeRangeDisplay = (
  isCustomDate: boolean,
  startTime: string,
  endTime: string,
  locale: Locale,
): string => {
  const dateTimeFormat = locale === "zh-CN" ? "M月D日 HH:mm" : "MMM D, h:mm A";
  const dateFormat = locale === "zh-CN" ? "M月D日" : "MMM D";
  if (isCustomDate) {
    return `${moment(startTime).format(dateTimeFormat)} - ${moment(endTime).format(dateTimeFormat)}`;
  }

  const now = moment();
  const start = moment(startTime);
  const diffMinutes = now.diff(start, "minutes");

  // Use exact ranges to prevent drift
  if (diffMinutes >= 0 && diffMinutes < 2) return "Last 1 Minute";
  if (diffMinutes >= 2 && diffMinutes < 16) return "Last 15 Minutes";
  if (diffMinutes >= 16 && diffMinutes < 61) return "Last Hour";

  const diffHours = now.diff(start, "hours");
  if (diffHours >= 1 && diffHours < 5) return "Last 4 Hours";
  if (diffHours >= 5 && diffHours < 25) return "Last 24 Hours";
  if (diffHours >= 25 && diffHours < 169) return "Last 7 Days";
  return `${start.format(dateFormat)} - ${now.format(dateFormat)}`;
};
