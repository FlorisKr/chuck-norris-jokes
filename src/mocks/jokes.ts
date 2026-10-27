import type { Joke } from "../schemas/joke";

export function buildJoke(id: string): Joke {
  return { id, value: `Joke ${id}` };
}
