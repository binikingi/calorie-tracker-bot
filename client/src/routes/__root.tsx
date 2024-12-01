import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Account } from "../Account/Account.interface";
import { Page } from "../Page";

interface RouterContext {
    account: Account | null;
}

export const Route = createRootRouteWithContext<RouterContext>()({
    component: () => {
        return (
            <Page>
                <Outlet />
                <TanStackRouterDevtools />
            </Page>
        );
    },
});
