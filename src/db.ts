import { appConfig } from "./appConfig";
import pg from "pg";

export const client = new pg.Client({
  connectionString: appConfig.DATABASE_URL,
  ssl: appConfig.NODE_ENV === "production" ? true : undefined,
});
