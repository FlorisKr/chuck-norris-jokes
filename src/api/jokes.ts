import { type Joke, JokeSchema } from "../schemas/joke";

const RANDOM_JOKE_URL = "https://api.chucknorris.io/jokes/random";
const SPARE_JOKES = 2;

export async function fetchRandomJoke(signal?: AbortSignal): Promise<Joke> {
  const response = await fetch(RANDOM_JOKE_URL, { signal });

  if (!response.ok) {
    throw new Error(`API responded with status ${response.status}`);
  }

  const result = JokeSchema.safeParse(await response.json());

  if (!result.success) {
    throw new Error("API returned an unexpected response", { cause: result.error });
  }

  return result.data;
}

/**
 * Fetches `count` unique jokes. The API only returns one random joke per request,
 * so all requests run in parallel. A couple of spare jokes absorb duplicates, which has a small chance.
 * Fails as a whole if any request fails.
 */
export async function fetchRandomJokes(count: number, signal?: AbortSignal): Promise<Joke[]> {
  const jokes = await Promise.all(
    Array.from({ length: count + SPARE_JOKES }, () => fetchRandomJoke(signal)),
  );
  const uniqueJokes = [...new Map(jokes.map((joke) => [joke.id, joke])).values()];

  if (uniqueJokes.length < count) {
    throw new Error(`Could not load ${count} unique jokes`);
  }

  return uniqueJokes.slice(0, count);
}
