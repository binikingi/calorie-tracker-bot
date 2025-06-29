import { z } from "zod";
import { openaiClient } from "./openaiClient";
import { zodTextFormat } from "openai/helpers/zod";
import axios from "axios";

const nutritionValuesSchema = z.object({
    data: z.array(
        z.object({
            name: z.string(),
            fatGrams: z.number().nullable(),
            proteinGrams: z.number().nullable(),
            carbGrams: z.number().nullable(),
            calories: z.number().nullable(),
        })
    ),
});

export type NutritionValues = z.infer<typeof nutritionValuesSchema>;

export async function getNutritionValuesFromText(
    userMessage: string
): Promise<NutritionValues> {
    const response = await openaiClient.responses.parse({
        model: "o4-mini-2025-04-16",
        input: [
            {
                role: "developer",
                content: [
                    {
                        type: "input_text",
                        text: "אתה יודע לתת ערכים תזונתיים של כל אוכל שיביאו לך. אתה אמור להחיזר את כמות החלבונים, פחמימות, שומנים וקלוריות של האוכל ששואלים אותך עליהם. במקרה שאתה לא יודע פשוט תחזיר null במקום ערך מספרי.\n          את השמות של המוצרים תחזיר בדיוק באותו שם שנכתבו לך אל תחליך לשפה אחרת או תשנה שום דבר בשם",
                    },
                ],
            },
            {
                role: "user",
                content: `תחזיר לי את הערכים התזונתיים שיש במאכלים האלה: ${userMessage}`,
            },
        ],
        store: false,
        stream: false,
        reasoning: {
            effort: "medium",
        },
        text: {
            format: zodTextFormat(nutritionValuesSchema, "NutritionalValues"),
        },
    });

    console.log(
        "chatgpt response",
        JSON.stringify(response.output_parsed, null, 2)
    );
    return { data: response.output_parsed?.data ?? [] };
}

export async function getNutritionValuesFromImage(
    imageUrl: string
): Promise<NutritionValues> {
    const response = await openaiClient.responses.parse({
        model: "o4-mini-2025-04-16",
        input: [
            {
                role: "user",
                content: [
                    {
                        type: "input_text",
                        text: `תחזיר לי את כל המרכיבים שיש בארוחה הזאת עם פירוט של חלבונים, שומנים, פחמימות וקלוריות לכל מרכיב. התמונה נמצאת בקישור הבא. תחזיר את כל השמות של המרכיבים בעברית. תנסה להיות כמה שיותר מדויק בחישוב. אם יש פעמיים משהו תחשב אותו לפי מספר הפעמים שהוא בתמונה`,
                    },
                    {
                        type: "input_image",
                        image_url: await getBase64FromUrl(imageUrl),
                        detail: "high",
                    },
                ],
            },
        ],
        text: {
            format: zodTextFormat(nutritionValuesSchema, "NutritionalValues"),
        },
    });

    console.log(
        "chatgpt response",
        JSON.stringify(response.output_parsed, null, 2)
    );
    return { data: response.output_parsed?.data ?? [] };
}

async function getBase64FromUrl(url: string) {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const base64 = Buffer.from(response.data, "binary").toString("base64");
    return `data:${response.headers["content-type"]};base64,${base64}`;
}
