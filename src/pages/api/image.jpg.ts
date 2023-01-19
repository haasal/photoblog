import type { APIRoute } from "astro";
import { getFileCached } from "../../lib/requests";

// TODO: Not actually the final image path.
// Change this to the auth spec + replace with dynamic route
export const get: APIRoute = async ({}) => {
  const file = await getFileCached("psylo.jpg");
  return { body: file as any, encoding: "binary" };
};
