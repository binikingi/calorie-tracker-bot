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
    food_name: string;
    proteing_gram: number;
    fat_gram: number;
    carb_gram: number;
    calorie: number;
  }>(sql`
            SELECT
                food_name,
                proteing_gram,
                fat_gram,
                carb_gram,
                calorie
            FROM account_food_log
            JOIN account ON account_food_log.account_id = account.id
            WHERE whatsapp_number = ${whatsappNumber}
            AND date >= ${fromDate}
            AND date < ${toDate}
        `);

  if (rows.length === 0) {
    return `לא הכנסת עדיין נתונים למערכת לתאריך ${date.format(
      DateTimeFormatter.ofPattern("dd.MM.yyyy")
    )}`;
  }

  const menu = !withMenu
    ? ""
    : `\n*תפריט*\n
${rows
  .map(
    (row) =>
      `✅ *${row.food_name}*\n      חלבון: ${row.proteing_gram.toFixed(
        2
      )} גרם\n      שומן: ${row.fat_gram.toFixed(
        2
      )} גרם\n      פחמימה: ${row.carb_gram.toFixed(
        2
      )}גרם \n      קלוריות: ${row.calorie.toFixed(2)}`
  )
  .join("\n\n")}\n`;

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
