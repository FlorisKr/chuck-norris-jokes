import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";

import { jokesQueryOptions } from "../../queries/jokes";
import { ErrorState } from "../shared/error-state";
import { AutoRefresh } from "./auto-refresh";
import { JokeCardList } from "./joke-card-list";
import { JokeListSkeleton } from "./joke-list-skeleton";

export function JokeList() {
  const { data: jokes, isError, refetch } = useQuery(jokesQueryOptions);
  const [isRetrying, setIsRetrying] = useState(false);
  // After a retry the "Try again" button disappears, so focus moves to the list instead of being lost
  const shouldFocusListRef = useRef(false);

  if (!jokes && (isError || isRetrying)) {
    return (
      <ErrorState
        message="Couldn't load jokes. Check your connection and try again."
        isRetrying={isRetrying}
        onRetry={() => {
          setIsRetrying(true);
          shouldFocusListRef.current = true;
          void refetch().finally(() => setIsRetrying(false));
        }}
      />
    );
  }

  if (!jokes) {
    return <JokeListSkeleton />;
  }

  return (
    <div className="flex flex-col gap-4">
      <AutoRefresh />
      <JokeCardList
        jokes={jokes}
        ref={(list) => {
          if (list && shouldFocusListRef.current) {
            shouldFocusListRef.current = false;
            list.focus();
          }
        }}
      />
    </div>
  );
}
