import type { Joke } from "../../../schemas/joke";
import { FavoriteButton } from "./favorite-button";

interface JokeCardProps {
  joke: Joke;
}

export function JokeCard({ joke }: JokeCardProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-line bg-surface p-4">
      <p className="flex-1 text-foreground">{joke.value}</p>
      <FavoriteButton joke={joke} />
    </div>
  );
}
