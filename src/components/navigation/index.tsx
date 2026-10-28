import { Link } from "@tanstack/react-router";

import { useFavorites } from "../../stores/favorites";

const LINK_CLASS_NAME =
  "rounded-full px-4 py-2 font-semibold text-foreground hover:bg-surface focus-visible:outline-2 focus-visible:outline-secondary aria-[current=page]:bg-surface aria-[current=page]:text-secondary";

export function Navigation() {
  const favorites = useFavorites();

  return (
    <nav aria-label="Main">
      <ul className="flex gap-2">
        <li>
          <Link to="/" className={LINK_CLASS_NAME}>
            Jokes
          </Link>
        </li>
        <li>
          <Link to="/favorites" className={LINK_CLASS_NAME}>
            Favorites ({favorites.length})
          </Link>
        </li>
      </ul>
    </nav>
  );
}
