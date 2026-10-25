import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";

import { JOKE_COUNT, jokesQueryOptions } from "../../queries/jokes";
import { ErrorState } from "./error-state";
import { JokeCard } from "./joke-card";
import { JokeCardSkeleton } from "./joke-card-skeleton";

export function JokeList() {
  const { data: jokes, isError, refetch } = useQuery(jokesQueryOptions);
  const [isRetrying, setIsRetrying] = useState(false);
  // After a retry the "Try again" button disappears, so focus moves to the list instead of being lost
  const shouldFocusListRef = useRef(false);

  if (jokes) {
    return (
      <ul
        ref={(list) => {
          if (list && shouldFocusListRef.current) {
            shouldFocusListRef.current = false;
            list.focus();
          }
        }}
        aria-label="Jokes"
        tabIndex={-1}
        className="flex flex-col gap-3 focus:outline-none"
      >
        {jokes.map((joke) => (
          <li key={joke.id}>
            <JokeCard joke={joke} />
          </li>
        ))}
      </ul>
    );
  }

  if (isError || isRetrying) {
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

  return (
    <>
      <output className="sr-only">Loading jokes</output>
      <ul aria-hidden="true" className="flex flex-col gap-3">
        {Array.from({ length: JOKE_COUNT }, (_, index) => (
          <li key={index}>
            <JokeCardSkeleton />
          </li>
        ))}
      </ul>
    </>
  );
}
