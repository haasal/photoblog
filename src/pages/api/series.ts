import type { APIRoute } from "astro";
import { getSerie } from "../../lib/requests";

// TODO: Replace with dynamic route
export const get: APIRoute = async ({ params, request }) => {
  return {
    body: JSON.stringify({
      message: await getSerie("Farbige Pilze"),
    }),
  };
};
