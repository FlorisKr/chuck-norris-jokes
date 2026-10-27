import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { type UserEvent, userEvent } from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";

import { JokeList } from ".";
import { RANDOM_JOKE_URL } from "../../api/jokes";
import { countOfJokeRequests } from "../../mocks/handlers";
import { server } from "../../mocks/server";
import { JOKE_COUNT } from "../../queries/jokes";
import { renderWithQueryClient } from "../../tests/render";
import { REFRESH_INTERVAL_MS } from "./auto-refresh/use-auto-refresh";

const NEXT_JOKE = `Joke ${JOKE_COUNT + 1}`;

function respondWithError() {
  let request = 0;
  server.use(
    http.get(RANDOM_JOKE_URL, async () => {
      await delay(20);
      request += 1;
      return new HttpResponse(null, { status: 500 });
    }),
  );
  return () => request;
}

function respondWithHangingRequests() {
  const signals: AbortSignal[] = [];
  server.use(
    http.get(RANDOM_JOKE_URL, async ({ request }) => {
      signals.push(request.signal);
      await delay("infinite");
    }),
  );
  return signals;
}

function respondWithHappyPath() {
  server.resetHandlers();
}

function jokeTexts() {
  return within(screen.getByRole("list", { name: "Jokes" }))
    .getAllByRole("listitem")
    .map((item) => item.textContent);
}

function switchTab(visibility: DocumentVisibilityState) {
  Object.defineProperty(document, "visibilityState", { value: visibility, configurable: true });
  fireEvent(document, new Event("visibilitychange"));
}

async function waitOneRefreshInterval() {
  await act(() => vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS));
}

describe("Given JokeList", () => {
  describe("when the jokes are still loading", () => {
    beforeEach(() => {
      renderWithQueryClient(<JokeList />);
    });

    it("then announces that jokes are loading", async () => {
      expect(screen.getByRole("status")).toHaveTextContent("Loading jokes");
      await screen.findByRole("list", { name: "Jokes" });
    });
  });

  describe("when the API returns jokes", () => {
    beforeEach(() => {
      renderWithQueryClient(<JokeList />);
    });

    it("then shows 10 jokes", async () => {
      expect(await screen.findAllByRole("listitem")).toHaveLength(JOKE_COUNT);
      expect(screen.getByText("Joke 1")).toBeInTheDocument();
    });

    it("then has auto-refresh turned off", async () => {
      expect(await screen.findByRole("switch", { name: /auto-refresh/i })).not.toBeChecked();
    });

    describe("when the user turns on auto-refresh", () => {
      let user: UserEvent;

      beforeEach(async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        await screen.findByText("Joke 1");
        await user.click(screen.getByRole("switch", { name: /auto-refresh/i }));
      });

      afterEach(() => {
        vi.useRealTimers();
      });

      it("then adds a new joke on top after 5 seconds", async () => {
        await waitOneRefreshInterval();

        expect(await screen.findByText(NEXT_JOKE)).toBeInTheDocument();
        expect(jokeTexts()[0]).toBe(NEXT_JOKE);
      });

      it("then keeps the list at 10 jokes", async () => {
        await waitOneRefreshInterval();

        await screen.findByText(NEXT_JOKE);
        expect(jokeTexts()).toHaveLength(JOKE_COUNT);
      });

      describe("when the user turns auto-refresh off again", () => {
        beforeEach(async () => {
          await user.click(screen.getByRole("switch", { name: /auto-refresh/i }));
        });

        it("then adds no new jokes", async () => {
          await waitOneRefreshInterval();
          await waitOneRefreshInterval();

          expect(screen.queryByText(NEXT_JOKE)).not.toBeInTheDocument();
          expect(jokeTexts()[0]).toBe("Joke 1");
        });

        it("then stops fetching new jokes", async () => {
          const requestsWhenTurnedOff = countOfJokeRequests();

          await waitOneRefreshInterval();
          await waitOneRefreshInterval();

          expect(countOfJokeRequests()).toBe(requestsWhenTurnedOff);
        });
      });

      describe("when the user switches to another tab", () => {
        beforeEach(() => {
          switchTab("hidden");
        });

        afterEach(() => {
          Reflect.deleteProperty(document, "visibilityState");
        });

        it("then adds no new jokes", async () => {
          await waitOneRefreshInterval();
          await waitOneRefreshInterval();

          expect(screen.queryByText(NEXT_JOKE)).not.toBeInTheDocument();
          expect(jokeTexts()[0]).toBe("Joke 1");
        });

        it("then stops fetching new jokes", async () => {
          const requestsWhenHidden = countOfJokeRequests();

          await waitOneRefreshInterval();
          await waitOneRefreshInterval();

          expect(countOfJokeRequests()).toBe(requestsWhenHidden);
        });

        describe("when the user comes back", () => {
          beforeEach(() => {
            switchTab("visible");
          });

          it("then adds a new joke on top after 5 seconds", async () => {
            await waitOneRefreshInterval();

            expect(await screen.findByText(NEXT_JOKE)).toBeInTheDocument();
            expect(jokeTexts()[0]).toBe(NEXT_JOKE);
          });
        });
      });

      describe("when a new joke takes longer than 5 seconds to load", () => {
        let signals: AbortSignal[];

        beforeEach(async () => {
          signals = respondWithHangingRequests();
          await waitOneRefreshInterval();
          await vi.waitUntil(() => signals.length === 1);
        });

        it("then waits for it instead of starting another request", async () => {
          await waitOneRefreshInterval();

          expect(signals).toHaveLength(1);
        });

        describe("when the user turns auto-refresh off", () => {
          beforeEach(async () => {
            await user.click(screen.getByRole("switch", { name: /auto-refresh/i }));
          });

          it("then cancels the request", () => {
            expect(signals[0]?.aborted).toBe(true);
          });
        });
      });

      describe("when fetching a new joke fails", () => {
        let failedRequests: () => number;

        beforeEach(() => {
          failedRequests = respondWithError();
        });

        it("then keeps the current jokes", async () => {
          await waitOneRefreshInterval();

          await waitFor(() => expect(failedRequests()).toBeGreaterThan(0));
          expect(jokeTexts()).toHaveLength(JOKE_COUNT);
          expect(jokeTexts()[0]).toBe("Joke 1");
        });

        it("then shows no error", async () => {
          await waitOneRefreshInterval();

          await waitFor(() => expect(failedRequests()).toBeGreaterThan(0));
          expect(screen.queryByRole("alert")).not.toBeInTheDocument();
        });
      });
    });
  });

  describe("when the API fails", () => {
    beforeEach(async () => {
      respondWithError();
      renderWithQueryClient(<JokeList />);
      await screen.findByRole("alert");
    });

    it("then shows an error", () => {
      expect(screen.getByRole("alert")).toHaveTextContent("Couldn't load jokes");
    });

    it("then offers to try again", () => {
      expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
    });

    describe("when the user retries", () => {
      let user: UserEvent;

      beforeEach(() => {
        user = userEvent.setup();
      });

      describe("when the retry is still loading", () => {
        beforeEach(async () => {
          await user.click(screen.getByRole("button", { name: "Try again" }));
        });

        it("then disables the button", async () => {
          expect(screen.getByRole("button", { name: "Trying again…" })).toHaveAttribute(
            "aria-disabled",
            "true",
          );
          await screen.findByRole("button", { name: "Try again" });
        });

        it("then keeps focus on the button", async () => {
          expect(screen.getByRole("button", { name: "Trying again…" })).toHaveFocus();
          await screen.findByRole("button", { name: "Try again" });
        });
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
          respondWithHappyPath();
          await user.click(screen.getByRole("button", { name: "Try again" }));
        });

        it("then shows the jokes", async () => {
          expect(await screen.findAllByRole("listitem")).toHaveLength(JOKE_COUNT);
          expect(screen.queryByRole("alert")).not.toBeInTheDocument();
        });

        it("then moves focus to the jokes", async () => {
          expect(await screen.findByRole("list", { name: "Jokes" })).toHaveFocus();
        });
      });
    });
  });
});
