import type { Joke } from "../../../schemas/joke";

/** Newest jokes go on top, so when the list is full the oldest arrival drops off the bottom. */
export function addJokeToJokeList(jokes: Joke[], joke: Joke, max: number): Joke[] {
  if (jokes.some((existing) => existing.id === joke.id)) {
    return jokes;
  }

  return [joke, ...jokes].slice(0, max);
}
