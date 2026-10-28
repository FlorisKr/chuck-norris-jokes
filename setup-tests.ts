import "@testing-library/jest-dom/vitest";
import { toast } from "sonner";

import { resetJokeRequests } from "./src/mocks/handlers";
import { server } from "./src/mocks/server";

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  server.resetHandlers();
  resetJokeRequests();
  localStorage.clear();
  toast.dismiss();
});

afterAll(() => {
  server.close();
});
