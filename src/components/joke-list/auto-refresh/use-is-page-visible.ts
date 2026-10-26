import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

function getIsPageVisible() {
  return document.visibilityState === "visible";
}

/** False while the tab is in the background or the window is minimised. */
export function useIsPageVisible() {
  return useSyncExternalStore(subscribe, getIsPageVisible);
}
