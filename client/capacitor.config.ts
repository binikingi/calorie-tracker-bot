import type { CapacitorConfig } from "@capacitor/cli";
import { env } from "./env";
import { networkInterfaces } from "os";

const config: CapacitorConfig = {
    appId: "com.eatbot.app",
    appName: "EatBot - Calorie Tracker",
    webDir: "dist",
    server: getServer(),
};

function getServer(): CapacitorConfig["server"] {
    if (!env.ENABLE_CAPACITOR_SERVER) {
        return undefined;
    }

    const ip = (() => {
        const networks =
            networkInterfaces()["en0"] ?? networkInterfaces()["eth0"];
        return networks?.find((ip) => ip.family === "IPv4")?.address;
    })();

    return {
        url: `http://${ip}:${env.CAPACITOR_SERVER_PORT}`,
        cleartext: true,
    };
}

export default config;
