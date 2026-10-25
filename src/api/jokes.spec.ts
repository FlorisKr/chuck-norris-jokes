import { http, HttpResponse } from "msw";

import { server } from "../mocks/server";
import { fetchRandomJokes } from "./jokes";

const RANDOM_JOKE_URL = "https://api.chucknorris.io/jokes/random";

function respondWithJokeIds(ids: string[]) {
  let request = 0;
  server.use(
    http.get(RANDOM_JOKE_URL, () => {
      const id = ids[request % ids.length];
      request += 1;
      return HttpResponse.json({ id, value: `Joke ${id}` });
    }),
  );
}

describe("fetchRandomJokes", () => {
  it("returns the requested number of unique jokes", async () => {
    respondWithJokeIds(["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"]);

    const jokes = await fetchRandomJokes(10);

    expect(jokes).toHaveLength(10);
    expect(new Set(jokes.map((joke) => joke.id)).size).toBe(10);
  });

  it("still returns unique jokes when the API repeats a joke", async () => {
    respondWithJokeIds(["a", "b", "a", "c", "d"]);

    const jokes = await fetchRandomJokes(3);

    expect(jokes.map((joke) => joke.id)).toEqual(["a", "b", "c"]);
  });

  it("fails when the API keeps returning the same joke", async () => {
    respondWithJokeIds(["same"]);

    const request = fetchRandomJokes(3);

    await expect(request).rejects.toThrow("Could not load 3 unique jokes");
  });

  it("fails as a whole when one request fails", async () => {
    let request = 0;
    server.use(
      http.get(RANDOM_JOKE_URL, () => {
        request += 1;
        return request === 2
          ? new HttpResponse(null, { status: 500 })
          : HttpResponse.json({ id: `joke-${request}`, value: `Joke ${request}` });
      }),
    );

    const result = fetchRandomJokes(3);

    await expect(result).rejects.toThrow(/500/);
  });
});
