import { expect, test } from "@playwright/test";
import exp from "constants";

const INVALID_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb2xsZWN0aW9ucyI6WyJwcml2YXRlIiwicHVibGljIl0sImlhdCI6MTY3NjIyNjM0NCwiZXhwIjoxNjc2MjI5OTQ0fQ.77SE4DWz3QWNYIYLU8eiSE6XpetWfJDs_73YPG-9r0A";

test.describe("authentication", () => {
  test("first visit - public", async ({ request }) => {
    const resp = await request.get("/collection/public");
    expect(resp.ok()).toBeTruthy();
  });

  test("first visit - private", async ({ request }) => {
    const resp = await request.get("/collection/private");
    expect(resp.status()).toBe(401);
  });

  test("first visit - private, password", async ({ request }) => {
    const resp = await request.get("/collection/private?password=*****");
    expect(resp.ok()).toBeTruthy();
  });

  test("first visit - private, invalid password", async ({ request }) => {
    const resp = await request.get("/collection/private?password=invalid");
    expect(resp.status()).toBe(401);
  });

  test("first visit - public, invalid password", async ({ request }) => {
    const resp = await request.get("/collection/public?password=invalid");
    expect(resp.ok()).toBeTruthy();
  });

  test("first visit - invalid token, private", async ({ browser }) => {
    const browserContext = await browser.newContext();
    browserContext.addCookies([
      { name: "token", value: INVALID_TOKEN, path: "/", domain: "localhost" },
    ]);
    const request = browserContext.request;

    const resp = await request.get("/collection/private");
    expect(resp.status()).toBe(401);

    await browserContext.close();
  });

  test("first visit - invalid token, public", async ({ browser }) => {
    const browserContext = await browser.newContext();
    browserContext.addCookies([
      { name: "token", value: INVALID_TOKEN, path: "/", domain: "localhost" },
    ]);
    const request = browserContext.request;

    const resp = await request.get("/collection/public");
    expect(resp.ok()).toBeTruthy();

    await browserContext.close();
  });

  test("second visit - no password needed", async ({ request }) => {
    const resp = await request.get("/collection/private?password=*****");
    expect(resp.ok()).toBeTruthy();
    const resp2 = await request.get("/collection/private");
    expect(resp2.ok()).toBeTruthy();
  });

  test("first visit - invalid collection", async ({ request }) => {
    const resp = await request.get("/collection/invalid?password=invalid");
    expect(resp.status()).toBe(404);
  });

  // TODO: Some more attack based tests
});
