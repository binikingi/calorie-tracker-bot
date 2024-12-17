import { sql } from "@ts-safeql/sql-tag";
import { Client } from "pg";

export async function logMessage(
    client: Client,
    params: {
        from: string;
        to: string;
        body: string | null;
        mediaUrl: string | null;
        direction: "IN" | "OUT";
    }
) {
    await client.query(sql`
    INSERT INTO message_log ("from", "to", body, media_url, direction)
    VALUES (${params.from}, ${params.to}, ${params.body}, ${params.mediaUrl}, ${params.direction})
`);
}
