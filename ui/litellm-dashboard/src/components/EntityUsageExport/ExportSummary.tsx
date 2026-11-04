import { useLocale, useTranslation } from "@/contexts/LocaleContext";
import React from "react";
import type { DateRangePickerValue } from "@/components/shared/date_picker_types";

interface ExportSummaryProps {
  dateRange: DateRangePickerValue;
  selectedFilters: readonly string[];
}

const ExportSummary: React.FC<ExportSummaryProps> = ({ dateRange, selectedFilters }) => {
  const { locale } = useLocale();
  const t = useTranslation();
  const dateLocale = locale === "en" ? "en-US" : locale;
  return (
    <div className="text-sm text-muted-foreground">
      {dateRange.from?.toLocaleDateString(dateLocale)} - {dateRange.to?.toLocaleDateString(dateLocale)}
      {selectedFilters.length > 0 &&
        ` · ${t(selectedFilters.length === 1 ? "{count} filter" : "{count} filters", { count: selectedFilters.length })}`}
    </div>
  );
};

export default ExportSummary;
