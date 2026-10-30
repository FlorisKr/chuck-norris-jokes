import { ErrorState } from "../shared/error-state";

export function RouteError() {
  return (
    <ErrorState
      message="Something went wrong. Try again or come back later."
      isRetrying={false}
      onRetry={() => window.location.reload()}
    />
  );
}
