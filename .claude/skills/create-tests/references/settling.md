# Ending a test settled

Read this when a test waits for a request or a timer.

A test is **settled** when nothing it started can still change state after it ends. An unsettled test
leaks into the next one. The symptoms are `act(...)` warnings, a request counter that starts at 2, or
a test that only fails in the full suite. Nothing enforces this, so each test must end settled on its
own.

React Testing Library unmounts after every test. Whatever the component cleans up on unmount is
settled for free: its intervals are cleared and its open requests are aborted. Everything else must
finish before the test ends.

End the test by how the work it started ends:

| Work the test started                            | How the test ends                                                                                                          |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| A request that answers, now or after `delay(ms)` | `await findBy…` the final state, like the list or the error. Also after asserting an in-between state like "Loading jokes" |
| A timer that runs work                           | Advance it inside `act`, then wait for that round's result, on screen or with `waitFor` on a counter                       |
| A hanging request (`delay("infinite")`)          | It gets cancelled, either by a user action (assert it through the request's signal) or by the unmount                      |
| An interval that is still running                | Nothing, as long as the component clears it on unmount                                                                     |

Use `delay("infinite")` only for code that aborts on unmount. TanStack Query does this when `queryFn`
passes its `signal` to `fetch`. Otherwise use a finite `delay(ms)`.

## Fake timers

Create the user with `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })`, or user-event's
waits never end.
