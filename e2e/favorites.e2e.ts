import { expect, test } from "@playwright/test";

test("a favorite survives a reload and is listed on the favorites page", async ({ page }) => {
  await page.goto("/");
  const jokes = page.getByRole("list", { name: "Jokes" }).getByRole("listitem");
  await expect(jokes).toHaveCount(10);

  const firstJoke = jokes.first();
  const jokeText = await firstJoke.getByRole("paragraph").innerText();
  await firstJoke.getByRole("button", { name: "Favorite" }).click();
  await expect(page.getByRole("link", { name: "Favorites (1)" })).toBeVisible();

  await page.reload();
  await page.getByRole("link", { name: "Favorites (1)" }).click();

  await expect(
    page.getByRole("list", { name: "Favorites" }).getByText(jokeText, { exact: true }),
  ).toBeVisible();
});
