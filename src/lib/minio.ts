import { Client } from "minio";
import { getEnv } from "./util";
import * as dotenv from "dotenv";

dotenv.config();

let bucketName = getEnv("BUCKET_NAME");

export const bucket = new Client({
  endPoint: getEnv("BUCKET_ENDPOINT"),
  port: parseInt(getEnv("BUCKET_PORT")),
  accessKey: getEnv("BUCKET_ACCESS_KEY"),
  secretKey: getEnv("BUCKET_SECRET_KEY"),
  useSSL: false,
});

export async function getFile(name: string) {
  const buffers = [];
  const stream = await bucket.getObject(bucketName, name);
  for await (const chunk of stream) {
    buffers.push(chunk);
  }
  return Buffer.concat(buffers);
}
