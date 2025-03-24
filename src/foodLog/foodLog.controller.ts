import { convert, DateTimeFormatter, LocalDate } from "@js-joda/core";
import { Client } from "pg";
import { sql } from "@ts-safeql/sql-tag";

export async function getFormattedLogMessageByDate(
    client: Client,
    whatsappNumber: string,
    date: LocalDate,
    withMenu: boolean
) {
    const fromDate = convert(date.atStartOfDay()).toDate();
    const toDate = convert(date.plusDays(1).atStartOfDay()).toDate();

    const { rows } = await client.query<{
        name: string;
        proteing_gram: number;
        fat_gram: number;
        carb_gram: number;
        calorie: number;
    }>(sql`
            SELECT
                food_name as name,
                proteing_gram,
                fat_gram,
                carb_gram,
                calorie
            FROM account_food_log
            JOIN account ON account_food_log.account_id = account.id
            WHERE whatsapp_number = ${whatsappNumber}
            AND date >= ${fromDate}
            AND date < ${toDate}
            AND removed_at IS NULL
        `);

    if (rows.length === 0) {
        return `לא הכנסת עדיין נתונים למערכת לתאריך ${date.format(
            DateTimeFormatter.ofPattern("dd.MM.yyyy")
        )}`;
    }

    const menu = !withMenu
        ? ""
        : `\n*תפריט*\n
${rows.map(getFoodDescriptionText).join("\n\n")}\n`;

    return `
*סיכום תאריך ${date.format(DateTimeFormatter.ofPattern("dd.MM.yyyy"))} ${
        LocalDate.now().equals(date) ? "(היום)" : ""
    }*
${menu}
🥛 סה״כ חלבון: ${rows
        .reduce((acc, curr) => acc + curr.proteing_gram, 0)
        .toFixed(2)} גרם
🥜 סה״כ שומן: ${rows
        .reduce((acc, curr) => acc + curr.fat_gram, 0)
        .toFixed(2)} גרם
🥐 סה״כ פחמימה: ${rows
        .reduce((acc, curr) => acc + curr.carb_gram, 0)
        .toFixed(2)} גרם
✅ *סה״כ קלוריות: ${rows
        .reduce((acc, curr) => acc + curr.calorie, 0)
        .toFixed(2)}*`;
}

export function getFoodDescriptionText(food: {
    name: string;
    proteing_gram: number;
    fat_gram: number;
    carb_gram: number;
    calorie: number;
}): string {
    return `✅ *${food.name}*\n🥛 חלבון: ${food.proteing_gram.toFixed(
        2
    )} גרם\n🥜 שומן: ${food.fat_gram.toFixed(
        2
    )} גרם\n🥐 פחמימה: ${food.carb_gram.toFixed(
        2
    )} גרם \n📊 קלוריות: ${food.calorie.toFixed(2)}\n`;
}
