import { Container } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { UserDetailsSection } from "../components/modules/HomePage/UserDetailsSection";

export const Route = createFileRoute("/_authenticated/home")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <Container px={8}>
            <UserDetailsSection />
        </Container>
    );
}
