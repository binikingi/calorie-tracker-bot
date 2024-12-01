import express from "express";
import {
    isValidPhoneNumber,
    phoneNumberToWhatsAppNumber,
} from "../utils/phoneNumber.utils";
import { Client } from "pg";
import { getAccountDataByWhatsappNumber } from "../account/account.controller";
import { sql } from "@ts-safeql/sql-tag";
import { convert, LocalDateTime } from "@js-joda/core";
import crypto from "crypto";
import { twilioClient } from "../twilio.client";
import { appConfig } from "../appConfig";

export async function handleLogin(
    client: Client,
    req: express.Request,
    res: express.Response
) {
    const phoneNumber = req.body.phoneNumber ?? "";
    if (!isValidPhoneNumber(phoneNumber)) {
        return res.status(400).json({ error: "מספר טלפון לא תקין" });
    }

    const whatsappNumber = phoneNumberToWhatsAppNumber(phoneNumber);
    const accountData = await getAccountDataByWhatsappNumber(
        client,
        whatsappNumber
    );

    let code: string;
    if (accountData === null) {
        const { rows } = await client.query<{ id: number }>(sql`
            INSERT INTO account (whatsapp_number)
            VALUES (${whatsappNumber})
            RETURNING id
        `);
        code = await generateLoginCodeForAccount(client, rows[0].id);
    } else {
        code = await generateLoginCodeForAccount(client, accountData.accountId);
    }

    await twilioClient.messages.create({
        to: `whatsapp:+${whatsappNumber}`,
        from: appConfig.TWILIO_SENDER_NUMBER,
        contentSid: "HX3137aadc80ea83ace46a088f9f38fb28",
        contentVariables: JSON.stringify({ 1: code }),
    });

    return res.status(200).json({ code });
}

export async function handleCodeVerification(
    client: Client,
    req: express.Request,
    res: express.Response
) {
    const whatsappNumber = phoneNumberToWhatsAppNumber(
        req.body.phoneNumber ?? ""
    );
    const code = req.body.code ?? "";

    const { rows } = await client.query<{ id: number }>(sql`
        SELECT account.id
        FROM login_code
        JOIN account ON account.id = login_code.account_id
        WHERE account.whatsapp_number = ${whatsappNumber}
        AND login_code.code = ${code}
        AND created_at > ${convert(
            LocalDateTime.now().minusMinutes(5)
        ).toDate()}
        LIMIT 1
    `);

    if (rows.length === 0) {
        return res.status(400).json({ error: "קוד לא תקין או שעבר הזמן" });
    }

    // delete login codes for this account
    await client.query(sql`
        DELETE FROM login_code
        WHERE account_id = ${rows[0].id}
    `);

    const token = await generateTokenForAccount(client, rows[0].id);
    return res.status(200).json({ token, id: rows[0].id });
}

export async function handleLogout(
    client: Client,
    req: express.Request,
    res: express.Response
) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return;
    }
    if (authHeader.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        await client.query(sql`
            DELETE FROM account_token
            WHERE token = ${token}
        `);
    }

    res.sendStatus(200);
}

async function generateLoginCodeForAccount(
    client: Client,
    accountId: number
): Promise<string> {
    // generate a code of 6 digits
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await client.query(sql`
        INSERT INTO login_code (account_id, code, created_at)
        VALUES (${accountId}, ${code}, ${convert(LocalDateTime.now()).toDate()})
    `);
    return code;
}

async function generateTokenForAccount(
    client: Client,
    id: number
): Promise<string> {
    let token: string;
    let isExists = false;
    do {
        // generate a 64 character token
        token = crypto.randomBytes(64).toString("hex");
        const { rowCount } = await client.query<{ exists: boolean }>(sql`
            SELECT true as exists
            FROM account_token
            WHERE token = ${token}
        `);
        isExists = rowCount !== null && rowCount > 0;
    } while (isExists);
    await client.query(sql`
        INSERT INTO account_token (account_id, token, created_at)
        VALUES (${id}, ${token}, ${convert(LocalDateTime.now()).toDate()})
    `);

    return token;
}
