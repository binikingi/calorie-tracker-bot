import { migrate } from "postgres-migrations";
import { appConfig } from "./appConfig";

export async function migrateDb() {
  const url = new URL(appConfig.DATABASE_URL);

  await migrate(
    {
      database: url.pathname.substr(1),
      user: url.username,
      password: url.password,
      host: url.hostname,
      port: parseInt(url.port, 10),
    },
    "./migrations"
  );
}
