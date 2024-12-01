import { createFileRoute } from "@tanstack/react-router";
import { HistoryPage } from "../components/modules/HistoryPage/HistoryPage";

export const Route = createFileRoute("/_authenticated/all_menus")({
    component: RouteComponent,
});

function RouteComponent() {
    return <HistoryPage />;
}
