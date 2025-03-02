import { z } from "zod";
import { openaiClient } from "./openaiClient";
import zodToJsonSchema from "zod-to-json-schema";
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
    const response = await openaiClient.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
                role: "system",
                content: `אתה יודע לתת ערכים תזונתיים של כל אוכל שיביאו לך. אתה אמור להחיזר את כמות החלבונים, פחמימות, שומנים וקלוריות של האוכל ששואלים אותך עליהם. במקרה שאתה לא יודע פשוט תחזיר null במקום ערך מספרי.
          את השמות של המוצרים תחזיר בדיוק באותו שם שנכתבו לך אל תחליך לשפה אחרת או תשנה שום דבר בשם`,
            },
            {
                role: "user",
                content: `תחזיר לי את הערכים התזונתיים שיש במאכלים האלה: ${userMessage}`,
            },
        ],
        temperature: 0.5,
        response_format: {
            type: "json_schema",
            json_schema: {
                name: "NutritionValues",
                schema: zodToJsonSchema(nutritionValuesSchema),
            },
        },
    });

    const res = JSON.parse(
        response.choices[0].message.content ?? "{data: []}"
    ) as NutritionValues;
    console.log("chatgpt response", JSON.stringify(res, null, 2));
    return res;
}

export async function getNutritionValuesFromImage(
    imageUrl: string
): Promise<NutritionValues> {
    const response = await openaiClient.chat.completions.create({
        model: "gpt-4o",
        messages: [
            //       {
            //           role: "assistant",
            //           content: `אתה יודע לתת ערכים תזונתיים של כל אוכל שיביאו לך. אתה אמור להחיזר את כמות החלבונים, פחמימות, שומנים וקלוריות של האוכל ששואלים אותך עליהם. במקרה שאתה לא יודע פשוט תחזיר null במקום ערך מספרי.
            // את השמות של המוצרים תחזיר בעברית`,
            //       },
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: `תחזיר לי את כל המרכיבים שיש בארוחה הזאת עם פירוט של חלבונים, שומנים, פחמימות וקלוריות לכל מרכיב. התמונה נמצאת בקישור הבא. תחזיר את כל השמות של המרכיבים בעברית. תנסה להיות כמה שיותר מדויק בחישוב. אם יש פעמיים משהו תחשב אותו לפי מספר הפעמים שהוא בתמונה`,
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: await getBase64FromUrl(imageUrl),
                        },
                    },
                ],
            },
        ],
        temperature: 0.5,
        response_format: {
            type: "json_schema",
            json_schema: {
                name: "NutritionValues",
                schema: zodToJsonSchema(nutritionValuesSchema),
            },
        },
    });

    const res = JSON.parse(
        response.choices[0].message.content ?? "{data: []}"
    ) as NutritionValues;
    console.log("chatgpt response", JSON.stringify(res, null, 2));
    return res;
}

async function getBase64FromUrl(url: string) {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const base64 = Buffer.from(response.data, "binary").toString("base64");
    return `data:${response.headers["content-type"]};base64,${base64}`;
}
