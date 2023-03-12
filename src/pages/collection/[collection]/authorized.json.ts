import type { APIRoute } from "astro";
import { getDatabase, isPrivate } from "../../../lib/mongo";

export const get: APIRoute = async ({ params, url }) => {
  const collectionTitle = params.collection!;

  // get collection from db
  const db = getDatabase(import.meta.env.DB_URI, import.meta.env.DB_NAME);
  const resp = await isPrivate(db, collectionTitle);

  if (!resp) {
    return new Response(
      JSON.stringify({ authorized: false, message: "collection not found" }),
      {
        status: 404,
      }
    );
  }

  if (resp.private) {
    if (!resp.password) {
      throw "no password in private collection";
    }

    const suppliedPassword = url.searchParams.get("password");

    const authorized = resp.password === suppliedPassword;
    const message = authorized ? "client is authorized" : "invalid password";
    return new Response(JSON.stringify({ authorized, message }));
  }

  return new Response(
    JSON.stringify({ authorized: true, message: "collection is public" })
  );
};
