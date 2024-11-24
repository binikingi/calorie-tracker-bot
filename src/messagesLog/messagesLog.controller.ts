import { sql } from "@ts-safeql/sql-tag";
import { Client } from "pg";

export async function logMessage(
  client: Client,
  params: {
    from: string;
    to: string;
    body: string;
    direction: "IN" | "OUT";
  }
) {
  await client.query(sql`
    INSERT INTO message_log ("from", "to", body, direction)
    VALUES (${params.from}, ${params.to}, ${params.body}, ${params.direction})
`);
}
