import * as Tooltip from "@radix-ui/react-tooltip";

import type { Joke } from "../../schemas/joke";
import { addFavorite, MAX_FAVORITES, removeFavorite, useFavorites } from "../../stores/favorites";
import { HeartIcon } from "./heart-icon";

interface FavoriteButtonProps {
  joke: Joke;
}

export function FavoriteButton({ joke }: FavoriteButtonProps) {
  const favorites = useFavorites();
  const isFavorite = favorites.some(({ id }) => id === joke.id);
  // aria-disabled instead of disabled keeps the button focusable, so its tooltip can explain why it does nothing
  const isDisabled = !isFavorite && favorites.length >= MAX_FAVORITES;

  const button = (
    <button
      type="button"
      aria-pressed={isFavorite}
      aria-disabled={isDisabled}
      onClick={() => {
        if (isFavorite) {
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

  // Radix closes a tooltip from its content, so a tooltip without content stays open and pops up at the limit
  if (!isDisabled) {
    return button;
  }

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{button}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="top"
          sideOffset={4}
          className="rounded-md border border-line bg-surface px-2 py-1 text-sm text-foreground shadow-md"
        >
          You already have {MAX_FAVORITES} favorites
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
