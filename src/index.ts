import express, { Router } from "express";
import cors from "cors";
import { connectDb, migrateDb } from "./migrateDb";
import { MediaMessage, Message } from "./messages/messages.interfaces";
import {
    handleIncomingMediaMessage,
    handleIncomingMessage,
} from "./messages/messages.controller";
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
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { ollama } from "./Ollama";

const app = express();
const router = Router();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(router);

router.get("/health", (_, res) => {
    res.json({ status: "ok" });
});

router.get("/whatsapp", (_, res) => {
    res.redirect("https://wa.me/97233820518?text=הרשמה");
});

router.post("/", async (req, res) => {
    console.log("got message");
    console.log("req.body.NumMedia", req.body.NumMedia);
    try {
        if (
            req.body.NumMedia !== undefined &&
            !isNaN(parseInt(req.body.NumMedia, 10)) &&
            parseInt(req.body.NumMedia, 10) > 0
        ) {
            console.log("media message", req.body);
            const body = req.body as MediaMessage;
            await logMessage(client, {
                body: body.Body,
                direction: "IN",
                from: body.WaId,
                to: "SYSTEM",
                mediaUrl: body.MediaUrl0,
            });
            const response = await handleIncomingMediaMessage(client, body);
            const twiml = new MessagingResponse();
            twiml.message(response);
            await logMessage(client, {
                body: response,
                direction: "OUT",
                from: "SYSTEM",
                to: body.WaId,
                mediaUrl: body.MediaUrl0,
            });
            res.type("text/xml").send(twiml.toString());
        } else {
            const body = req.body as Message;
            console.log("message", body.Body);
            await logMessage(client, {
                body: body.Body,
                direction: "IN",
                from: body.WaId,
                to: "SYSTEM",
                mediaUrl: null,
            });
            const response = await handleIncomingMessage(client, body);
            const twiml = new MessagingResponse();
            twiml.message(response);
            await logMessage(client, {
                body: response,
                direction: "OUT",
                from: "SYSTEM",
                to: body.WaId,
                mediaUrl: null,
            });
            res.type("text/xml").send(twiml.toString());
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
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

const LocalLLMReturnType = z.object({
    list: z.array(z.string()),
});

const GetItemsFromImageReturnType = z.object({
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

router.post("/ollama/:model", async (req, res) => {
    console.log("request ollama", req.body);
    const model = req.params.model;
    const imageUrl = req.body.imageUrl;
    console.log();
    console.time("ollama");
    const schema = zodToJsonSchema(GetItemsFromImageReturnType);
    console.log(JSON.stringify(schema, null, 2));
    const response = await ollama.chat({
        model: model,
        format: schema,
        messages: [
            {
                role: "user",
                content: req.body.question,
                images: [await getFileBufferFromUrl(imageUrl)],
            },
        ],
    });
    console.timeEnd("ollama");
    const parsed = JSON.parse(response.message.content);
    console.log(parsed);
    res.json(parsed);
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

    console.log("config", JSON.stringify(appConfig, null, 2));
}

async function main() {
    await connectDb();
    await migrateDb();
    app.listen(parseInt(appConfig.PORT), () => {
        console.log("Server is running on port " + appConfig.PORT);
    });
}

main().catch((error) => console.error(error));

async function getFileBufferFromUrl(
    imageUrl: string
): Promise<Uint8Array<ArrayBufferLike>> {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    return uint8Array; // Wrap in an array if you need Uint8Array[]
}
