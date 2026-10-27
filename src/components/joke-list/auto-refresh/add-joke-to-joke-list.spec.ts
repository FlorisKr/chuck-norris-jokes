import { buildJoke } from "../../../mocks/jokes";
import type { Joke } from "../../../schemas/joke";
import { addJokeToJokeList } from "./add-joke-to-joke-list";

function ids(jokes: Joke[]): string[] {
  return jokes.map((joke) => joke.id);
}

describe("addJokeToJokeList", () => {
  it("adds the new joke on top when the list isn't full", () => {
    const jokes = [buildJoke("b"), buildJoke("c")];

    const result = addJokeToJokeList(jokes, buildJoke("a"), 3);

    expect(ids(result)).toEqual(["a", "b", "c"]);
  });

  it("drops the oldest joke when the list is full", () => {
    const jokes = [buildJoke("b"), buildJoke("c"), buildJoke("d")];

    const result = addJokeToJokeList(jokes, buildJoke("a"), 3);

    expect(ids(result)).toEqual(["a", "b", "c"]);
  });

  it("ignores a joke that is already in the list", () => {
    const jokes = [buildJoke("a"), buildJoke("b"), buildJoke("c")];

    const result = addJokeToJokeList(jokes, buildJoke("b"), 3);

    expect(ids(result)).toEqual(["a", "b", "c"]);
  });

  it("doesn't change the original list", () => {
    const jokes = [buildJoke("b"), buildJoke("c"), buildJoke("d")];

    addJokeToJokeList(jokes, buildJoke("a"), 3);

    expect(ids(jokes)).toEqual(["b", "c", "d"]);
  });
});
