import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";

dotenv.config();

const uri = process.env.DB_URI!;
if (uri == undefined) {
  throw Error("DB_URI not set in environment");
}

const dbName = process.env.DB_NAME!;
if (dbName == undefined) {
  throw Error("DB_NAME not set in environment");
}

export const db = new MongoClient(uri).db(dbName);
