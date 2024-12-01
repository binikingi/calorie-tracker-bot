import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAccount } from "../Account/AxccountState";

export const Route = createFileRoute("/")({
    component: () => {
        const [account] = useAccount();
        const navigate = useNavigate();

        if (account !== null) {
            navigate({
                to: "/home",
            });
        }
    },
});
