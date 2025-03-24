import { Client } from "pg";
import {
    ActionContext,
    ActionContextHanlderResult,
    ActionContextName,
} from "../actionContext.types";

export function createActionContextHandler<T extends ActionContextName, Args>(
    actionContex: T,
    validateArgs: (message: string) => Args,
    handler: (params: {
        client: Client;
        accountId: number;
        currentContextId: number;
        currentActionContext: ActionContext[T];
        args: Args;
    }) => Promise<ActionContextHanlderResult>
) {
    return {
        handler: ({
            client,
            accountId,
            currentContextId,
            currentActionContext,
            args,
        }: {
            client: Client;
            accountId: number;
            currentContextId: number;
            currentActionContext: ActionContext[T];
            args: Args;
        }) => {
            console.log("Action handler for type: ", actionContex);
            return handler({
                client,
                accountId,
                currentContextId,
                currentActionContext,
                args,
            });
        },
        validateArgs,
    };
}
