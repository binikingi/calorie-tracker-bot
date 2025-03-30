import { Box, Button, Flex, Heading, IconButton } from "@chakra-ui/react";
import { useLocation, useNavigate, useRouter } from "@tanstack/react-router";
import React from "react";
import { LuArrowRight, LuUtensils } from "react-icons/lu";
import { useAccount } from "./Account/AxccountState";
import { api } from "./api";
import { ColorModeButton, useColorModeValue } from "./components/ui/color-mode";

export const Page = (props: { children: React.ReactNode }) => {
    const { history } = useRouter();
    const location = useLocation();
    const navigate = useNavigate();
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
        <Flex
            h={"full"}
            w={"full"}
            flexDir={"column"}
            gap={2}
            pt={"env(safe-area-inset-top)"}
            pb={"env(safe-area-inset-bottom)"}
            height={"100vh"}
        >
            <Flex
                background={useColorModeValue("gray.100", "gray.800")}
                w={"full"}
                flexDir={"row"}
                justify={"space-between"}
                align={"center"}
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
                    <Heading onClick={() => navigate({ to: "/" })}>
                        EatBot
                    </Heading>
                </Flex>
                <Flex gap={2}>
                    {account !== null && (
                        <IconButton
                            variant={"ghost"}
                            onClick={() => navigate({ to: "/food-entry" })}
                            aria-label="Add Food Entry"
                        >
                            <LuUtensils />
                        </IconButton>
                    )}
                    <ColorModeButton />
                    {account !== null && (
                        <Button onClick={logOut}>התנתק</Button>
                    )}
                </Flex>
            </Flex>
            <Box width={"full"} overflowY={"auto"}>
                {props.children}
            </Box>
        </Flex>
    );
};
