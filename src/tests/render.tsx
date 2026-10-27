import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { Toaster } from "sonner";

import { routeTree } from "../router";

export function renderWithQueryClient(ui: ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
      <Toaster />
    </QueryClientProvider>,
  );
}

export function renderAppAt(path: string) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
  });

  return renderWithQueryClient(<RouterProvider router={router} />);
}
