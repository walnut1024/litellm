import { usePathname } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { useCallback, useEffect } from "react";
import { recordUiEvent } from "@/lib/telemetry/uiEvents";
import { routeSegmentForPathname } from "@/utils/uiHref";
import { useLiteUi } from "@/contexts/LiteUiContext";
import { liteTabAllowed } from "@/utils/liteUi";

export function useUrlTab<T extends string>(values: readonly T[], fallback: T, key = "tab"): [T, (tab: T) => void] {
  const [urlTab, setUrlTab] = useQueryState(key, parseAsString.withDefault(fallback));
  const page = routeSegmentForPathname(usePathname() ?? "") || "home";
  const lite = useLiteUi();
  const tab =
    values.find((value) => value === urlTab && (!lite || liteTabAllowed(lite.route, value, lite.admin))) ?? fallback;
  useEffect(() => {
    if (urlTab !== tab) void setUrlTab(null);
  }, [urlTab, tab, setUrlTab]);
  const setTab = useCallback(
    (next: T) => {
      void recordUiEvent({ page, action: "click", target: `${key}=${next}` });
      void setUrlTab(next);
    },
    [page, key, setUrlTab],
  );
  return [tab, setTab];
}
