import { appConfig } from "./appConfig";
import pg from "pg";

// export const db = postgres(appConfig.DATABASE_URL, {});

export const client = new pg.Client({
  connectionString: appConfig.DATABASE_URL,
  //   ssl:
  //     appConfig.NODE_ENV === "production"
  //       ? {
  //           rejectUnauthorized: false,
  //         }
  //       : false,
});
