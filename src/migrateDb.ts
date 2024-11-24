import { migrate } from "postgres-migrations";
import { appConfig } from "./appConfig";
import pg from "pg";

export async function migrateDb() {
  //   const url = new URL(appConfig.DATABASE_URL);

  const client = new pg.Client({
    connectionString: appConfig.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
  await client.connect();
  try {
    await migrate({ client }, "./migrations");
  } finally {
    await client.end();
  }
  //   await migrate(
  //     {
  //       database: url.pathname.substr(1),
  //       user: url.username,
  //       password: url.password,
  //       host: url.hostname,
  //       port: parseInt(url.port, 10),
  //       client,
  //     },
  //     "./migrations"
  //   );
}
