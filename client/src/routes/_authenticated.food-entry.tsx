import { createFileRoute } from "@tanstack/react-router";
import { FoodEntryPage } from "../components/modules/FoodEntryPage/FoodEntryPage";

export const Route = createFileRoute("/_authenticated/food-entry")({
    component: FoodEntryPage,
});
