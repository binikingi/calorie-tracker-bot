import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { useAccount } from "./Account/AxccountState.ts";
import { Provider } from "./components/ui/provider.tsx";
import { Toaster } from "./components/ui/toaster.tsx";
import { routeTree } from "./routeTree.gen";
import "@tanstack/react-query";
import { AxiosError } from "axios";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "@fontsource/noto-sans-hebrew/400.css";

const router = createRouter({
    routeTree,
    context: {
        account: null,
    },
});

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

declare module "@tanstack/react-query" {
    interface Register {
        defaultError: AxiosError;
    }
}

const Inner = () => {
    const [account] = useAccount();
    return <RouterProvider router={router} context={{ account }} />;
};

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Provider>
            <QueryClientProvider client={queryClient}>
                <Toaster />
                <Inner />
                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
        </Provider>
    </StrictMode>
);
