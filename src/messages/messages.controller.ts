import { convert, Instant, LocalDate, ZoneId } from "@js-joda/core";
import { db } from "../db";
import { getFormattedLogMessageByDate } from "../foodLog/foodLog.controller";
import { Message } from "./messages.interfaces";
import "@js-joda/timezone";
import { getNutritionValues } from "../gpt/gpt.controller";

export async function handleIncomingMessage(message: Message): Promise<string> {
  if (message.Body === "הרשמה") {
    return handleRegistration(message);
  }
  if (message.Body === "?") {
    return handleDisplayHelp();
  }
  if (
    message.Body.startsWith("תראה") ||
    message.Body.startsWith("!") ||
    message.Body.startsWith("תפריט")
  ) {
    return handleShowSummaryMessage(message, message.Body.startsWith("תפריט"));
  }

  return handleLogFood(message);
}

async function handleShowSummaryMessage(message: Message, withMenu: boolean) {
  if (
    message.Body === "תראה" ||
    message.Body === "!" ||
    message.Body === "תפריט"
  ) {
    return await getFormattedLogMessageByDate(
      message.WaId,
      Instant.now().atZone(ZoneId.of("Asia/Jerusalem")).toLocalDate(),
      withMenu
    );
  }

  const [, variable] = message.Body.split(" ");
  if (variable === "אתמול") {
    return await getFormattedLogMessageByDate(
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
      message.WaId,
      Instant.now()
        .atZone(ZoneId.of("Asia/Jerusalem"))
        .toLocalDate()
        .minusDays(2),
      withMenu
    );
  }

  return await getFormattedLogMessageByDate(
    message.WaId,
    getDateFromText(variable),
    withMenu
  );
}

function getDateFromText(text: string) {
  const dateParts = text.split(".");
  return LocalDate.of(
    parseInt(
      dateParts.length === 3 ? dateParts[2] : LocalDate.now().year().toString(),
      10
    ),
    parseInt(dateParts[1], 10),
    parseInt(dateParts[0], 10)
  );
}

async function handleDisplayHelp() {
  const newMessage = `
*פקודות*:
כדי לתעד מאכל שצרכת פשוט מקלידים את המכאל ואת הכמות לדוגמא: *״100 גרם אורז לבן״*
כדי להציג דף זה: *״?״*
כדי להציג סיכום יומי: *״תראה״* או *״!״*
כדי לראות תאריך אחר: *״תראה 21.11״*
כדי לראות את כל התפריט שאכלת: *״תפריט״* או *״תפריט 21.11״*`;
  return newMessage;
}

async function handleRegistration(message: Message) {
  const [row] = await db<{ id: number; whatsapp_number: string }[]>`
        SELECT *
        FROM account
        WHERE whatsapp_number = ${message.WaId}
    `;

  if (row) {
    return `אתה כבר רשום למערכת, שלח '?' לעזרה`;
  } else {
    await db`
        INSERT INTO account (whatsapp_number)
        VALUES (${message.WaId})
    `;

    return "ברוכים הבאים ל-EatBot\nנרשמת בהצלחה למערכת, שלח '?' לעזרה";
  }
}

async function handleLogFood(message: Message): Promise<string> {
  const nowLocalDate = Instant.now()
    .atZone(ZoneId.of("Asia/Jerusalem"))
    .toLocalDate();
  const date = convert(nowLocalDate).toDate();
  const accountId = await getAcountIdByWHatsappNumber(message.WaId);
  if (accountId === null) {
    // This means the user is not registered
    return "אתה צריך להירשם למערכת קודם, שלח 'הרשמה'";
  }
  const foods = message.Body.split(",");
  const rows = await db<
    {
      id: number;
      name: string;
      proteing_gram: number;
      fat_gram: number;
      carb_gram: number;
      calorie: number;
    }[]
  >`
    SELECT *
    FROM food_dictionary
    WHERE name = ANY(${db.array(foods.map((food) => food.trim()))})
  `;

  for (const row of rows) {
    await insertFoodLog(accountId, {
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
    const nutritionValues = await getNutritionValues(leftOverFoods.join(", "));

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
      await insertFoodDictionary({
        name: food.name,
        calorie: food.calories,
        carbGram: food.carbGrams,
        fatGram: food.fatGrams,
        proteingGram: food.proteinGrams,
      });
      await insertFoodLog(accountId, {
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
${await getFormattedLogMessageByDate(message.WaId, nowLocalDate, false)}`;
}

async function insertFoodLog(
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
  await db`
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
  `;
}

async function getAcountIdByWHatsappNumber(
  whatsappNumber: string
): Promise<number | null> {
  const [row] = await db<{ id: number }[]>`
    SELECT id
    FROM account
    WHERE whatsapp_number = ${whatsappNumber}
  `;

  if (!row) {
    return null;
  }
  return row.id;
}

async function insertFoodDictionary(params: {
  name: string;
  calorie: number | null;
  carbGram: number | null;
  fatGram: number | null;
  proteingGram: number | null;
}) {
  await db`
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
  `;
}
