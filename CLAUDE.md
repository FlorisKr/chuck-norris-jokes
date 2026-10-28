# CLAUDE.md

React client for the [Chuck Norris jokes API](https://api.chucknorris.io/).

**Stack**: React 19 with the React Compiler, TypeScript, Vite, Tailwind CSS 4, TanStack Query, TanStack Router, Zod, pnpm. Testing: Vitest + React Testing Library with MSW to fake the API, and Playwright for end-to-end tests.

## Commands

- `pnpm dev`: dev server
- `pnpm test`: run all tests once (`pnpm test:watch` to keep watching)
- `pnpm test:e2e`: build the app and run the Playwright tests against it
- `pnpm format`: format with oxfmt
- `pnpm lint`: lint with Oxlint (type-aware, accessibility rules)
- `pnpm typecheck`: type-check
- `pnpm build`: type-check and production build

Run `pnpm format`, `pnpm lint`, `pnpm typecheck` and `pnpm test` once, after all changes are made, not between edits.

## Conventions

- pnpm only. Dependencies are pinned to exact versions (`saveExact` in `pnpm-workspace.yaml`).
- Ask before adding a dependency, and explain why it's needed.
- Formatting is oxfmt defaults with import and Tailwind class sorting. Don't format by hand.
- Style with Tailwind and the semantic color tokens in `src/index.css` (`background`, `surface`, `foreground`, `line`, `secondary`, `accent`). No hardcoded colors and no `dark:` classes, because the tokens switch with the color scheme. Text and buttons sit on a `surface`.
- Validate API responses and stored data with Zod at the boundary before using them. Keep schemas free of transforms (no `.transform()`, `.preprocess()`, `z.coerce`, `.catch()`, `.default()` or renames), so the inferred type is also the wire shape and test fixtures can use it for response bodies.
- Prefer the simplest solution that can be explained. No speculative abstractions.
- Comments are one simple sentence that explains why, not what. No semicolons.

## Structure

- Folders by technical layer: `src/schemas` (Zod schema and inferred type), `src/api` (fetching), `src/queries` (TanStack Query options), `src/stores` (client state saved in `localStorage`, read with `useSyncExternalStore`), `src/components`, `src/mocks` (MSW handlers and fixtures), `src/tests` (test helpers).
- A feature lives in `src/components/<feature>/index.tsx`, with the parts it uses as sibling files and sub-features in their own folder (like `joke-list/auto-refresh/`).
- Routes live in `src/router.tsx` (TanStack Router, code-based).
- Share when actually shared: code moves to `src/components/shared/` only once a second user needs it.
- File and folder names are kebab-case. Component names stay PascalCase.
- Components call `useQuery` with the query options directly. No custom hook around it.

## TypeScript and React

- `interface` for object shapes. `type` for unions, intersections and aliases.
- No `enum`. Use string-literal unions or `as const` objects.
- Named exports only. Default exports are only allowed where a tool requires them, such as config files.
- Fix lint errors instead of suppressing them, including accessibility rules.

## Testing

- Follow the `create-tests` skill in `.claude/skills/create-tests/` for everything about Vitest tests.
- End-to-end tests live in `e2e/*.e2e.ts` and run against the production build and the real API. Keep them to a few user flows, because integration tests cover the details.
- When new behavior has no tests, flag it in the summary. Don't write tests unasked, because the developer decides.

## Workflow

- Use git to inspect (status, diff, log), but never commit or push. Suggest those commands instead, because the developer commits, pushes and opens PRs.
- One concern per PR.
- Don't make architectural decisions. Present the options with trade-offs and a recommendation, and let the developer choose.

## Communication

- Write for someone who knows the domain but didn't watch the work happen.
- Lead with what changed, then why. Put reasoning, trade-offs and caveats in their own sentences.
- One idea per sentence.
- When introducing a label for a group of things, say right away which things it covers.
