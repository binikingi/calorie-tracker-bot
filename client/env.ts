import dotenv from "dotenv";
import { z } from "zod";

const stringToNumber = (x: string) => parseInt(x, 10);

const schema = z.object({
    /**
     * Setting `ENABLE_CAPACITOR_SERVER=1` will host the app in a server and enable livereload
     * when running the app on a device.
     */
    ENABLE_CAPACITOR_SERVER: z
        .string()
        .default("0")
        .transform(stringToNumber)
        .transform(Boolean),
    VITE_SERVER_URL: z.string(),

    /**
     * The port that the server will listen on.
     */
    CAPACITOR_SERVER_PORT: z.string().default("5173").transform(stringToNumber),
});

export const env = schema.parse(dotenv.config().parsed ?? {});
