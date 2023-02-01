import type { Document } from "mongodb";
import { db } from "./mongo";

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

export async function getImage(title:string) {
  return await db.collection("images").findOne({title: title})
}