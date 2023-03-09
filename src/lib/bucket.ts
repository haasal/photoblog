import minio, { Client } from "minio";

let bucket: Client | undefined = undefined;

export function getBucket(
  endPoint: string,
  port: number,
  accessKey: string,
  secretKey: string
): Client {
  if (!bucket) {
    try {
      bucket = new minio.Client({
        endPoint: endPoint,
        port,
        useSSL: false,
        accessKey,
        secretKey,
      });
    } catch (err) {
      throw Error("couldn't connect to bucket:" + err);
    }
  }

  return bucket;
}
