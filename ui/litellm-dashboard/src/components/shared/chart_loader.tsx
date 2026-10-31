import { LocalizedText as L } from "@/contexts/LocaleContext";

import React from "react";
import { UiLoadingSpinner } from "../ui/ui-loading-spinner";

interface ChartLoaderProps {
  isDateChanging?: boolean;
}

export const ChartLoader: React.FC<ChartLoaderProps> = ({ isDateChanging = false }) => (
  <div className="flex items-center justify-center h-40">
    <div className="flex items-center justify-center gap-3">
      <UiLoadingSpinner className="size-5" />
      <div className="flex flex-col">
        <span className="text-muted-foreground text-sm font-medium">
          <L>{isDateChanging ? "Processing date selection..." : "Loading chart data..."}</L>
        </span>
        <span className="text-muted-foreground text-xs mt-1">
          <L>{isDateChanging ? "This will only take a moment" : "Fetching your data"}</L>
        </span>
      </div>
    </div>
  </div>
);

export default ChartLoader;
