import { test, expect } from "@playwright/test";

test.describe("Navbar", () => {
  test.beforeEach(async ({ page }) => {
    page.goto("/");
  });

  test("Test home routing", async ({ page }) => {
    await expect(page).toHaveTitle(/fotoblog/i);
    await page.getByRole("link", { name: "Home" }).click();
    await expect(page).toHaveURL("/");
  });

  test("Test gallery routing", async ({ page }) => {
    await page.getByRole("link", { name: "Gallerie" }).click();
    await expect(page).toHaveTitle("Gallerie");
  });

  test("Test about routing", async ({ page }) => {
    await page.getByRole("link", { name: "About" }).click();
    await expect(page).toHaveTitle("About");
  });
});
