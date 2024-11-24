import { migrate } from "postgres-migrations";
import { client } from "./db";

export async function migrateDb() {
  //   const url = new URL(appConfig.DATABASE_URL);
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
