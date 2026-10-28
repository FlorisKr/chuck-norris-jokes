import { useSyncExternalStore } from "react";

import { type Favorites, FavoritesSchema } from "../schemas/favorites";
import type { Joke } from "../schemas/joke";
import { createLocalStorageStore } from "./create-local-storage-store";

export const FAVORITES_STORAGE_KEY = "favorites";
export const MAX_FAVORITES = 10;

const favoritesStore = createLocalStorageStore<Favorites>(
  FAVORITES_STORAGE_KEY,
  FavoritesSchema,
  [],
);

export function useFavorites(): Favorites {
  return useSyncExternalStore(favoritesStore.subscribe, favoritesStore.get);
}

export function addFavorite(joke: Joke) {
  const favorites = favoritesStore.get();
  if (favorites.length >= MAX_FAVORITES) {
    return;
  }
  favoritesStore.set([joke, ...favorites]);
}

export function removeFavorite(id: string) {
  favoritesStore.set(favoritesStore.get().filter((favorite) => favorite.id !== id));
}
