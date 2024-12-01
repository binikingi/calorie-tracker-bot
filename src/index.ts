import express, { Router } from "express";
import cors from "cors";
import { connectDb, migrateDb } from "./migrateDb";
import { Message } from "./messages/messages.interfaces";
import { handleIncomingMessage } from "./messages/messages.controller";
import MessagingResponse from "twilio/lib/twiml/MessagingResponse";
import { client } from "./db";
import { logMessage } from "./messagesLog/messagesLog.controller";
import { appConfig } from "./appConfig";
import path from "path";
import {
    handleCodeVerification,
    handleLogin,
    handleLogout,
} from "./auth/auth.contoller";
import { apiRouter } from "./api.routes";
import fs from "fs";
import ErrnoException = NodeJS.ErrnoException;

const app = express();
const router = Router();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(router);

router.get("/health", (_, res) => {
    res.json({ status: "ok" });
});

router.post("/", async (req, res) => {
    const body = req.body as Message;
    console.log("message", body.Body);
    await logMessage(client, {
        body: body.Body,
        direction: "IN",
        from: body.WaId,
        to: "SYSTEM",
    });
    const response = await handleIncomingMessage(client, body);
    const twiml = new MessagingResponse();
    twiml.message(response);
    await logMessage(client, {
        body: response,
        direction: "OUT",
        from: "SYSTEM",
        to: body.WaId,
    });
    res.type("text/xml").send(twiml.toString());
});

router.post("/login", async (req, res) => {
    await handleLogin(client, req, res);
});

router.post("/login/verify", async (req, res) => {
    await handleCodeVerification(client, req, res);
});

router.post("/logout", async (req, res) => {
    await handleLogout(client, req, res);
});

router.use(apiRouter);

if (appConfig.NODE_ENV === "production") {
    app.use(
        (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            if (/(.ico|.js|.css|.jpg|.png|.map)$/i.test(req.path)) {
                next();
            } else {
                const filePath = path.resolve(
                    __dirname,
                    "public",
                    "index.html"
                );
                fs.readFile(
                    filePath,
                    "utf8",
                    (err: ErrnoException | null, data: string) => {
                        res.header(
                            "Cache-Control",
                            "private, no-cache, no-store, must-revalidate"
                        );
                        res.header("Expires", "-1");
                        res.header("Pragma", "no-cache");
                        res.send(data);
                    }
                );
            }
        }
    );

    router.get("*", express.static(path.join(__dirname, "public")));
}

async function main() {
    await connectDb();
    await migrateDb();
    app.listen(parseInt(appConfig.PORT), () => {
        console.log("Server is running on port " + appConfig.PORT);
    });
}

main().catch((error) => console.error(error));
