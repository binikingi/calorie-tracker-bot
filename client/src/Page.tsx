import { Button, Flex, Heading, IconButton } from "@chakra-ui/react";
import { useLocation, useRouter } from "@tanstack/react-router";
import React from "react";
import { LuArrowRight } from "react-icons/lu";
import { useAccount } from "./Account/AxccountState";
import { api } from "./api";
import { ColorModeButton, useColorModeValue } from "./components/ui/color-mode";

export const Page = (props: { children: React.ReactNode }) => {
    const { history } = useRouter();
    const location = useLocation();
    const [account, setAccount] = useAccount();

    const logOut = async () => {
        if (confirm("האם אתה בטוח שברצונך להתנתק?")) {
            if (account !== null) {
                await api.post(
                    "/logout",
                    {},
                    { headers: { Authorization: `Bearer ${account.token}` } }
                );
            }
            setAccount(null);
        }
    };

    return (
        <Flex w={"full"} flexDir={"column"} gap={8}>
            <Flex
                background={useColorModeValue("gray.100", "gray.800")}
                w={"full"}
                flexDir={"row"}
                justify={"space-between"}
                p={4}
            >
                <Flex gap={2} align={"center"}>
                    {location.pathname === "/home" ? null : (
                        <IconButton
                            variant={"ghost"}
                            onClick={() => history.back()}
                        >
                            <LuArrowRight />
                        </IconButton>
                    )}
                    <Heading>EatBot</Heading>
                </Flex>
                <Flex gap={2}>
                    <ColorModeButton />
                    {account !== null && (
                        <Button onClick={logOut}>התנתק</Button>
                    )}
                </Flex>
            </Flex>
            {props.children}
        </Flex>
    );
};
