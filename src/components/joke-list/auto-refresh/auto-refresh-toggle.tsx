import { CountdownRing } from "./countdown-ring";
import { REFRESH_INTERVAL_MS } from "./use-auto-refresh";

interface AutoRefreshToggleProps {
  enabled: boolean;
  isRunning: boolean;
  onChange: (enabled: boolean) => void;
}

export function AutoRefreshToggle({ enabled, isRunning, onChange }: AutoRefreshToggleProps) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-3 self-start text-foreground">
      <input
        type="checkbox"
        role="switch"
        aria-checked={enabled}
        checked={enabled}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="relative h-6 w-11 shrink-0 rounded-full bg-foreground/60 peer-checked:bg-secondary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-secondary after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-surface after:shadow-sm peer-checked:after:translate-x-5 motion-safe:transition-colors motion-safe:after:transition-transform"
      />
      Auto-refresh: a new joke every {REFRESH_INTERVAL_MS / 1000} seconds
      {isRunning && <CountdownRing durationMs={REFRESH_INTERVAL_MS} />}
    </label>
  );
}
