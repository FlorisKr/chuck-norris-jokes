import { http, HttpResponse } from "msw";

import { buildJoke } from "../mocks/jokes";
import { server } from "../mocks/server";
import { fetchOneUniqueJoke, fetchRandomJoke, fetchRandomJokes, RANDOM_JOKE_URL } from "./jokes";

function respondWithJokeIds(ids: string[]) {
  let request = 0;
  server.use(
    http.get(RANDOM_JOKE_URL, () => {
      const id = ids[request % ids.length];
      request += 1;
      return HttpResponse.json(buildJoke(id));
    }),
  );
}

function respondWithNetworkError() {
  server.use(http.get(RANDOM_JOKE_URL, () => HttpResponse.error()));
}

function respondWithMalformedJoke() {
  server.use(http.get(RANDOM_JOKE_URL, () => HttpResponse.json({ joke: "No id or value" })));
}

describe("Given fetchRandomJoke", () => {
  describe("when the API returns an unexpected response", () => {
    it("then fails with an unexpected response error", async () => {
      respondWithMalformedJoke();

      const result = fetchRandomJoke();

      await expect(result).rejects.toThrow("API returned an unexpected response");
    });
  });

  describe("when the network is down", () => {
    it("then fails with a network error", async () => {
      respondWithNetworkError();

      const result = fetchRandomJoke();

      await expect(result).rejects.toThrow(TypeError);
    });
  });
});

describe("Given fetchRandomJokes", () => {
  describe("when the API returns different jokes", () => {
    it("then returns the requested number of unique jokes", async () => {
      const jokes = await fetchRandomJokes(10);

      expect(jokes).toHaveLength(10);
      expect(new Set(jokes.map((joke) => joke.id)).size).toBe(10);
    });
  });

  describe("when the API repeats a joke", () => {
    it("then still returns unique jokes", async () => {
      respondWithJokeIds(["a", "b", "a", "c", "d"]);

      const jokes = await fetchRandomJokes(3);

      expect(jokes.map((joke) => joke.id)).toEqual(["a", "b", "c"]);
    });
  });

  describe("when the API keeps returning the same joke", () => {
    it("then fails", async () => {
      respondWithJokeIds(["same"]);

      const request = fetchRandomJokes(3);

      await expect(request).rejects.toThrow("Could not load 3 unique jokes");
    });
  });

  describe("when one request fails", () => {
    it("then fails as a whole", async () => {
      let request = 0;
      server.use(
        http.get(RANDOM_JOKE_URL, () => {
          request += 1;
          return request === 2
            ? new HttpResponse(null, { status: 500 })
            : HttpResponse.json(buildJoke(String(request)));
        }),
      );

      const result = fetchRandomJokes(3);

      await expect(result).rejects.toThrow(/500/);
    });
  });
});

describe("Given fetchOneUniqueJoke", () => {
  describe("when the API returns a joke that isn't excluded", () => {
    it("then returns it", async () => {
      respondWithJokeIds(["a"]);

      const joke = await fetchOneUniqueJoke(new Set(["b", "c"]));

      expect(joke?.id).toBe("a");
    });
  });

  describe("when the API first returns an excluded joke", () => {
    it("then tries again until it finds one that isn't excluded", async () => {
      respondWithJokeIds(["a", "a", "b"]);

      const joke = await fetchOneUniqueJoke(new Set(["a"]));

      expect(joke?.id).toBe("b");
    });
  });

  describe("when every attempt returns an excluded joke", () => {
    it("then returns null", async () => {
      respondWithJokeIds(["a", "a", "a", "b"]);

      const joke = await fetchOneUniqueJoke(new Set(["a"]));

      expect(joke).toBeNull();
    });
  });
});
