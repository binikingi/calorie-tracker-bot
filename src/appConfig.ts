import dotenv from "dotenv";

dotenv.config();
export const appConfig = {
  DATABASE_URL: process.env.DATABASE_URL ?? "",
  TWILIO_SENDER_NUMBER: process.env.TWILIO_SENDER_NUMBER ?? "",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
  NODE_ENV: process.env.NODE_ENV ?? "development",
};
