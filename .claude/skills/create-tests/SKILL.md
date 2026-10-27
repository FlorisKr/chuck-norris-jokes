---
name: create-tests
description: Writes and reviews value-driven tests for this repo's React components (and the hooks inside them) and API client. Use when writing unit or integration tests, reviewing test quality, deciding what kind of test to write, or when the user runs /create-tests write or /create-tests review.
argument-hint: "[write|review] [path]"
---

# Frontend testing: value-driven

Test **what users get**, not how the code is built. Tests should survive refactoring, so assert
outcomes, not structure. No comments in test files: a test that needs a comment needs a better name or
helper.

Vitest globals are on, so tests don't import `describe`, `it`, `expect` or `vi`. Render components with
`renderWithQueryClient` from `src/tests/render.tsx`, which gives each test a fresh `QueryClient` with
`retry: false`.

`/create-tests write [path]` runs the protocol at the end of this file. `/create-tests review [path]`
runs `references/review.md`. Without a path, both work on the code that differs from the default
branch. Without `write` or `review`, apply this file to the test work at hand.

Read a reference only when the task needs it:

| Read                     | When                                                        |
| ------------------------ | ----------------------------------------------------------- |
| `references/msw.md`      | a test fakes the network: scenario helpers, fixtures        |
| `references/settling.md` | a component test waits for a request or a timer             |
| `references/review.md`   | `/create-tests review`, and step 5 of `/create-tests write` |

## Unit or integration: the boundary rule

**A test that fakes a boundary (network, timers, browser APIs) is an integration test. A test that
fakes nothing is a unit test.** That one rule decides the kind, the file name and the structure:

| Fakes a boundary? | Kind        | File                            | Structure              |
| ----------------- | ----------- | ------------------------------- | ---------------------- |
| no                | Unit        | `<name>.spec.ts(x)`             | Arrange / Act / Assert |
| yes               | Integration | `<name>.integration.spec.ts(x)` | Given / When / Then    |

So pure functions and presentational components that only render props get unit tests. Anything that
fetches, waits or reads browser state gets an integration test, including the API client in `src/api/`
(real `fetch`, parsing and Zod validation, with only the network faked). A feature with pure helpers
gets both, each file classified on its own. Specs sit next to the code they test.

| Code                                   | Boundary faked                     | Test        |
| -------------------------------------- | ---------------------------------- | ----------- |
| `add-joke-to-joke-list.spec.ts`        | none                               | Unit        |
| `api/jokes.integration.spec.ts`        | network (MSW)                      | Integration |
| `joke-list/index.integration.spec.tsx` | network, timers, `visibilityState` | Integration |

Some code gets no test file of its own:

- **Hooks** (`use-*.ts`) are tested through the component that uses them, not with `renderHook`,
  because users only meet a hook through the screen
- **`src/queries/`** options are covered by the integration test of the feature that calls `useQuery`
- **`src/schemas/`** are covered by the API client tests

## Unit tests

Arrange, act and assert, separated by blank lines. A unit test fakes nothing. A complete example, as it
runs in `src/components/joke-list/auto-refresh/add-joke-to-joke-list.spec.ts`:

```ts
import { buildJoke } from "../../../mocks/jokes";
import type { Joke } from "../../../schemas/joke";
import { addJokeToJokeList } from "./add-joke-to-joke-list";

function ids(jokes: Joke[]): string[] {
  return jokes.map((joke) => joke.id);
}

describe("addJokeToJokeList", () => {
  it("drops the oldest joke when the list is full", () => {
    const jokes = [buildJoke("b"), buildJoke("c"), buildJoke("d")];

    const result = addJokeToJokeList(jokes, buildJoke("a"), 3);

    expect(ids(result)).toEqual(["a", "b", "c"]);
  });
});
```

## Integration tests

Fake only what sits outside the app: `fetch` through MSW, timers, and browser APIs a test must control
(like `document.visibilityState`). For UI features, go through the rendered component. Code without UI
is called directly.

- `describe("Given <Component or function>")`. The Given is the thing under test, not the API state
- A nested `describe("when …")` per situation or user action, following real flows. Its `beforeEach`
  creates the user, renders and acts. Testing Library discourages rendering in hooks, so this is a
  deliberate house choice: it keeps each `it` to one outcome
- Code without UI, like the API client, is called inside the `it`. Assert with
  `await expect(…).resolves` or `.rejects.toThrow(…)`, always with a message or error class, which the
  linter requires. Awaiting the promise settles the test
- `it("then …")` with **one outcome each**, named after behavior a user or caller can observe:
  "then adds a new joke on top after 5 seconds", never a function call or a state variable
- Every test ends **settled**: nothing it started can still change state. See `references/settling.md`
- Every `vi.useFakeTimers()` has a `vi.useRealTimers()` in the `afterEach` of the same describe

A complete example that runs as `src/components/joke-list/index.integration.spec.tsx`. `NEXT_JOKE` is derived from `JOKE_COUNT`, because the first load uses up "Joke 1" to
"Joke 10". The wait comes from `REFRESH_INTERVAL_MS`. Derive expected values and waits from the app's
constants like this, so a test can't drift from the app:

```tsx
import { act, screen } from "@testing-library/react";
import { type UserEvent, userEvent } from "@testing-library/user-event";
import { delay, http } from "msw";

import { JokeList } from ".";
import { RANDOM_JOKE_URL } from "../../api/jokes";
import { server } from "../../mocks/server";
import { JOKE_COUNT } from "../../queries/jokes";
import { renderWithQueryClient } from "../../tests/render";
import { REFRESH_INTERVAL_MS } from "./auto-refresh/use-auto-refresh";

const NEXT_JOKE = `Joke ${JOKE_COUNT + 1}`;

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

async function waitOneRefreshInterval() {
  await act(() => vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS));
}

describe("Given JokeList", () => {
  describe("when the user turns on auto-refresh", () => {
    let user: UserEvent;

    beforeEach(async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithQueryClient(<JokeList />);
      await screen.findByText("Joke 1");
      await user.click(screen.getByRole("switch", { name: /auto-refresh/i }));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("then adds a new joke on top after 5 seconds", async () => {
      await waitOneRefreshInterval();

      expect(await screen.findByText(NEXT_JOKE)).toBeInTheDocument();
    });

    describe("when a new joke is still loading and the user turns auto-refresh off", () => {
      let signals: AbortSignal[];

      beforeEach(async () => {
        signals = respondWithHangingRequests();
        await waitOneRefreshInterval();
        await vi.waitUntil(() => signals.length === 1);
        await user.click(screen.getByRole("switch", { name: /auto-refresh/i }));
      });

      it("then cancels the request", () => {
        expect(signals[0]?.aborted).toBe(true);
      });
    });
  });
});
```

## Queries

Query the way users and assistive tech find things: `getByRole` with an accessible name first, then
`getByText`. Their `findBy`, `queryBy` and `AllBy` variants count as the same queries, and so does
`within(…)` to scope one to a region. Wait the way Testing Library recommends. Before asserting that
something is absent, first wait for something that proves the update happened. When nothing should
happen, advance past the moment it would have happened. Use `act` only around
advancing fake timers.

When neither query finds an element users can see or use, the component has an accessibility bug. Don't
fix it while writing tests: flag it and propose a fix, preferring a native element, then a visible
label or text, and only then an `aria-label`. Don't test what users can't see, like the `aria-hidden`
countdown ring. Test the behavior it belongs to instead.

## Rules you can check by searching

Each of these has a search in `references/review.md`, step 2:

- No `vi.mock` or `vi.spyOn` on the repo's own modules, because a test should run the real code
- No test ids, because a role query also checks accessibility
- No URL written in a spec or in `src/mocks/`: import it from `src/api/`, so tests can't drift from the
  app
- No `crypto.randomUUID`, `Date.now`, `Math.random` or `new Date(` in `src/mocks/`, so fixtures stay
  deterministic
- No `server.use` or `server.resetHandlers` outside a `respondWith…` helper, so tests read like specs

## Protocol for `/create-tests write`

Don't ask what type of tests to write. Run these steps in order.

1. **Classify.** Read the code and decide with the boundary rule which tests it needs and where they
   go. Say so in two or three lines before writing anything
2. **Check the markup** (skip this for code without UI). Every element a test needs must have a role and an accessible name. Writing
   tests doesn't change production code: if one doesn't, skip the tests that need it, write the rest,
   and list it under **Accessibility issues found** with its `file:line` and a proposed fix. The
   developer decides whether the fix goes into this change. If they ask you to make it, list every
   production file you changed
3. **Write the tests.** List every branch of the code under test (each `if`, `else`, early `return`,
   `catch`, `??` and ternary) and make sure each one a user or caller could notice has a test. Also
   cover each failure from "What to cover and assert" in `references/msw.md` that this code handles. Coverage
   isn't configured, so this is done by hand. Read the references the task needs
4. **Run them and prove each one can fail.** Run `pnpm test <path>`: every test passes with no `act(...)`
   warnings. Then prove each new test can fail, as described below. A test that still passes checks
   nothing, so rewrite it and prove it again. Finish with the full check from "Commands" in `CLAUDE.md`
5. **Review your own tests** with steps 2, 4, 6 and 7 of `references/review.md`. Skip review steps 3
   and 5, because step 4 above already ran the tests and proved each one can fail. Report the tests you
   added and how you made each one fail, then the review in the format of review step 7

## Proving a test can fail

1. Copy the file you are about to break to the scratchpad
2. Break exactly the behavior the test checks. For a regression test, revert the fix
3. Make sure the break really changes the behavior. A break that changes nothing makes a good test look
   useless
4. Run only that test with `pnpm test <path> -t "<test name>$"` and see it fail on its assertion
5. Restore the file from the copy, and `diff` the two to check that nothing you broke is left. Don't use
   `git diff` for this, because the tree may hold other uncommitted work
