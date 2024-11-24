import express, { Router } from "express";
import cors from "cors";
import { connectDb, migrateDb } from "./migrateDb";
import { Message } from "./messages/messages.interfaces";
import { handleIncomingMessage } from "./messages/messages.controller";
import MessagingResponse from "twilio/lib/twiml/MessagingResponse";
import { client } from "./db";

const app = express();
const router = Router();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(router);

router.post("/", async (req, res) => {
  const body = req.body as Message;
  console.log("message", body.Body);
  const response = await handleIncomingMessage(client, body);
  const twiml = new MessagingResponse();
  twiml.message(response);
  res.type("text/xml").send(twiml.toString());

  //   twilioClient.messages
  //     .create({
  //       from: "whatsapp:+14155238886",
  //       body: "Hello to you!!!",
  //       to: body.From,
  //     })
  //     .then((message) => console.log("message id", message.sid));
});

async function main() {
  await connectDb();
  await migrateDb();
  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
}

main().catch((error) => console.error(error));
