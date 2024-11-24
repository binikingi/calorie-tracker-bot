import postgres from "postgres";
import { appConfig } from "./appConfig";

export const db = postgres(appConfig.DATABASE_URL);
