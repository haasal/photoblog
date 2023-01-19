import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import { getEnv } from "./util";

dotenv.config();

export const db = new MongoClient(getEnv("DB_URI")).db(getEnv("DB_NAME"));
