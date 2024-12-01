import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAccount } from "../Account/AxccountState";
import { EnterLoginCodePage } from "../components/modules/AuthPage/EnterLoginCodePage";

export const Route = createFileRoute("/code/$phoneNumber")({
    component: RouteComponent,
});

function RouteComponent() {
    const { phoneNumber } = Route.useParams();
    const [account] = useAccount();

    if (account !== null) {
        return <Navigate to="/home" />;
    } else {
        return <EnterLoginCodePage phoneNumber={phoneNumber} />;
    }
}
