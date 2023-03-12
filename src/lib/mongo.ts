import { Db, MongoClient } from "mongodb";
import { z } from "zod";

let database: Db | undefined = undefined;
const imageCollection = import.meta.env.PUBLIC_DB_COLLECTION_NAME;

export const ImageResponse = z
  .object({
    password: z.string().optional(),
    images: z
      .object({
        private: z.boolean(),
        path: z.string(),
        title: z.string(),
      })
      .array()
      .length(1),
  })
  .nullable();

export const PrivateResponse = z
  .object({
    password: z.string(),
    private: z.boolean(),
  })
  .nullable();

export function getDatabase(dbUri: string, dbName: string) {
  if (!database) {
    console.log("Connecting to mongo");
    database = new MongoClient(dbUri).db(dbName);
  }

  return database;
}

function getCollection(database: Db, collection: string) {
  return database.collection(collection);
}

export async function getDbImage(
  database: Db,
  collectionTitle: string,
  imageTitle: string
) {
  const filter = { title: collectionTitle, "images.path": imageTitle };
  const project = { "images.$": 1, password: 1 };
  const cursor = getCollection(database, imageCollection)
    .find(filter)
    .project(project);
  return await cursor.next();
}

export async function isPrivate(database: Db, collectionTitle: string) {
  const cursor = database.collection(imageCollection).aggregate([
    {
      $match: { title: collectionTitle },
    },
    {
      $project: {
        _id: 0,
        password: { $ifNull: ["$password", ""] },
        private: {
          $in: [true, "$images.private"],
        },
      },
    },
  ]);

  return await PrivateResponse.parseAsync(await cursor.next());
}
