import { queryOptions } from "@tanstack/react-query";

import { fetchRandomJokes } from "../api/jokes";

export const JOKE_COUNT = 10;

export const jokesQueryOptions = queryOptions({
  queryKey: ["jokes"],
  queryFn: ({ signal }) => fetchRandomJokes(JOKE_COUNT, signal),
  staleTime: "static",
  gcTime: Infinity,
});
