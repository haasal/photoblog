import type { APIRoute } from "astro";
import { getBucket } from "../../../../lib/bucket";
import mime from "mime-types";
import { getDatabase, getDbImage, ImageResponse } from "../../../../lib/mongo";

export const get: APIRoute = async ({ params, url }) => {
  const imagePath = params.image!;
  const collectionTitle = params.collection!;

  // get image from database
  const db = getDatabase(import.meta.env.DB_URI, import.meta.env.DB_NAME);
  const resp = ImageResponse.parse(
    await getDbImage(db, collectionTitle, imagePath)
  );

  if (!resp) {
    return new Response("image not found", { status: 404 });
  }

  // check image authorization
  if (resp.images[0].private) {
    // TODO: replace this plain text check with hashed password
    if (!resp.password) {
      throw "no password in private collection";
    }

    const suppliedPassword = url.searchParams.get("password");

    if (resp.password != suppliedPassword) {
      return new Response("invalid password", { status: 401 });
    }
  }

  // connect to s3 bucket
  const port = parseInt(import.meta.env.BUCKET_PORT);
  const bucket = getBucket(
    import.meta.env.BUCKET_ENDPOINT,
    port,
    import.meta.env.BUCKET_ACCESS_KEY,
    import.meta.env.BUCKET_SECRET_KEY
  );

  // check mime type for Content-Type
  const mimeType = mime.lookup(imagePath);
  if (!mimeType) {
    return new Response("invalid mime type", { status: 400 });
  }

  // get image from bucket
  let imageStream;
  try {
    imageStream = await bucket.getObject(
      import.meta.env.BUCKET_NAME,
      imagePath
    );
  } catch (err: any) {
    if (err.code == "NoSuchKey") {
      return new Response(`${err.key} not found`, { status: 404 });
    }
    throw err;
  }

  // fetch image into buffer
  const imageChunks = [];
  for await (let chunk of imageStream) {
    imageChunks.push(chunk);
  }

  return new Response(Buffer.concat(imageChunks), {
    headers: { "Content-Type": mimeType },
  });
};
