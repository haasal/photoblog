import { Redis } from "ioredis";
import { getEnv } from "./util";
import * as dotenv from "dotenv";

dotenv.config();

export const redis = new Redis(getEnv("REDIS_URI"));
