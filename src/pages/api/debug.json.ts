import type { APIRoute } from "astro";
import { run } from "../../lib/crud";

export const get: APIRoute = async ({ params, request }) => {
  return {
    body: JSON.stringify({
      message: await run(),
    }),
  };
};
