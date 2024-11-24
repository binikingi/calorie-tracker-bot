import { migrate } from "postgres-migrations";
import { client } from "./db";

export async function connectDb() {
  await client.connect();
}

export async function migrateDb() {
  await migrate({ client }, "./migrations");
}
