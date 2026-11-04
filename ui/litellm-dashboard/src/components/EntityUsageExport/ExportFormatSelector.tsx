import { LocalizedText as L } from "@/contexts/LocaleContext";
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ExportFormat } from "./types";

interface ExportFormatSelectorProps {
  value: ExportFormat;
  onChange: (value: ExportFormat) => void;
}

const FORMAT_LABELS: Record<ExportFormat, string> = {
  csv: "CSV (Excel, Google Sheets)",
  json: "JSON (includes metadata)",
};

const ExportFormatSelector: React.FC<ExportFormatSelectorProps> = ({ value, onChange }) => {
  return (
    <div>
      <label className="text-sm font-medium text-foreground block mb-2">
        <L>Format</L>
      </label>
      <Select value={value} onValueChange={(next: ExportFormat | null) => next && onChange(next)}>
        <SelectTrigger className="w-full">
          <SelectValue>
            <L>{FORMAT_LABELS[value]}</L>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(FORMAT_LABELS) as ExportFormat[]).map((format) => (
            <SelectItem key={format} value={format}>
              <L>{FORMAT_LABELS[format]}</L>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ExportFormatSelector;
