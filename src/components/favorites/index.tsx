import { useFavorites } from "../../stores/favorites";
import { JokeCard } from "../shared/joke-card";
import { Notice } from "../shared/notice";

export function Favorites() {
  const favorites = useFavorites();

  if (favorites.length === 0) {
    return (
      <Notice linkText="Browse jokes">
        <p className="text-foreground">No favorites yet. Tap the heart on a joke to save it.</p>
      </Notice>
    );
  }

  return (
    <ul aria-label="Favorites" className="flex flex-col gap-3">
      {favorites.map((joke) => (
        <li key={joke.id}>
          <JokeCard joke={joke} />
        </li>
      ))}
    </ul>
  );
}
