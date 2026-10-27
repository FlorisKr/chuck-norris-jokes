# Reviewing tests

Read this for `/create-tests review`, and for step 5 of `/create-tests write`, which runs only steps
2, 4, 6 and 7. Don't ask what to review. Run these steps in order. A review leaves the code as it
found it. Step 5 breaks code only to run a test, and restores it right after.

## Step 1: pick the scope

Use the spec files or folder the user named. Without one, review the test files that differ from where
the branch left the default branch, committed or not, plus untracked ones. `origin/HEAD` points at the
default branch, whatever it's called. Run the first command, then pass its output to the second:

```sh
git merge-base origin/HEAD HEAD
git diff --name-only <merge-base> -- 'src/*.spec.*' src/mocks src/tests setup-tests.ts
git ls-files --others --exclude-standard -- 'src/*.spec.*' src/mocks src/tests
```

If `origin/HEAD` isn't set, run `git remote set-head origin --auto` first. Also read the code each spec
tests: the file it's named after, or for a feature spec the whole feature folder.

## Step 2: run the searches

These rules can be checked by searching. Run each search from the repo root. `--untracked` includes
files that aren't committed yet. Every hit in scope that breaks the rule is a finding. List hits outside
the scope under Searches only.

```sh
git grep -nE --untracked 'vi\.mock\([[:space:]]*["'"'"'`](\.|src/)' -- 'src/*.spec.*'
git grep -nE --untracked 'ByTestId|data-testid' -- src
git grep -nE --untracked '["'"'"'`]https?://' -- 'src/*.spec.*' src/mocks
git grep -nE --untracked 'crypto\.randomUUID|Date\.now|Math\.random|new Date\(' -- src/mocks
git grep -nE --untracked 'server\.(use|resetHandlers)\(' -- 'src/*.spec.*'
git grep -nE --untracked 'vi\.spyOn\(' -- 'src/*.spec.*'
```

The first four should return nothing. The last two list every hit for you to judge:

- Each raw `server` call must sit inside a `respondWith…` helper, not in a `describe`, `beforeEach` or
  `it`
- Each `vi.spyOn` must target a browser or global object (like `window` or `console`), never something
  imported from the repo. Spying on the repo's own modules breaks the same rule as `vi.mock`

## Step 3: run the specs

Run `pnpm test <paths>`, then `pnpm test`, because a leaking test can fail only in the full suite. A
failing test or an `act(...)` warning is a finding.

## Step 4: read each test against the rules a search can't check

- Kind and file name match the boundary rule
- Arrange / Act / Assert for unit tests, Given / When / Then with one outcome per `it` for integration
  tests
- Each test ends settled (`settling.md`), and fake timers are restored in the same describe
- Fixtures and scenario helpers follow `msw.md`
- Queries are role first, then text, and wait the right way
- Every element a test needs is found by role and accessible name. If one isn't, list it under
  Accessibility issues found
- Names describe observable behavior

## Step 5: prove doubtful tests can fail

For any test that looks like it could pass with the behavior broken, prove it can fail as described in
"Proving a test can fail" in `SKILL.md`. A test that still passes is the most severe finding.

## Step 6: judge what no search can see

Answer these four. Each answer names a specific test and a concrete reason. "All tests are fine" is
not an answer, so name the weakest test for each question even when it's acceptable.

1. **Value:** which test checks the most implementation and the least behavior, and would a user or
   caller notice if it broke?
2. **Readability:** which test name or setup would a new developer misread without opening the source?
3. **Variants:** which failure path or edge case of this code has no test?
4. **Refactor resilience:** which test would break on a refactor that keeps the behavior the same?

## Step 7: report

Order findings by severity: a test that can't fail first, then rule violations, then naming and
readability.

```
## Test review: <scope>

### Searches
<each search with a hit that breaks a rule, in or out of scope, or "no hits">

### Findings
1. <file:line> — <rule> — <what's wrong> — <fix>

### Accessibility issues found
<none, or each element without a role or name: file:line — proposed fix>

### Judgment
1. Value: <test> — <reason>
2. Readability: <test> — <reason>
3. Variants: <missing case>
4. Refactor resilience: <test> — <reason>
```
