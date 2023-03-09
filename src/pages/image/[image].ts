import type { APIRoute } from "astro";
import { getBucket } from "../../lib/bucket";
import mime from "mime-types";

export const get: APIRoute = async ({ params }) => {
  const port = parseInt(import.meta.env.BUCKET_PORT);
  const bucket = getBucket(
    import.meta.env.BUCKET_ENDPOINT,
    port,
    import.meta.env.BUCKET_ACCESS_KEY,
    import.meta.env.BUCKET_SECRET_KEY
  );

  const mimeType = mime.lookup(params.image!);
  if (!mimeType) {
    return new Response("invalid mime type", { status: 400 });
  }

  let imageStream;
  try {
    imageStream = await bucket.getObject(
      import.meta.env.BUCKET_NAME,
      params.image!
    );
  } catch (err: any) {
    if (err.code == "NoSuchKey") {
      return new Response(`${err.key} not found`, { status: 404 });
    }
    throw err;
  }

  const imageChunks = [];
  for await (let chunk of imageStream) {
    imageChunks.push(chunk);
  }

  return new Response(Buffer.concat(imageChunks), {
    headers: { "Content-Type": mimeType },
  });
};
