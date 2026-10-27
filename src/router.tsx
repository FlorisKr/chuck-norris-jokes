import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";

import { App } from "./app";
import { Favorites } from "./components/favorites";
import { JokeList } from "./components/joke-list";
import { NotFound } from "./components/not-found";

const rootRoute = createRootRoute({ component: App, notFoundComponent: NotFound });

const jokesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: JokeList,
});

const favoritesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/favorites",
  component: Favorites,
});

export const routeTree = rootRoute.addChildren([jokesRoute, favoritesRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
