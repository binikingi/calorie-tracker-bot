import { convert, LocalDate, nativeJs } from "@js-joda/core";
import { sql } from "@ts-safeql/sql-tag";
import { Client } from "pg";

export async function getAccountDataByWhatsappNumber(
    client: Client,
    whatsappNumber: string
) {
    const { rows } = await client.query<{
        id: number;
        whatsapp_number: string;
        weight: number | null;
        height: number | null;
        year_of_birth: number | null;
        gender: string | null;
    }>(sql`
        SELECT *
        FROM account
        WHERE whatsapp_number = ${whatsappNumber}
    `);

    if (rows.length === 0) {
        return null;
    }

    return {
        accountId: rows[0].id,
        weight: rows[0].weight,
        height: rows[0].height,
        yearOfBirth: rows[0].year_of_birth,
        gender: rows[0].gender,
        whatsappNumber: rows[0].whatsapp_number,
    };
}

export async function getAccountDataById(client: Client, id: number) {
    const { rows } = await client.query<{
        id: number;
        whatsapp_number: string;
        weight: number | null;
        height: number | null;
        year_of_birth: number | null;
        gender: string | null;
    }>(sql`
          SELECT *
          FROM account
          WHERE id = ${id}
      `);

    if (rows.length === 0) {
        return null;
    }

    const account = rows[0];
    let calorieIntake: number | null = null;
    const age =
        account.year_of_birth !== null
            ? new Date().getFullYear() - account.year_of_birth
            : null;
    if (
        account.gender !== null &&
        account.height !== null &&
        account.weight !== null &&
        age !== null
    ) {
        calorieIntake =
            account.gender === "גבר"
                ? Math.round(
                      10 * account.weight + 6.25 * account.height - 5 * age + 5
                  )
                : Math.round(
                      10 * account.weight +
                          6.25 * account.height -
                          5 * age -
                          161
                  );
    }

    return {
        accountId: rows[0].id,
        weight: rows[0].weight,
        height: rows[0].height,
        yearOfBirth: rows[0].year_of_birth,
        gender: rows[0].gender,
        whatsappNumber: rows[0].whatsapp_number,
        calorieIntake: calorieIntake,
    };
}

export async function getAccountIdByWhatsappNumber(
    client: Client,
    whatsappNumber: string
): Promise<number | null> {
    const { rows } = await client.query<{ id: number }>(sql`
      SELECT id
      FROM account
      WHERE whatsapp_number = ${whatsappNumber}
    `);

    if (rows.length === 0) {
        return null;
    }
    return rows[0].id;
}

export async function updateAccountDetailById(
    client: Client,
    accountId: number,
    data: {
        weight?: number | undefined;
        height?: number | undefined;
        yearOfBirth?: number | undefined;
        gender?: "גבר" | "אישה" | undefined;
    }
) {
    await client.query(sql`
    UPDATE account
    SET weight = CASE WHEN ${data.weight !== undefined} THEN ${
        data.weight ?? null
    } ELSE weight END,
        height = CASE WHEN ${data.height !== undefined} THEN ${
        data.height ?? null
    } ELSE height END,
        year_of_birth = CASE WHEN ${data.yearOfBirth !== undefined} THEN ${
        data.yearOfBirth ?? null
    } ELSE year_of_birth END,
    gender = CASE WHEN ${data.gender !== undefined} THEN ${data.gender ?? null}
        ELSE gender END
    WHERE id = ${accountId}
    `);
}

export async function getAccountDailyTrack(
    client: Client,
    accountId: number,
    parseLocalDateResult: LocalDate
) {
    const { rows } = await client.query<{
        id: number;
        account_id: number;
        food_name: string;
        date: Date;
        proteing_gram: number;
        fat_gram: number;
        carb_gram: number;
        calorie: number;
        removed_at: Date | null;
    }>(sql`
        SELECT *
        FROM account_food_log
        WHERE account_id = ${accountId}
        AND date = ${convert(parseLocalDateResult).toDate()}
        AND removed_at IS NULL
    `);

    let totalCalories = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;

    for (const row of rows) {
        totalCalories += row.calorie;
        totalProtein += row.proteing_gram;
        totalFat += row.fat_gram;
        totalCarbs += row.carb_gram;
    }

    return {
        totalCalories,
        totalProtein,
        totalFat,
        totalCarbs,
    };
}

export async function getAcountCalorieTrackBetweenDates(
    client: Client,
    accountId: number,
    parseLocalDateFromResult: LocalDate,
    parseLocalDateToResult: LocalDate
) {
    const rows = await client.query<{
        date: Date;
        calories: number | null;
    }>(sql`
        SELECT date, SUM(calorie)::FLOAT as calories
        FROM account_food_log
        WHERE account_id = ${accountId}
        AND date >= ${convert(parseLocalDateFromResult).toDate()}
        AND date <= ${convert(parseLocalDateToResult).toDate()}
        AND removed_at IS NULL
        GROUP BY date
    `);

    const map = new Map<string, number>(
        rows.rows.map((row) => [
            nativeJs(row.date).toLocalDate().toString(),
            row.calories ?? 0,
        ])
    );

    const result: { date: LocalDate; calories: number }[] = [];
    for (
        let date = parseLocalDateFromResult;
        !date.isAfter(parseLocalDateToResult);
        date = date.plusDays(1)
    ) {
        result.push({
            date,
            calories: map.get(date.toString()) ?? 0,
        });
    }

    return result;
}

export async function getAccountMenusFromDate(
    client: Client,
    accountId: number,
    fromDate: LocalDate
) {
    const { rows } = await client.query<{
        date: Date;
        total_calories: number | null;
        total_protein: number | null;
        total_fat: number | null;
        total_carbs: number | null;
    }>(sql`
            SELECT
                date,
                SUM(calorie)::FLOAT as total_calories,
                SUM(proteing_gram)::FLOAT as total_protein,
                SUM(fat_gram)::FLOAT as total_fat,
                SUM(carb_gram)::FLOAT as total_carbs
            FROM account_food_log
            WHERE account_id = ${accountId}
            AND date <= ${convert(fromDate).toDate()}
            AND date >= ${convert(fromDate.minusDays(10)).toDate()}
            AND removed_at IS NULL
            GROUP BY date
            ORDER BY date DESC
    `);

    if (rows.length === 0) {
        return {
            menus: [],
            nextDatePage: null,
        };
    }

    const lowesDate = nativeJs(rows[rows.length - 1].date).toLocalDate();
    const { rows: nextDateRows } = await client.query<{ date: Date }>(sql`
        SELECT date
        FROM account_food_log
        WHERE date < ${convert(lowesDate).toDate()}
        AND removed_at IS NULL
        ORDER BY date DESC
        LIMIT 1
    `);

    const nextDatePage =
        nextDateRows.length > 0
            ? nativeJs(nextDateRows[0].date).toLocalDate()
            : null;

    return {
        menus: rows.map((row) => ({
            date: nativeJs(row.date).toLocalDate(),
            totalCalories: row.total_calories ?? 0,
            totalProtein: row.total_protein ?? 0,
            totalFat: row.total_fat ?? 0,
            totalCarbs: row.total_carbs ?? 0,
        })),
        nextDatePage,
    };
}

export async function getAccountMenuForDate(
    client: Client,
    accountId: number,
    date: LocalDate
) {
    const { rows } = await client.query<{
        id: number;
        account_id: number;
        food_name: string;
        date: Date;
        proteing_gram: number;
        fat_gram: number;
        carb_gram: number;
        calorie: number;
        removed_at: Date | null;
    }>(sql`
        SELECT *
        FROM account_food_log
        WHERE account_id = ${accountId}
        AND date = ${convert(date).toDate()}
        AND removed_at IS NULL
    `);

    return rows.map((row) => ({
        id: row.id,
        name: row.food_name,
        fat: row.fat_gram,
        protein: row.proteing_gram,
        carbs: row.carb_gram,
        calories: row.calorie,
    }));
}
