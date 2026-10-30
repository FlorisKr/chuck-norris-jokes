import {
  createRootRoute,
  createRoute,
  createRouter,
  type RouterHistory,
} from "@tanstack/react-router";

import { App } from "./app";
import { Favorites } from "./components/favorites";
import { JokeList } from "./components/joke-list";
import { NotFound } from "./components/not-found";
import { RouteError } from "./components/route-error";

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

const routeTree = rootRoute.addChildren([jokesRoute, favoritesRoute]);

export function createAppRouter(history?: RouterHistory) {
  return createRouter({ routeTree, history, defaultErrorComponent: RouteError });
}

export const router = createAppRouter();

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
