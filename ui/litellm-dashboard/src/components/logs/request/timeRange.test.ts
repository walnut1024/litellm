import moment from "moment";
import { describe, expect, it } from "vitest";
import { getTimeRangeDisplay } from "./timeRange";

// startTime built relative to "now"; getTimeRangeDisplay computes now() internally.
const ago = (amount: number, unit: moment.unitOfTime.DurationConstructor) =>
  moment().subtract(amount, unit).toISOString();

describe("getTimeRangeDisplay", () => {
  it("uses Chinese dates without changing the selected times", () => {
    expect(getTimeRangeDisplay(true, "2025-01-02T03:04:00", "2025-01-05T06:07:00", "zh-CN")).toBe(
      "1月2日 03:04 - 1月5日 06:07",
    );
  });
  it("labels a ~1-minute window as 'Last 1 Minute'", () => {
    expect(getTimeRangeDisplay(false, ago(1, "minutes"), "", "en")).toBe("Last 1 Minute");
  });

  it("labels a ~10-minute window as 'Last 15 Minutes'", () => {
    expect(getTimeRangeDisplay(false, ago(10, "minutes"), "", "en")).toBe("Last 15 Minutes");
  });

  it("labels a ~30-minute window as 'Last Hour'", () => {
    expect(getTimeRangeDisplay(false, ago(30, "minutes"), "", "en")).toBe("Last Hour");
  });

  it("labels a ~2-hour window as 'Last 4 Hours'", () => {
    expect(getTimeRangeDisplay(false, ago(2, "hours"), "", "en")).toBe("Last 4 Hours");
  });

  it("labels a ~10-hour window as 'Last 24 Hours'", () => {
    expect(getTimeRangeDisplay(false, ago(10, "hours"), "", "en")).toBe("Last 24 Hours");
  });

  it("labels a ~3-day window as 'Last 7 Days'", () => {
    expect(getTimeRangeDisplay(false, ago(3, "days"), "", "en")).toBe("Last 7 Days");
  });

  it("falls back to a 'MMM D - MMM D' range beyond 7 days", () => {
    const label = getTimeRangeDisplay(false, ago(30, "days"), "", "en");
    expect(label).toMatch(/^[A-Z][a-z]{2} \d{1,2} - [A-Z][a-z]{2} \d{1,2}$/);
  });

  it("renders an explicit start - end range when isCustomDate is true", () => {
    const start = "2025-01-02T03:04:00Z";
    const end = "2025-01-05T06:07:00Z";
    const expected = `${moment(start).format("MMM D, h:mm A")} - ${moment(end).format("MMM D, h:mm A")}`;
    expect(getTimeRangeDisplay(true, start, end, "en")).toBe(expected);
  });
});
