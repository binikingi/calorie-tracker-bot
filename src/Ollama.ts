import { Ollama } from "ollama";
import { appConfig } from "./appConfig";
import zodToJsonSchema from "zod-to-json-schema";
import { z } from "zod";

export const ollama = new Ollama({ host: appConfig.OLLAMA_HOST });

const SentenceHasFoodAndDrinksSchema = z.object({
    has: z.boolean(),
});
export async function checkIfSentenceHasFoodsAndDrinks(
    sentence: string
): Promise<boolean> {
    const check = await ollama.chat({
        stream: false,
        model: "llama3.2",
        messages: [
            {
                role: "user",
                content: `Check if the sentence mention foods or drinks: ${sentence}`,
            },
        ],
        format: zodToJsonSchema(SentenceHasFoodAndDrinksSchema),
    });

    const response = SentenceHasFoodAndDrinksSchema.parse(
        JSON.parse(check.message.content)
    );
    console.log("sentens response:", response);
    return response.has;
}
