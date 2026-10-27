import { type Joke, JokeSchema } from "../schemas/joke";

export const RANDOM_JOKE_URL = "https://api.chucknorris.io/jokes/random";
const MAX_FETCH_ATTEMPTS = 3;

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

function fetchJokes(amount: number, signal?: AbortSignal): Promise<Joke[]> {
  return Promise.all(Array.from({ length: amount }, () => fetchRandomJoke(signal)));
}

function uniqueById(jokes: Joke[]): Joke[] {
  return [...new Map(jokes.map((joke) => [joke.id, joke])).values()];
}

/**
 * Fetches `count` unique jokes. The API only returns one random joke per request,
 * so all requests run in parallel. Duplicates could happen, so missing jokes are fetched once more to top up so no more duplicates exist.
 * Fails as a whole if any request fails.
 */
export async function fetchRandomJokes(count: number, signal?: AbortSignal): Promise<Joke[]> {
  let jokes = uniqueById(await fetchJokes(count, signal));

  if (jokes.length < count) {
    jokes = uniqueById([...jokes, ...(await fetchJokes(count - jokes.length, signal))]);
  }

  if (jokes.length < count) {
    throw new Error(`Could not load ${count} unique jokes`);
  }

  return jokes;
}

/** Returns a joke that is not in `excludedIds` or `null` after `MAX_FETCH_ATTEMPTS` duplicates. */
export async function fetchOneUniqueJoke(
  excludedIds: ReadonlySet<string>,
  signal?: AbortSignal,
): Promise<Joke | null> {
  for (let attempt = 1; attempt <= MAX_FETCH_ATTEMPTS; attempt += 1) {
    const joke = await fetchRandomJoke(signal);
    if (!excludedIds.has(joke.id)) {
      return joke;
    }
  }

  return null;
}
