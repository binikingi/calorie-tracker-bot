import { Button, Flex, Heading, Input, Text } from "@chakra-ui/react";
import { useNavigate } from "@tanstack/react-router";
import React from "react";
import { LuPhone } from "react-icons/lu";
import { api, fetchErrorMessage } from "../../../api";
import { InputGroup } from "../../ui/input-group";

function LoginPage() {
    const [phoneNumber, setPhoneNumber] = React.useState("");
    const [error, setError] = React.useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            await api.post("/login", { phoneNumber });
            navigate({
                to: "/code/$phoneNumber",
                params: { phoneNumber },
            });
        } catch (error) {
            setError(fetchErrorMessage(error));
        }
    };
    return (
        <Flex w={"full"} align={"center"} flexDir={"column"} gap={4} p={8}>
            <Heading size={"4xl"}>ברוכים הבאים ל-EatBot</Heading>
            <InputGroup dir="ltr" flex="1" startElement={<LuPhone />}>
                <Input
                    placeholder="מספר טלפון"
                    value={phoneNumber}
                    onChange={(e) => {
                        setPhoneNumber(e.currentTarget.value);
                        setError(null);
                    }}
                    borderColor={error !== null ? "border.error" : undefined}
                />
            </InputGroup>
            {error !== null && <Text color={"fg.error"}>{error}</Text>}
            <Button onClick={handleLogin}>כניסה</Button>
        </Flex>
    );
}

export default LoginPage;
