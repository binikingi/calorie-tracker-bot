import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { useAccount } from "../Account/AxccountState";

export const Route = createFileRoute("/_authenticated")({
    component: () => {
        const [account] = useAccount();
        if (account === null) {
            return <Navigate to="/login" />;
        }
        return <Outlet />;
    },
});
