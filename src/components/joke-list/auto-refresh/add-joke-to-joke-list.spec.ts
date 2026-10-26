import type { Joke } from "../../../schemas/joke";
import { addJokeToJokeList } from "./add-joke-to-joke-list";

function makeJoke(id: string): Joke {
  return { id, value: `Joke ${id}` };
}

function ids(jokes: Joke[]): string[] {
  return jokes.map((joke) => joke.id);
}

describe("addJokeToJokeList", () => {
  it("adds the new joke on top when the list isn't full", () => {
    const jokes = [makeJoke("b"), makeJoke("c")];

    const result = addJokeToJokeList(jokes, makeJoke("a"), 3);

    expect(ids(result)).toEqual(["a", "b", "c"]);
  });

  it("drops the oldest joke when the list is full", () => {
    const jokes = [makeJoke("b"), makeJoke("c"), makeJoke("d")];

    const result = addJokeToJokeList(jokes, makeJoke("a"), 3);

    expect(ids(result)).toEqual(["a", "b", "c"]);
  });

  it("ignores a joke that is already in the list", () => {
    const jokes = [makeJoke("a"), makeJoke("b"), makeJoke("c")];

    const result = addJokeToJokeList(jokes, makeJoke("b"), 3);

    expect(ids(result)).toEqual(["a", "b", "c"]);
  });

  it("doesn't change the original list", () => {
    const jokes = [makeJoke("b"), makeJoke("c"), makeJoke("d")];

    addJokeToJokeList(jokes, makeJoke("a"), 3);

    expect(ids(jokes)).toEqual(["b", "c", "d"]);
  });
});
