import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAccount } from "../Account/AxccountState";

export const Route = createFileRoute("/")({
    component: () => {
        const [account] = useAccount();

        if (account !== null) {
            return <Navigate to="/home" />;
        }
        return <Navigate to="/login" />;
    },
});
