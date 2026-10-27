import { screen, within } from "@testing-library/react";
import { type UserEvent, userEvent } from "@testing-library/user-event";

import { buildJoke } from "../../mocks/jokes";
import { FAVORITES_STORAGE_KEY } from "../../stores/favorites";
import { renderAppAt } from "../../tests/render";

function navigationLink(name: RegExp) {
  return within(screen.getByRole("navigation", { name: "Main" })).getByRole("link", { name });
}

describe("Given Navigation", () => {
  describe("when the user opens the jokes page", () => {
    let user: UserEvent;

    beforeEach(async () => {
      user = userEvent.setup();
      renderAppAt("/");
      await screen.findByText("Joke 1");
    });

    it("then marks Jokes as the current page", () => {
      expect(navigationLink(/jokes/i)).toHaveAttribute("aria-current", "page");
    });

    it("then shows no favorites in the count", () => {
      expect(navigationLink(/favorites/i)).toHaveTextContent("Favorites (0)");
    });

    describe("when the user favorites a joke", () => {
      beforeEach(async () => {
        await user.click(screen.getAllByRole("button", { name: "Favorite" })[0]);
      });

      it("then counts it", () => {
        expect(navigationLink(/favorites/i)).toHaveTextContent("Favorites (1)");
      });
    });

    describe("when the user goes to the favorites", () => {
      beforeEach(async () => {
        await user.click(navigationLink(/favorites/i));
        await screen.findByText(/no favorites yet/i);
      });

      it("then no longer marks Jokes as the current page", () => {
        expect(navigationLink(/jokes/i)).not.toHaveAttribute("aria-current");
      });
    });
  });

  describe("when favorites were saved earlier", () => {
    beforeEach(async () => {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([buildJoke("a"), buildJoke("b")]));
      renderAppAt("/favorites");
      await screen.findByText("Joke a");
    });

    it("then counts them", () => {
      expect(navigationLink(/favorites/i)).toHaveTextContent("Favorites (2)");
    });
  });
});
