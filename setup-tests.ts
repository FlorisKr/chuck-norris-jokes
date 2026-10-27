import "@testing-library/jest-dom/vitest";
import { server } from "./src/mocks/server";

const pendingRequests = new Set<string>();

server.events.on("request:start", ({ request, requestId }) => {
  pendingRequests.add(requestId);
  // MSW 2 never ends a cancelled request, so a cancel counts as finished
  request.signal.addEventListener("abort", () => pendingRequests.delete(requestId));
});

server.events.on("request:end", ({ requestId }) => {
  pendingRequests.delete(requestId);
});

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  const requestsInFlight = pendingRequests.size;
  pendingRequests.clear();
  server.resetHandlers();

  // A request still in flight when a test ends can escape to the real network
  if (requestsInFlight > 0) {
    throw new Error(`${requestsInFlight} request(s) still in flight when the test ended`);
  }
});

afterAll(() => {
  server.close();
});
