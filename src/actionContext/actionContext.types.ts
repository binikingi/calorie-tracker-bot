export type ActionContext = {
    remove: {
        type: "remove";
        foodLogState: {
            name: string;
            id: number;
        }[];
    };
};

export type ActionContextName = keyof ActionContext;

export type ActionContextHanlderResult =
    | {
          type: "nothingToHandle";
      }
    | {
          type: "handled";
      }
    | {
          type: "sendText";
          text: string;
      };

export const ActionContextHanlderResult = {
    nothingToHandle: (): ActionContextHanlderResult => {
        return {
            type: "nothingToHandle",
        };
    },
    handled: (): ActionContextHanlderResult => {
        return {
            type: "handled",
        };
    },
    sendText: (text: string): ActionContextHanlderResult => {
        return {
            type: "sendText",
            text,
        };
    },
};
