import { screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

import { renderAppAt } from "../../tests/render";

function crashWhenReadingVisibility() {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get() {
      throw new Error("Visibility crash");
    },
  });
}

describe("Given RouteError", () => {
  describe("when a page crashes while rendering", () => {
    beforeEach(async () => {
      vi.spyOn(console, "error").mockImplementation(() => undefined);
      vi.spyOn(console, "warn").mockImplementation(() => undefined);
      crashWhenReadingVisibility();
      renderAppAt("/");
      await screen.findByRole("alert");
    });

    afterEach(() => {
      Reflect.deleteProperty(document, "visibilityState");
      vi.restoreAllMocks();
    });

    it("then explains that something went wrong", () => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Something went wrong. Try again or come back later.",
      );
    });

    it("then offers to try again", () => {
      expect(
        within(screen.getByRole("alert")).getByRole("button", { name: "Try again" }),
      ).toBeInTheDocument();
    });

    it("then doesn't show the error details", () => {
      expect(screen.queryByText(/Visibility crash/)).not.toBeInTheDocument();
    });

    it("then keeps the navigation available", () => {
      expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
    });

    describe("when the user goes to the favorites", () => {
      beforeEach(async () => {
        Reflect.deleteProperty(document, "visibilityState");
        await userEvent.setup().click(screen.getByRole("link", { name: /favorites/i }));
      });

      it("then shows the favorites page", async () => {
        expect(await screen.findByText(/No favorites yet/)).toBeInTheDocument();
      });
    });
  });
});
