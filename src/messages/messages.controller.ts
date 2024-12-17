import { convert, Instant, LocalDate, ZoneId } from "@js-joda/core";
import { getFormattedLogMessageByDate } from "../foodLog/foodLog.controller";
import { Message } from "./messages.interfaces";
import "@js-joda/timezone";
import { getNutritionValues } from "../gpt/gpt.controller";
import { Client } from "pg";
import { sql } from "@ts-safeql/sql-tag";
import {
    getAccountDataByWhatsappNumber,
    getAccountIdByWhatsappNumber,
} from "../account/account.controller";

export async function handleIncomingMessage(
    client: Client,
    message: Message
): Promise<string> {
    if (message.Body === "הרשמה") {
        return handleRegistration(client, message);
    }
    const accountId = await getAccountIdByWhatsappNumber(client, message.WaId);
    if (accountId === null) {
        return getNotRegisteredMessage();
    }
    if (message.Body.trim() === "?" || message.Body.trim() === "עזרה") {
        return handleDisplayHelp();
    }
    if (
        message.Body === "תראה" ||
        message.Body === "!" ||
        message.Body === "תפריט" ||
        message.Body.startsWith("תראה ") ||
        message.Body.startsWith("! ") ||
        message.Body.startsWith("תפריט ")
    ) {
        return handleShowSummaryMessage(
            client,
            message,
            message.Body.startsWith("תפריט")
        );
    }

    if (message.Body.startsWith("הוסף ")) {
        return handleLogFood(client, message);
    }

    if (message.Body.startsWith("בדוק ")) {
        return handleCheckFoodNutritionValues(client, message.Body);
    }

    if (
        message.Body === "משקל" ||
        message.Body === "גובה" ||
        message.Body === "שנת לידה" ||
        message.Body === "מגדר" ||
        message.Body.startsWith("משקל ") ||
        message.Body.startsWith("גובה ") ||
        message.Body.startsWith("מגדר ") ||
        message.Body.startsWith("שנת לידה ")
    ) {
        return await handleAccountMeasures(client, message);
    }

    if (message.Body === "חשב") {
        return await handleCalculateDailyCalories(client, message);
    }

    return "אני לא מבין אותך, שלח '?' לעזרה";
}

async function handleShowSummaryMessage(
    client: Client,
    message: Message,
    withMenu: boolean
) {
    if (
        message.Body === "תראה" ||
        message.Body === "!" ||
        message.Body === "תפריט"
    ) {
        return await getFormattedLogMessageByDate(
            client,
            message.WaId,
            Instant.now().atZone(ZoneId.of("Asia/Jerusalem")).toLocalDate(),
            withMenu
        );
    }

    const [, variable] = message.Body.split(" ");
    if (variable === "אתמול") {
        return await getFormattedLogMessageByDate(
            client,
            message.WaId,
            Instant.now()
                .atZone(ZoneId.of("Asia/Jerusalem"))
                .toLocalDate()
                .minusDays(1),
            withMenu
        );
    }
    if (variable === "שלשום") {
        return await getFormattedLogMessageByDate(
            client,
            message.WaId,
            Instant.now()
                .atZone(ZoneId.of("Asia/Jerusalem"))
                .toLocalDate()
                .minusDays(2),
            withMenu
        );
    }

    return await getFormattedLogMessageByDate(
        client,
        message.WaId,
        getDateFromText(variable),
        withMenu
    );
}

function getDateFromText(text: string) {
    const dateParts = text.split(".");
    return LocalDate.of(
        parseInt(
            dateParts.length === 3
                ? dateParts[2]
                : LocalDate.now().year().toString(),
            10
        ),
        parseInt(dateParts[1], 10),
        parseInt(dateParts[0], 10)
    );
}

async function handleDisplayHelp() {
    const message = `
כך תוכל להשתמש בי:

☑️ כדי *לתעד מאכל שצרכת*:
 רשום ״*הוסף*״ + מה אכלת וכמה אכלת
לדוגמא:
 ״הוסף 100 גרם אורז לבן״ 
➖➖➖➖➖➖➖➖➖➖
🔍 כדי לבדוק *שווי קלוריות*:
רשום ״*בדוק*״ 
לדוגמא: 
״בדוק 100 גרם אורז לבן״
➖➖➖➖➖➖➖➖➖➖
📄 כדי *להציג סיכום יומי*: 
רשום ״*תראה*״ או ״!״
➖➖➖➖➖➖➖➖➖➖
📅 כדי *לצפות בתאריך אחר*:
רשום ״*תראה*״ + תאריך
לדוגמא:
 ״תראה 17.11״
➖➖➖➖➖➖➖➖➖➖
🍽️ כדי לראות פירוט של כל *התפריט שאכלת*:
 רשום ״*תפריט*״ או ״*תפריט*״ + תאריך
לדוגמה:
 ״תפריט 21.11״
➖➖➖➖➖➖➖➖➖➖
🪪 כדי *לעדכן* משקל/גובה/שנת לידה/מגדר 
רשום ״משקל״ + המשקל שלך
לדוגמה:
 ״משקל 62״ או ״גובה 157״ או ״שנת לידה 1990״ או ״מגדר גבר״
➖➖➖➖➖➖➖➖➖➖
⚖️ כדי לחשב *צריכת קלוריות יומית*:
רשום ״חשב״

*חשוב לדעת*❗
אם המטרה היא:
* לשמור על המשקל הקיים - יש לצרוך *בדיוק* את המספר שקיבלת
* אם המטרה לעלות במשקל - יש לצרוך *יותר*
* אם המטרה לרדת במשקל - יש לצרוך *פחות*
➖➖➖➖➖➖➖➖➖➖
🌐 כדי לצפות בכל התהליך שלך: eatbot.binib.co
❓בכל שלב ניתן להקיש ״?״ לכדי לצפות בדף זה.
`;
    return message;
}

async function handleRegistration(client: Client, message: Message) {
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
    WHERE whatsapp_number = ${message.WaId}
    `);
    if (rows.length > 0) {
        return `אתה כבר רשום למערכת, שלח '?' לעזרה`;
    } else {
        await client.query(sql`
        INSERT INTO account (whatsapp_number)
        VALUES (${message.WaId})
    `);

        return "ברוכים הבאים ל-EatBot\nנרשמת בהצלחה למערכת, שלח '?' לעזרה";
    }
}

async function handleLogFood(
    client: Client,
    message: Message
): Promise<string> {
    const clearedMessage = message.Body.replace("הוסף", "").trim();
    const nowLocalDate = Instant.now()
        .atZone(ZoneId.of("Asia/Jerusalem"))
        .toLocalDate();
    const date = convert(nowLocalDate).toDate();
    const accountId = await getAccountIdByWhatsappNumber(client, message.WaId);
    if (accountId === null) {
        // This means the user is not registered
        return "אתה צריך להירשם למערכת קודם, שלח 'הרשמה'";
    }
    const foods = clearedMessage.split(",").map((food) => food.trim());
    const { rows } = await client.query<{
        id: number;
        name: string;
        proteing_gram: number;
        fat_gram: number;
        carb_gram: number;
        calorie: number;
    }>(sql`
    SELECT *
    FROM food_dictionary
    WHERE name = ANY(${foods})
  `);

    for (const row of rows) {
        await insertFoodLog(client, accountId, {
            calorie: row.calorie,
            carbGram: row.carb_gram,
            date: date,
            fatGram: row.fat_gram,
            foodName: row.name,
            proteingGram: row.proteing_gram,
        });
    }

    const foundFoods = rows.map((row) => row.name);
    const leftOverFoods = foods.filter(
        (food) => !foundFoods.includes(food.trim())
    );

    if (leftOverFoods.length > 0) {
        const nutritionValues = await getNutritionValues(
            leftOverFoods.join(", ")
        );

        for (const food of nutritionValues.data) {
            if (
                food.calories === null ||
                food.carbGrams === null ||
                food.fatGrams === null ||
                food.proteinGrams === null
            ) {
                continue;
            }
            foundFoods.push(food.name);
            await insertFoodDictionary(client, {
                name: food.name,
                calorie: food.calories,
                carbGram: food.carbGrams,
                fatGram: food.fatGrams,
                proteingGram: food.proteinGrams,
            });
            await insertFoodLog(client, accountId, {
                calorie: food.calories,
                carbGram: food.carbGrams,
                date: date,
                fatGram: food.fatGrams,
                foodName: food.name,
                proteingGram: food.proteinGrams,
            });
        }
    }

    return `הוספתי:
${foundFoods.join(", ")}
סיכום יומי:
${await getFormattedLogMessageByDate(
    client,
    message.WaId,
    nowLocalDate,
    false
)}`;
}

async function insertFoodLog(
    client: Client,
    accountId: number,
    params: {
        foodName: string;
        date: Date;
        proteingGram: number;
        fatGram: number;
        carbGram: number;
        calorie: number;
    }
) {
    await client.query(sql`
    INSERT INTO account_food_log (
      account_id,
      food_name,
      date,
      proteing_gram,
      fat_gram,
      carb_gram,
      calorie
    ) VALUES (
      ${accountId},
      ${params.foodName},
      ${params.date},
      ${params.proteingGram},
      ${params.fatGram},
      ${params.carbGram},
      ${params.calorie}
    )
  `);
}

async function insertFoodDictionary(
    client: Client,
    params: {
        name: string;
        calorie: number | null;
        carbGram: number | null;
        fatGram: number | null;
        proteingGram: number | null;
    }
): Promise<number> {
    const { rows } = await client.query<{ id: number }>(sql`
    INSERT INTO food_dictionary (
      name,
      calorie,
      carb_gram,
      fat_gram,
      proteing_gram
    ) VALUES (
      ${params.name},
      ${params.calorie},
      ${params.carbGram},
      ${params.fatGram},
      ${params.proteingGram}
    )
    RETURNING id
  `);

    return rows[0].id;
}

async function handleCheckFoodNutritionValues(
    client: Client,
    Body: string
): Promise<string> {
    const clearedName = Body.replace("בדוק", "").trim();
    const foods = clearedName.split(",").map((food) => food.trim());
    const { rows } = await client.query<{
        id: number;
        name: string;
        proteing_gram: number;
        fat_gram: number;
        carb_gram: number;
        calorie: number;
    }>(sql`
    SELECT *
    FROM food_dictionary
    WHERE name = ANY(${foods})
  `);

    const foundFoods = rows.map((row) => row.name);
    const leftOverFoods = foods.filter((food) => !foundFoods.includes(food));

    if (leftOverFoods.length > 0) {
        const nutritionValues = await getNutritionValues(
            leftOverFoods.join(", ")
        );
        for (const food of nutritionValues.data) {
            if (
                food.calories === null ||
                food.carbGrams === null ||
                food.fatGrams === null ||
                food.proteinGrams === null
            ) {
                continue;
            }
            const foodId = await insertFoodDictionary(client, {
                name: food.name,
                calorie: food.calories,
                carbGram: food.carbGrams,
                fatGram: food.fatGrams,
                proteingGram: food.proteinGrams,
            });
            foundFoods.push(food.name);
            rows.push({
                calorie: food.calories,
                carb_gram: food.carbGrams,
                fat_gram: food.fatGrams,
                id: foodId,
                name: food.name,
                proteing_gram: food.proteinGrams,
            });
        }
    }

    return rows
        .map((row) =>
            `
    *${row.name}*\n\n🥛 חלבון: ${row.proteing_gram.toFixed(
                2
            )}\n🥜 שומן: ${row.fat_gram.toFixed(
                2
            )}\n🥐 פחמימה: ${row.carb_gram.toFixed(
                2
            )}\n✅ קלוריות: ${row.calorie.toFixed(2)}`.trim()
        )
        .join("\n\n\n");
}

const accountMeasuresMap: Record<
    string,
    "weight" | "height" | "yearOfBirth" | "gender"
> = {
    משקל: "weight",
    גובה: "height",
    "שנת לידה": "yearOfBirth",
    מגדר: "gender",
};

async function handleAccountMeasures(client: Client, message: Message) {
    if (
        message.Body === "גובה" ||
        message.Body === "משקל" ||
        message.Body === "שנת לידה" ||
        message.Body === "מגדר"
    ) {
        const accountData = await getAccountDataByWhatsappNumber(
            client,
            message.WaId
        );
        if (accountData === null) {
            return getNotRegisteredMessage();
        }
        const measure =
            accountData[accountMeasuresMap[message.Body]] ?? "לא נקבע";
        return `ה${message.Body} המעודכן הוא: ${measure}`;
    }

    if (message.Body.startsWith("מגדר ")) {
        const newGender = message.Body.split(" ")[1].trim();
        if (newGender !== "גבר" && newGender !== "אישה") {
            return "מגדר צריך להיות גבר או אישה";
        }
        await client.query(sql`
      UPDATE account
      SET gender = ${newGender}
      WHERE whatsapp_number = ${message.WaId}
    `);
        return "המגדר עודכן בהצלחה";
    }

    if (message.Body.startsWith("משקל ")) {
        const newWeightStr = message.Body.split(" ")[1].trim();
        const newWeight = parseInt(newWeightStr, 10);
        if (isNaN(newWeight) || newWeight < 0) {
            return "המשקל צריך להיות מספר הגיוני";
        }
        await client.query(sql`
      UPDATE account
      SET weight = ${newWeight}
      WHERE whatsapp_number = ${message.WaId}
    `);
        return "המשקל עודכן בהצלחה";
    }

    if (message.Body.startsWith("גובה ")) {
        const newHeightStr = message.Body.split(" ")[1].trim();
        const newHeight = parseInt(newHeightStr, 10);
        if (isNaN(newHeight) || newHeight < 0) {
            return "הגובה צריך להיות מספר הגיוני";
        }
        await client.query(sql`
      UPDATE account
      SET height = ${newHeight}
      WHERE whatsapp_number = ${message.WaId}
    `);
        return "הגובה עודכן בהצלחה";
    }

    if (message.Body.startsWith("שנת לידה ")) {
        const newYearOfBirth = message.Body.split(" ")[2].trim();
        const newYear = parseInt(newYearOfBirth, 10);
        if (
            isNaN(newYear) ||
            newYear < 1900 ||
            newYear > LocalDate.now().year()
        ) {
            return "שנת הלידה צריכה להיות מספר הגיוני";
        }
        await client.query(sql`
      UPDATE account
      SET year_of_birth = ${newYear}
      WHERE whatsapp_number = ${message.WaId}
    `);
        return "שנת הלידה עודכנה בהצלחה";
    }

    return "אני לא מבין אותך, שלח '?' לעזרה";
}

function getNotRegisteredMessage(): string {
    return `היי, אנחנו לא מכירים 😀. בשביל להתחיל להשתמש בבוט נא לכתוב 'הרשמה'`;
}

async function handleCalculateDailyCalories(
    client: Client,
    message: Message
): Promise<string> {
    const accountData = await getAccountDataByWhatsappNumber(
        client,
        message.WaId
    );
    if (accountData === null) {
        return getNotRegisteredMessage();
    }

    if (
        accountData.gender === null ||
        accountData.weight === null ||
        accountData.height === null ||
        accountData.yearOfBirth === null
    ) {
        return `אנא עדכן את כל הנתונים האישיים שלך קודם.

🪪 כדי *לעדכן* משקל/גובה/שנת לידה/מגדר 
רשום ״משקל״ + המשקל שלך
לדוגמה:
 ״משקל 62״ או ״גובה 157״ או ״שנת לידה 1990״ או ״מגדר גבר״`;
    }

    const age = LocalDate.now().year() - accountData.yearOfBirth;

    // for men: 10W + 6.25H - 5A + 5
    let calories: number;
    if (accountData.gender === "גבר") {
        calories = Math.round(
            10 * accountData.weight + 6.25 * accountData.height - 5 * age + 5
        );
    } else {
        // for women: 10W + 6.25H - 5A - 161
        calories = Math.round(
            10 * accountData.weight + 6.25 * accountData.height - 5 * age - 161
        );
    }

    return `צריכת הקלוריות היומית שלך היא: ${Math.round(calories * 1.2)}`;
}
