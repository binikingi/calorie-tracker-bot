import { appConfig } from "./appConfig";
import pg from "pg";

// export const db = postgres(appConfig.DATABASE_URL, {});

export const client = new pg.Client({
  connectionString: appConfig.DATABASE_URL,
  ssl:
    appConfig.NODE_ENV === "production"
      ? {
          rejectUnauthorized: false,
        }
      : false,
});

export async function withConnection<T>(cb: (client: pg.Client) => Promise<T>) {
  await client.connect();
  try {
    const response = await cb(client);
    await client.end();
    return response;
  } catch (error) {
    console.error(error);
  } finally {
    await client.end();
  }
}
