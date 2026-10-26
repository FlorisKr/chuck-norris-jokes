interface CountdownRingProps {
  durationMs: number;
}

/** Mounts together with the interval, so the ring and the timer start at the same moment. */
export function CountdownRing({ durationMs }: CountdownRingProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="size-5 -rotate-90 motion-reduce:hidden">
      <circle cx="10" cy="10" r="8" fill="none" strokeWidth="3" className="stroke-foreground/15" />
      <circle
        cx="10"
        cy="10"
        r="8"
        fill="none"
        strokeWidth="3"
        pathLength={1}
        strokeDasharray={1}
        className="animate-countdown stroke-secondary"
        style={{ animationDuration: `${durationMs}ms` }}
      />
    </svg>
  );
}
