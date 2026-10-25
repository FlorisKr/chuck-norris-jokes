interface ErrorStateProps {
  message: string;
  isRetrying: boolean;
  onRetry: () => void;
}

export function ErrorState({ message, isRetrying, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-2 rounded-xl border border-line bg-surface p-4"
    >
      <p className="text-foreground">{message}</p>
      <button
        type="button"
        aria-disabled={isRetrying}
        onClick={() => {
          if (!isRetrying) {
            onRetry();
          }
        }}
        className="rounded font-semibold text-secondary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary aria-disabled:cursor-wait aria-disabled:no-underline"
      >
        {isRetrying ? "Trying again…" : "Try again"}
      </button>
    </div>
  );
}
