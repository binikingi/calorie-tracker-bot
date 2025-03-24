import { z } from "zod";
import { createActionContextHandler } from "./createActionContextHandler";
import { ActionContextHanlderResult } from "../actionContext.types";
import { twilioClient } from "../../twilio.client";
import { getAccountDataById } from "../../account/account.controller";
import { getNotRegisteredMessage } from "../../messages/messages.controller";
import { appConfig } from "../../appConfig";
import { sql } from "@ts-safeql/sql-tag";

export const removeHandler = createActionContextHandler(
    "remove",
    (message: string): z.infer<typeof RemoveVariableSchema> => {
        const params = Object.fromEntries([...new URLSearchParams(message)]);
        return RemoveVariableSchema.parse(params);
    },
    async ({
        accountId,
        client,
        currentContextId,
        currentActionContext,
        args,
    }) => {
        if (args.context !== currentContextId) {
            return ActionContextHanlderResult.sendText(
                "הפעולה שבחרת כבר אינה זמינה!"
            );
        }
        const accountData = await getAccountDataById(client, accountId);
        if (accountData === null) {
            return ActionContextHanlderResult.sendText(
                getNotRegisteredMessage()
            );
        }
        switch (args.action) {
            case "nextPage": {
                const { contentSid, contentVariables } =
                    getContentAndVariablesForFoodLogRemoval(
                        currentContextId,
                        currentActionContext.foodLogState,
                        args.nextPage
                    );
                await twilioClient.messages.create({
                    to: `whatsapp:+${accountData.whatsappNumber}`,
                    from: appConfig.TWILIO_SENDER_NUMBER,
                    contentSid: contentSid,
                    contentVariables: JSON.stringify(contentVariables),
                });
                return ActionContextHanlderResult.handled();
            }
            case "remove": {
                await client.query(sql`
                    UPDATE account_food_log
                    SET removed_at = NOW()
                    WHERE id = ${args.id}
                    AND account_id = ${accountId}
                `);
                return ActionContextHanlderResult.sendText(
                    "הפריט נמחק בהצלחה!"
                );
            }
        }
    }
);

const RemoveVariableSchema = z.union([
    z.object({
        action: z.literal("remove"),
        id: z
            .string()
            .refine((id) => !isNaN(Number(id)), {
                message: "id must be a number",
            })
            .transform((id) => Number(id)),
        context: z
            .string()
            .refine((context) => !isNaN(Number(context)), {
                message: "context must be a number",
            })
            .transform((id) => Number(id)),
    }),
    z.object({
        action: z.literal("nextPage"),
        context: z
            .string()
            .refine((context) => !isNaN(Number(context)), {
                message: "context must be a number",
            })
            .transform((x) => Number(x)),
        nextPage: z
            .string()
            .refine((nextPage) => !isNaN(Number(nextPage)), {
                message: "nextPage must be a number",
            })
            .transform((x) => Number(x)),
    }),
]);

export function getContentAndVariablesForFoodLogRemoval(
    actionId: number,
    foodLogs: { id: number; name: string }[],
    pageNum: number
): { contentVariables: Record<string, string>; contentSid: string } {
    const startIndex = pageNum * 4;
    const endIndex = startIndex + 4;
    const batch = foodLogs.slice(startIndex, endIndex);
    let showNextPage = false;
    if (foodLogs[endIndex] && !foodLogs[endIndex + 1]) {
        // last batch should append the last element to the batch
        batch.push(foodLogs[endIndex]);
    } else if (foodLogs[endIndex] && foodLogs[endIndex + 1]) {
        // not the last batch should add option for next page on the content variables
        showNextPage = true;
    }
    const contentVariables: Record<string, string> = {};
    batch.forEach((food, index) => {
        contentVariables[`item_name_${index + 1}`] = food.name;
        contentVariables[
            `item_id_${index + 1}`
        ] = `action=remove&context=${actionId}&id=${food.id}`;
    });
    if (showNextPage) {
        contentVariables[`item_name_${batch.length + 1}`] = "תראה עוד";
        contentVariables[
            `item_id_${batch.length + 1}`
        ] = `action=nextPage&context=${actionId}&nextPage=${pageNum + 1}`;
    }
    return {
        contentSid: removeTemplates[batch.length + (showNextPage ? 1 : 0)],
        contentVariables,
    };
}
const removeTemplates: Record<number, string> = {
    1: "HXd6f80f657248d21df8f0b37307d01f72",
    2: "HX15cffd3911863e24db860c7b4c49722a",
    3: "HX11119e1b8cbafd3942a12bf7ce9692b9",
    4: "HX2149066ac25815da11be7deaf74396b3",
    5: "HX20f7eb4372db7d39bdc4db4fb5b6fbdb",
};
