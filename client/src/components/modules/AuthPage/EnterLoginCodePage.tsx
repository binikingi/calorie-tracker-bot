import { Flex, Heading, Text } from "@chakra-ui/react";
import { useNavigate } from "@tanstack/react-router";
import React from "react";
import { useAccount } from "../../../Account/AxccountState";
import { api, fetchErrorMessage } from "../../../api";
import { PinInput } from "../../ui/pin-input";
import { toaster } from "../../ui/toaster";

function isCodeValid(code: string[]) {
    return code.length === 6 && code.every((c) => c.length === 1);
}

export const EnterLoginCodePage = (props: { phoneNumber: string }) => {
    const [code, setCode] = React.useState<string[]>([]);
    const [disabled, isDisabled] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string | null>(null);
    const [, setAccount] = useAccount();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (isCodeValid(code)) {
            console.log("submitting code");
            isDisabled(true);
            submitCode(code).finally(() => isDisabled(false));
        }

        async function submitCode(code: string[]) {
            try {
                const res = await api.post("/login/verify", {
                    phoneNumber: props.phoneNumber,
                    code: code.join(""),
                });
                if (res.data.id && res.data.token) {
                    toaster.success({
                        title: "התחברת בהצלחה",
                        duration: 2000,
                    });
                    setAccount(res.data);
                    navigate({ to: "/home" });
                }
            } catch (error) {
                setError(fetchErrorMessage(error));
            }
        }
    }, [code, navigate, props.phoneNumber, setAccount]);
    return (
        <Flex w={"full"} align={"center"} flexDir={"column"} gap={4} p={8}>
            <Heading size={"4xl"}>הכנס את הקוד שקיבלת בהודעה</Heading>
            <PinInput
                dir="ltr"
                disabled={disabled}
                count={6}
                onValueChange={(e) => {
                    setCode(e.value);
                    setError(null);
                }}
                value={code}
            />
            {error !== null && <Text color={"fg.error"}>{error}</Text>}
        </Flex>
    );
};
