export function JokeCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-4">
      <div className="h-4 w-11/12 rounded bg-line motion-safe:animate-pulse" />
      <div className="h-4 w-2/3 rounded bg-line motion-safe:animate-pulse" />
    </div>
  );
}
