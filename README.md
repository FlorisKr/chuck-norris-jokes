# Chuck Norris Jokes

A React client for the [Chuck Norris jokes API](https://api.chucknorris.io/).

## Tech stack

- [React 19](https://react.dev/) with the [React Compiler](https://react.dev/learn/react-compiler)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [TanStack Query](https://tanstack.com/query) for data fetching and [Zod](https://zod.dev/) for validating API data
- [Vitest](https://vitest.dev/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) for unit and integration tests, with [MSW](https://mswjs.io/) to fake the API
- [Oxlint](https://oxc.rs/docs/guide/usage/linter) and [oxfmt](https://oxc.rs/docs/guide/usage/formatter) for linting and formatting

## Getting started

Requires Node.js 24 (see `.nvmrc`) and pnpm.

```sh
pnpm install
pnpm dev
```

## Git hooks

[Husky](https://typicode.github.io/husky/) installs a `pre-push` hook on `pnpm install`. It runs the format check, lint, type-check and tests, so problems show up before CI runs them on the pull request.

## Scripts

| Command             | Description                                    |
| ------------------- | ---------------------------------------------- |
| `pnpm dev`          | Start the dev server                           |
| `pnpm build`        | Type-check and build for production to `dist/` |
| `pnpm preview`      | Serve the production build locally             |
| `pnpm lint`         | Lint the codebase with Oxlint                  |
| `pnpm typecheck`    | Type-check the codebase                        |
| `pnpm test`         | Run the tests once                             |
| `pnpm test:watch`   | Run the tests in watch mode                    |
| `pnpm format`       | Format the codebase with oxfmt                 |
| `pnpm format:check` | Check formatting without writing changes       |

## Testing

Our tests focus on behavior, not implementation: they interact with the app the way a user does.

- **Unit tests** cover pure functions in isolation.
- **Integration tests** They render a feature and query it by role, label or text. Only browser APIs are faked; the project's own modules are never mocked.

Tests live next to the code they test as `*.spec.ts` / `*.integration.spec.tsx` and run with `pnpm test`.
