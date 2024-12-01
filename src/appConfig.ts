import dotenv from "dotenv";

dotenv.config();
export const appConfig = {
    DATABASE_URL: process.env.DATABASE_URL ?? "",
    TWILIO_SENDER_NUMBER: process.env.TWILIO_SENDER_NUMBER ?? "",
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID ?? "",
    TWILIO_ACCOUNT_TOKEN: process.env.TWILIO_ACCOUNT_TOKEN ?? "",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
    NODE_ENV: process.env.NODE_ENV ?? "development",
    PORT: process.env.PORT ?? "3000",
};
