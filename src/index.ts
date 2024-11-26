import express, { Router } from "express";
import cors from "cors";
import { connectDb, migrateDb } from "./migrateDb";
import { Message } from "./messages/messages.interfaces";
import { handleIncomingMessage } from "./messages/messages.controller";
import MessagingResponse from "twilio/lib/twiml/MessagingResponse";
import { client } from "./db";
import { logMessage } from "./messagesLog/messagesLog.controller";
import { appConfig } from "./appConfig";

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

router.get("/", (_, res) => {
  res.send("Welcome To EatBot!");
});

async function main() {
  await connectDb();
  await migrateDb();
  app.listen(parseInt(appConfig.PORT), () => {
    console.log("Server is running on port " + appConfig.PORT);
  });
}

main().catch((error) => console.error(error));
