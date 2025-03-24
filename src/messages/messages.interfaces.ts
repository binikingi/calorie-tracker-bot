export interface Message {
    /** number with 972  */
    WaId: string;
    Body: string;
    /** whatsapp:+972**** */
    From: string;
}

export interface MediaMessage {
    /** number with 972  */
    WaId: string;
    Body: string;
    /** whatsapp:+972**** */
    From: string;

    MediaContentType0: string;
    MediaUrl0: string;
    MessageType: string;
}

export type MessageOperationResult =
    | {
          type: "sendText";
          text: string;
      }
    | {
          type: "doNothing";
      };

export const MessageOperationResult = {
    sendText(text: string): MessageOperationResult {
        return {
            type: "sendText",
            text,
        };
    },
    doNothing(): MessageOperationResult {
        return {
            type: "doNothing",
        };
    },
};
