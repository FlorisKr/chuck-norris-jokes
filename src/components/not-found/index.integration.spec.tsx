import { screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

import { renderAppAt } from "../../tests/render";

describe("Given NotFound", () => {
  describe("when the user opens a page that doesn't exist", () => {
    beforeEach(async () => {
      renderAppAt("/favourites");
      await screen.findByRole("heading", { name: "Page not found" });
    });

    it("then keeps the navigation available", () => {
      expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
    });

    describe("when the user clicks Go to jokes", () => {
      beforeEach(async () => {
        await userEvent.setup().click(screen.getByRole("link", { name: "Go to jokes" }));
      });

      it("then shows the jokes", async () => {
        expect(await screen.findByText("Joke 1")).toBeInTheDocument();
      });
    });
  });
});
