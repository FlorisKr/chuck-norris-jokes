import { toast } from "sonner";

import type { Joke } from "../../schemas/joke";
import { addFavorite, MAX_FAVORITES, removeFavorite, useFavorites } from "../../stores/favorites";
import { HeartIcon } from "./heart-icon";

interface FavoriteButtonProps {
  joke: Joke;
}

export function FavoriteButton({ joke }: FavoriteButtonProps) {
  const favorites = useFavorites();
  const isFavorite = favorites.some(({ id }) => id === joke.id);
  // aria-disabled instead of disabled keeps the button clickable, so a click or tap can explain the limit
  const isDisabled = !isFavorite && favorites.length >= MAX_FAVORITES;

  return (
    <button
      type="button"
      aria-pressed={isFavorite}
      aria-disabled={isDisabled}
      onClick={() => {
        if (isDisabled) {
          toast(`You already have ${MAX_FAVORITES} favorites`, { id: "favorites-limit" });
        } else if (isFavorite) {
          removeFavorite(joke.id);
        } else {
          addFavorite(joke);
        }
      }}
      className="-m-2 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-foreground/60 hover:text-accent focus-visible:outline-2 focus-visible:outline-secondary aria-disabled:cursor-not-allowed aria-disabled:opacity-40 aria-disabled:hover:text-foreground/60 aria-pressed:text-accent"
    >
      <HeartIcon filled={isFavorite} />
      <span className="sr-only">Favorite</span>
    </button>
  );
}
