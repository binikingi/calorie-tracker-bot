import { Client } from "pg";
import {
    ActionContext,
    ActionContextHanlderResult,
    ActionContextName,
} from "./actionContext.types";
import { sql } from "@ts-safeql/sql-tag";
import { convert, Duration, Instant } from "@js-joda/core";
import { actionContextHandlers } from "./handlers/actionContextHandlers";

export async function getAccountActionContext(
    client: Client,
    accountId: number
): Promise<{ context: ActionContext[ActionContextName]; id: number } | null> {
    const now = Instant.now();
    const { rows } = await client.query<{
        id: number;
        context: ActionContext[ActionContextName];
    }>(sql`
        SELECT id, context
        FROM account_action_context
        WHERE account_id = ${accountId}
        AND disabled_at IS NULL
        AND expiry_date > ${convert(now).toDate()}
        ORDER BY created_at DESC
        LIMIT 1
    `);
    if (rows.length === 0) {
        return null;
    }
    return {
        context: rows[0].context as ActionContext[ActionContextName],
        id: rows[0].id,
    };
}

export async function createAccountActionContext<T extends ActionContextName>(
    client: Client,
    accountId: number,
    context: ActionContext[T]
) {
    const now = convert(Instant.now()).toDate();
    const expiry = convert(Instant.now().plus(Duration.ofMinutes(5))).toDate();
    const { rows } = await client.query<{ id: number }>(sql`
        INSERT INTO account_action_context (account_id, action_name, context, created_at, expiry_date, disabled_at)
        VALUES (${accountId}, ${context.type as string}, ${
        context as unknown
    }::JSONB, ${now}, ${expiry}, NULL)
    RETURNING id
    `);
    return rows[0].id;
}

export async function clearAccountActionContext(
    client: Client,
    accountId: number
) {
    const now = convert(Instant.now()).toDate();
    await client.query(sql`
        UPDATE account_action_context
        SET disabled_at = ${now}
        WHERE account_id = ${accountId}
        AND disabled_at IS NULL
        AND expiry_date > ${now}
    `);
}

export async function handleActionContext(
    client: Client,
    accountId: number,
    currentContextId: number,
    currentActionContext: ActionContext[ActionContextName],
    message: string
): Promise<ActionContextHanlderResult> {
    const handler = actionContextHandlers[currentActionContext.type];
    if (!handler) {
        return ActionContextHanlderResult.nothingToHandle();
    }
    try {
        const args = handler.validateArgs(message);
        return await handler.handler({
            client,
            accountId,
            currentContextId,
            currentActionContext,
            args,
        });
    } catch {
        return ActionContextHanlderResult.nothingToHandle();
    }
}
