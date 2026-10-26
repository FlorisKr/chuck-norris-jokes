import type { Ref } from "react";

import type { Joke } from "../../schemas/joke";
import { JokeCard } from "./joke-card";

interface JokeCardListProps {
  jokes: Joke[];
  ref?: Ref<HTMLUListElement>;
}

export function JokeCardList({ jokes, ref }: JokeCardListProps) {
  return (
    <ul
      ref={ref}
      aria-label="Jokes"
      tabIndex={-1}
      className="flex flex-col gap-3 focus:outline-none"
    >
      {jokes.map((joke) => (
        <li key={joke.id}>
          <JokeCard joke={joke} />
        </li>
      ))}
    </ul>
  );
}
