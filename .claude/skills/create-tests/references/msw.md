# Faking the API with MSW

Read this when a test fakes the network. Use the MSW 2 API, and don't upgrade MSW.

A test that breaks one of these rules needs a good reason in the PR.

## Setup

- **Happy path by default.** `src/mocks/handlers.ts` holds the happy-path handlers passed to
  `setupServer` in `src/mocks/server.ts`. Every joke request gets a new joke ("Joke 1", "Joke 2", …),
  so most tests need no setup. A new endpoint gets its happy path there first
- **Strict.** `onUnhandledRequest: "error"`, never `"warn"` or `"bypass"`
- **Clean slate between tests.** `server.resetHandlers()` runs in `afterEach` in `setup-tests.ts`, and
  any state a handler keeps (like the request counter) is reset right next to it. Handler state is
  reset only there, never in the middle of a test

## Overrides

- **Only what differs.** Override for errors, duplicates, slow or hanging requests. Never override
  with something the default handler already returns
- **Named scenario helpers.** Wrap every change to the network in a `respondWith<Scenario>()`
  function, like `respondWithError()` or `respondWithJokeIds(ids)`, so the test reads like a spec
- **Back to normal: `respondWithHappyPath()`.** To bring back the defaults in the middle of a test
  (like "when the API recovers"), call a helper that only runs `server.resetHandlers()`. It keeps the
  request counter counting. Resetting it mid-test would hand out ids the screen already shows, so a
  refresh returning "Joke 1" would be dropped as a duplicate and the test would see no new joke
- **Real timing.** Use MSW's `delay(ms)` and `delay("infinite")`, never `setTimeout` in a handler
- **Share when shared.** A scenario helper lives in the spec that uses it. Once a second test file
  needs it, it moves to `src/mocks/scenarios.ts`, not `handlers.ts`, which `server.ts` imports. Moving
  it changes another spec, so `/create-tests write` doesn't do that. Write a local helper and propose
  the move as a separate change

## Fixtures

Create a fixture whenever a test needs data shaped like one of the app's types. That covers every
mocked response body and every object passed to a function under test.

- **One builder per type** in `src/mocks/<resource>.ts`, named `build<Type>`, like `buildJoke(id)`.
  A new type gets its builder in the PR that introduces it
- **Typed, not parsed.** The builder returns the app type (`Joke`), so a schema change fails
  `pnpm typecheck` at the fixture. Don't parse with Zod inside a builder, because an error thrown in a
  handler turns into a 500 far away from its cause
- **One type for the wire and the app.** Schemas have no transforms, so the same builder serves
  response bodies and app objects. If one ever needs a transform, its response-body builder returns
  `z.input<typeof Schema>` instead of the app type
- **Varying fields: one builder, the id first, then overrides.** The id is the only required argument,
  and every other field is derived from it (`buildJoke("1")` gives "Joke 1"). When a test needs to vary
  another field, add an optional `overrides: Partial<Joke> = {}` parameter that is spread last, and
  call it as `buildJoke("1", { value: "A very long joke" })`. Never add a second builder for the same
  type
- **Never hand-write** an object that matches an app type. The exception is data that is invalid on
  purpose, like a malformed joke: write it out in its scenario helper (`respondWithMalformedJoke()`),
  because no builder should be able to produce it

## What to cover and assert

- **Failures worth covering:** a 500, `HttpResponse.error()` (network down), a malformed body, a slow
  response for loading states and a hanging one for cancel paths
- **Assert what the app shows.** Check requests directly only when the behavior has no visible
  effect, like "no requests while auto-refresh is off" or "the request is cancelled"
