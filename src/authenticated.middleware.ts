import express from "express";
import { client } from "./db";
import { sql } from "@ts-safeql/sql-tag";

export async function authenticated(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) {
    const authHeader = req.headers.authorization;
    if (authHeader === undefined || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "אין הרשאה" });
        return;
    }
    const token = authHeader.split(" ")[1];
    if (!token || token.trim() === "") {
        res.status(401).json({ error: "אין הרשאה" });
        return;
    }

    const { rows } = await client.query<{
        token: string;
        account_id: number;
        created_at: Date;
    }>(sql`
        SELECT *
        FROM account_token
        WHERE token = ${token}
    `);

    if (rows.length === 0) {
        res.status(401).json({ error: "אין הרשאה" });
        return;
    }

    req.accountId = rows[0].account_id;
    next();
}
