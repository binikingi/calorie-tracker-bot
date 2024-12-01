import { LocalDate } from "@js-joda/core";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { DateSummaryPage } from "../components/modules/DateSummaryPage/DateSummaryPage";

export const Route = createFileRoute("/_authenticated/menu/$date")({
    component: RouteComponent,
});

function RouteComponent() {
    const { date } = Route.useParams();
    let parsedDate: LocalDate | null;
    try {
        parsedDate = LocalDate.parse(date);
    } catch {
        parsedDate = null;
    }

    if (parsedDate === null) {
        throw redirect({
            to: "/all_menus",
        });
    }
    return <DateSummaryPage date={parsedDate} />;
}
