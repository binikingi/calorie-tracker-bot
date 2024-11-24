import OpenAI from "openai";
import { appConfig } from "../appConfig";

export const openaiClient = new OpenAI({
  apiKey: appConfig.OPENAI_API_KEY,
});
