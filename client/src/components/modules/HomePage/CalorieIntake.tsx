import { useQuery } from "@tanstack/react-query";
import { getAccountDetailsQueryOptions } from "../../../queries/api.queries";
import { Flex, Heading, Skeleton } from "@chakra-ui/react";

export const CalorieIntake = () => {
    const accountData = useQuery(getAccountDetailsQueryOptions);

    return (
        <Flex w={"full"} justify={"center"} p={4} gap={2}>
            <Heading display={"flex"} alignItems={"center"} gap={2}>
                צריכת קלוריות מומלצת:
            </Heading>
            <Heading>
                {accountData.data?.data.calorieIntake ?? (
                    <Skeleton height={"10px"} width={"20px"} />
                )}
            </Heading>
        </Flex>
    );
};
