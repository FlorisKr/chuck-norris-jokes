import "@testing-library/jest-dom/vitest";
import { resetJokeRequests } from "./src/mocks/handlers";
import { server } from "./src/mocks/server";

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  server.resetHandlers();
  resetJokeRequests();
  localStorage.clear();
});

afterAll(() => {
  server.close();
});
