# Chuck Norris Jokes

A React client for the [Chuck Norris jokes API](https://api.chucknorris.io/).

## Tech stack

- [React 19](https://react.dev/) with the [React Compiler](https://react.dev/learn/react-compiler)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Oxlint](https://oxc.rs/docs/guide/usage/linter) and [oxfmt](https://oxc.rs/docs/guide/usage/formatter) for linting and formatting

## Getting started

Requires Node.js 24 (see `.nvmrc`) and pnpm.

```sh
pnpm install
pnpm dev
```

## Git hooks

[Husky](https://typicode.github.io/husky/) installs a `pre-push` hook on `pnpm install`. It runs the format check, lint and type-check, so problems show up before CI runs them on the pull request.

## Scripts

| Command             | Description                                    |
| ------------------- | ---------------------------------------------- |
| `pnpm dev`          | Start the dev server                           |
| `pnpm build`        | Type-check and build for production to `dist/` |
| `pnpm preview`      | Serve the production build locally             |
| `pnpm lint`         | Lint the codebase with Oxlint                  |
| `pnpm typecheck`    | Type-check the codebase                        |
| `pnpm format`       | Format the codebase with oxfmt                 |
| `pnpm format:check` | Check formatting without writing changes       |
