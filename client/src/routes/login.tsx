import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAccount } from "../Account/AxccountState";
import LoginPage from "../components/modules/AuthPage/LoginPage";

export const Route = createFileRoute("/login")({
    component: () => {
        const [account] = useAccount();

        if (account !== null) {
            return <Navigate to="/home" />;
        } else {
            return <LoginPage />;
        }
    },
});
