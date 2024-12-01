import { Container } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/account")({
    component: RouteComponent,
});

function RouteComponent() {
    // show here weight, height, year of birth.
    return <Container>Hello "/_authenticated/acount"!</Container>;
}
