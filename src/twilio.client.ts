import twilio from "twilio";

const accountSid = "AC2864339b20aba4a380603ac7ae2a8d43";
const authToken = "e701bd18a392a85558e52213688286b8";
export const twilioClient = twilio(accountSid, authToken);
