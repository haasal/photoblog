import { expect, test } from "@playwright/test";

test.describe("/image", () => {
  test("image not found", async ({ request }) => {
    const resp = await request.get("/image/notfound.jpg");
    expect(resp.status()).toBe(404);
  });

  test("invalid mime type", async ({ request }) => {
    const resp = await request.get("/image/xxx.invalid");
    expect(resp.status()).toBe(400);
    expect(await resp.text()).toContain("mime");
  });

  test("multiple mime types", async ({ request }) => {
    // does not exist. Only tests for not beeing mime related error
    const resp = await request.get("/image/someimg.png");
    expect(resp.status()).not.toBe(400);
    expect(await resp.text()).not.toContain("mime");
  });

  test("successful image", async ({ request }) => {
    const resp = await request.get("/image/psylo.jpg");
    expect(resp.ok()).toBeTruthy();
  });
});
