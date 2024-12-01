import twilio from "twilio";
import { appConfig } from "./appConfig";

export const twilioClient = twilio(
    appConfig.TWILIO_ACCOUNT_SID,
    appConfig.TWILIO_ACCOUNT_TOKEN
);
