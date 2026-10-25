import type { Joke } from "../../schemas/joke";

interface JokeCardProps {
  joke: Joke;
}

export function JokeCard({ joke }: JokeCardProps) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="text-foreground">{joke.value}</p>
    </div>
  );
}
