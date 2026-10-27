import { screen, within } from "@testing-library/react";
import { type UserEvent, userEvent } from "@testing-library/user-event";

import { buildJoke } from "../../mocks/jokes";
import type { Joke } from "../../schemas/joke";
import { FAVORITES_STORAGE_KEY } from "../../stores/favorites";
import { renderAppAt } from "../../tests/render";

function storeFavorites(favorites: Joke[]) {
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
}

function favoriteTexts() {
  return within(screen.getByRole("list", { name: "Favorites" }))
    .getAllByRole("listitem")
    .map((item) => within(item).getByRole("paragraph").textContent);
}

function favoriteButtonOf(jokeText: string) {
  const item = within(screen.getByRole("list", { name: "Favorites" }))
    .getAllByRole("listitem")
    .find((listItem) => within(listItem).queryByText(jokeText));
  if (!item) {
    throw new Error(`No favorite "${jokeText}" in the list`);
  }
  return within(item).getByRole("button", { name: "Favorite" });
}

describe("Given Favorites", () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe("when the user has no favorites", () => {
    beforeEach(async () => {
      renderAppAt("/favorites");
      await screen.findByText(/no favorites yet/i);
    });

    it("then explains how to add one", () => {
      expect(screen.getByText(/tap the heart on a joke to save it/i)).toBeInTheDocument();
    });

    describe("when the user clicks Browse jokes", () => {
      beforeEach(async () => {
        await user.click(screen.getByRole("link", { name: "Browse jokes" }));
      });

      it("then shows the jokes", async () => {
        expect(await screen.findByText("Joke 1")).toBeInTheDocument();
      });
    });
  });

  describe("when the user has favorites", () => {
    beforeEach(async () => {
      storeFavorites([buildJoke("a"), buildJoke("b"), buildJoke("c")]);
      renderAppAt("/favorites");
      await screen.findByText("Joke a");
    });

    it("then lists them in the saved order", () => {
      expect(favoriteTexts()).toEqual(["Joke a", "Joke b", "Joke c"]);
    });

    describe("when the user removes one", () => {
      beforeEach(async () => {
        await user.click(favoriteButtonOf("Joke b"));
      });

      it("then removes it from the list", () => {
        expect(favoriteTexts()).toEqual(["Joke a", "Joke c"]);
      });
    });
  });

  describe("when the user removes the last favorite", () => {
    beforeEach(async () => {
      storeFavorites([buildJoke("a")]);
      renderAppAt("/favorites");
      await user.click(await screen.findByRole("button", { name: "Favorite" }));
    });

    it("then shows the empty state", () => {
      expect(screen.getByText(/no favorites yet/i)).toBeInTheDocument();
    });
  });
});
