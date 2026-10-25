import { screen } from "@testing-library/react";
import { type UserEvent, userEvent } from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";

import { JokeList } from ".";
import { server } from "../../mocks/server";
import { renderWithQueryClient } from "../../tests/render";

const RANDOM_JOKE_URL = "https://api.chucknorris.io/jokes/random";

function respondWithJokes() {
  let request = 0;
  server.use(
    http.get(RANDOM_JOKE_URL, () => {
      request += 1;
      return HttpResponse.json({ id: `joke-${request}`, value: `Joke ${request}` });
    }),
  );
}

function respondWithError() {
  server.use(
    http.get(RANDOM_JOKE_URL, async () => {
      await delay(20);
      return new HttpResponse(null, { status: 500 });
    }),
  );
}

describe("Given JokeList", () => {
  describe("when the jokes are still loading", () => {
    beforeEach(() => {
      respondWithJokes();
      renderWithQueryClient(<JokeList />);
    });

    it("then announces that jokes are loading", () => {
      expect(screen.getByRole("status")).toHaveTextContent("Loading jokes");
    });
  });

  describe("when the API returns jokes", () => {
    beforeEach(() => {
      respondWithJokes();
      renderWithQueryClient(<JokeList />);
    });

    it("then shows 10 jokes", async () => {
      expect(await screen.findAllByRole("listitem")).toHaveLength(10);
      expect(screen.getByText("Joke 1")).toBeInTheDocument();
    });
  });

  describe("when the API fails", () => {
    beforeEach(async () => {
      respondWithError();
      renderWithQueryClient(<JokeList />);
      await screen.findByRole("alert");
    });

    it("then shows an error with a retry button", () => {
      expect(screen.getByRole("alert")).toHaveTextContent("Couldn't load jokes");
      expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
    });

    describe("when the user retries", () => {
      let user: UserEvent;

      beforeEach(() => {
        user = userEvent.setup();
      });

      it("then keeps focus on the button while trying again", async () => {
        await user.click(screen.getByRole("button", { name: "Try again" }));

        const button = screen.getByRole("button", { name: "Trying again…" });
        expect(button).toHaveAttribute("aria-disabled", "true");
        expect(button).toHaveFocus();
      });

      describe("when the API still fails", () => {
        beforeEach(async () => {
          await user.click(screen.getByRole("button", { name: "Try again" }));
        });

        it("then keeps focus on the retry button", async () => {
          expect(await screen.findByRole("button", { name: "Try again" })).toHaveFocus();
        });
      });

      describe("when the API recovers", () => {
        beforeEach(async () => {
          respondWithJokes();
          await user.click(screen.getByRole("button", { name: "Try again" }));
        });

        it("then shows the jokes", async () => {
          expect(await screen.findAllByRole("listitem")).toHaveLength(10);
          expect(screen.queryByRole("alert")).not.toBeInTheDocument();
        });

        it("then moves focus to the jokes", async () => {
          expect(await screen.findByRole("list", { name: "Jokes" })).toHaveFocus();
        });
      });
    });
  });
});
