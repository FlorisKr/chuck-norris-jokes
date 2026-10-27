import { act, screen, waitFor, within } from "@testing-library/react";
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
  return () => request;
}

function respondWithFailingRefreshes() {
  let failedRequests = 0;
  server.use(
    http.get(RANDOM_JOKE_URL, () => {
      failedRequests += 1;
      return new HttpResponse(null, { status: 500 });
    }),
  );
  return () => failedRequests;
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

function jokeTexts() {
  return within(screen.getByRole("list", { name: "Jokes" }))
    .getAllByRole("listitem")
    .map((item) => item.textContent);
}

function switchTab(visibility: DocumentVisibilityState) {
  Object.defineProperty(document, "visibilityState", { value: visibility, configurable: true });
  act(() => {
    document.dispatchEvent(new Event("visibilitychange"));
  });
}

async function waitFiveSeconds() {
  await act(() => vi.advanceTimersByTimeAsync(5000));
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
    let requestCount: () => number;

    beforeEach(() => {
      requestCount = respondWithJokes();
      renderWithQueryClient(<JokeList />);
    });

    it("then shows 10 jokes", async () => {
      expect(await screen.findAllByRole("listitem")).toHaveLength(10);
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
        await waitFiveSeconds();

        expect(await screen.findByText("Joke 11")).toBeInTheDocument();
        expect(jokeTexts()[0]).toBe("Joke 11");
      });

      it("then keeps the list at 10 jokes", async () => {
        await waitFiveSeconds();

        await screen.findByText("Joke 11");
        expect(jokeTexts()).toHaveLength(10);
      });

      describe("when the user turns auto-refresh off again", () => {
        beforeEach(async () => {
          await user.click(screen.getByRole("switch", { name: /auto-refresh/i }));
        });

        it("then adds no new jokes", async () => {
          await waitFiveSeconds();
          await waitFiveSeconds();

          expect(screen.queryByText("Joke 11")).not.toBeInTheDocument();
          expect(jokeTexts()[0]).toBe("Joke 1");
        });

        it("then stops fetching new jokes", async () => {
          const requestsWhenTurnedOff = requestCount();

          await waitFiveSeconds();
          await waitFiveSeconds();

          expect(requestCount()).toBe(requestsWhenTurnedOff);
        });
      });

      describe("when the user switches to another tab", () => {
        beforeEach(() => {
          switchTab("hidden");
        });

        afterEach(() => {
          Reflect.deleteProperty(document, "visibilityState");
        });

        it("then stops fetching new jokes", async () => {
          const requestsWhenHidden = requestCount();

          await waitFiveSeconds();
          await waitFiveSeconds();

          expect(requestCount()).toBe(requestsWhenHidden);
          expect(jokeTexts()[0]).toBe("Joke 1");
        });

        describe("when the user comes back", () => {
          beforeEach(() => {
            switchTab("visible");
          });

          it("then adds a new joke on top after 5 seconds", async () => {
            await waitFiveSeconds();

            expect(await screen.findByText("Joke 11")).toBeInTheDocument();
            expect(jokeTexts()[0]).toBe("Joke 11");
          });
        });
      });

      describe("when a new joke takes longer than 5 seconds to load", () => {
        let signals: AbortSignal[];

        beforeEach(async () => {
          signals = respondWithHangingRequests();
          await waitFiveSeconds();
          await vi.waitUntil(() => signals.length === 1);
        });

        it("then waits for it instead of starting another request", async () => {
          await waitFiveSeconds();

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
          failedRequests = respondWithFailingRefreshes();
        });

        it("then keeps the current jokes without showing an error", async () => {
          await waitFiveSeconds();

          await waitFor(() => expect(failedRequests()).toBeGreaterThan(0));
          expect(jokeTexts()).toHaveLength(10);
          expect(jokeTexts()[0]).toBe("Joke 1");
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
        await screen.findByRole("button", { name: "Try again" });
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
