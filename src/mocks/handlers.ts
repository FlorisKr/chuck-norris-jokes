import { http, HttpResponse } from "msw";

import { RANDOM_JOKE_URL } from "../api/jokes";
import { buildJoke } from "./jokes";

let jokeRequests = 0;

/** The happy path: every request gets a new joke ("Joke 1", "Joke 2", …). */
export const handlers = [
  http.get(RANDOM_JOKE_URL, () => {
    jokeRequests += 1;
    return HttpResponse.json(buildJoke(String(jokeRequests)));
  }),
];

export function countOfJokeRequests() {
  return jokeRequests;
}

export function resetJokeRequests() {
  jokeRequests = 0;
}
