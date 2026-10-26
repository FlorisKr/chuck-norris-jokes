import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { fetchOneUniqueJoke } from "../../../api/jokes";
import { JOKE_COUNT, jokesQueryOptions } from "../../../queries/jokes";
import { addJokeToJokeList } from "./add-joke-to-joke-list";

export const REFRESH_INTERVAL_MS = 5000;

/** While enabled, adds a new joke to the cached joke list every `REFRESH_INTERVAL_MS`. */
export function useAutoRefresh(enabled: boolean) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const controller = new AbortController();
    // Skips a refresh while the previous one is still loading, which can happen on a slow connection
    let isBusy = false;

    async function addNewJoke() {
      const jokes = queryClient.getQueryData(jokesQueryOptions.queryKey);
      if (!jokes) {
        return;
      }

      const joke = await fetchOneUniqueJoke(new Set(jokes.map(({ id }) => id)), controller.signal);
      if (joke && !controller.signal.aborted) {
        queryClient.setQueryData(jokesQueryOptions.queryKey, (current) =>
          current ? addJokeToJokeList(current, joke, JOKE_COUNT) : current,
        );
      }
    }

    const intervalId = setInterval(() => {
      if (isBusy) {
        return;
      }
      isBusy = true;
      void addNewJoke()
        .catch(() => undefined)
        .finally(() => {
          isBusy = false;
        });
    }, REFRESH_INTERVAL_MS);

    return () => {
      controller.abort();
      clearInterval(intervalId);
    };
  }, [enabled, queryClient]);
}
