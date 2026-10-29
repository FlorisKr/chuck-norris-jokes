import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";

import "./index.css";
import { router } from "./router";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster
        position="bottom-center"
        toastOptions={{
          unstyled: true,
          classNames: {
            toast:
              "w-full rounded-xl border-1 border-secondary bg-surface px-4 py-3 text-center text-foreground shadow-md",
          },
        }}
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
);
