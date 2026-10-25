import { render, screen } from "@testing-library/react";

import { App } from "./App";

describe("Given the app", () => {
  it("when it loads, then it shows the title", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Chuck Norris Jokes" })).toBeInTheDocument();
  });
});
