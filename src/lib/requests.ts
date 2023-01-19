import type { Document } from "mongodb";
import { db } from "./mongo";
import { redis } from "./redis";
import { getFile } from "./minio";

export async function getSerie(title: string): Promise<Document> {
  const cursor = db.collection("series").aggregate([
    { $match: { title: title } },
    {
      $lookup: {
        from: "images",
        localField: "images",
        foreignField: "_id",
        as: "images",
      },
    },
  ]);

  return cursor.toArray();
}

export async function getFileCached(file: string) {
  let buf = await redis.getBuffer(file);

  if (!buf) {
    console.log("File not cached");
    buf = await getFile(file);
    if (!buf) {
      throw "File does not exists";
    }
    // fire and forget
    redis.setex(file, 3600, buf);
  }

  return buf;
}
