import { useState } from "react";

import { AutoRefreshToggle } from "./auto-refresh-toggle";
import { useAutoRefresh } from "./use-auto-refresh";
import { useIsPageVisible } from "./use-is-page-visible";

export function AutoRefresh() {
  const [isEnabled, setIsEnabled] = useState(false);
  const isPageVisible = useIsPageVisible();
  const isRunning = isEnabled && isPageVisible;
  useAutoRefresh(isRunning);

  return <AutoRefreshToggle enabled={isEnabled} isRunning={isRunning} onChange={setIsEnabled} />;
}
