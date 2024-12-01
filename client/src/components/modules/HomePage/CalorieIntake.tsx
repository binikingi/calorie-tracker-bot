import { useQuery } from "@tanstack/react-query";
import { getAccountDetailsQueryOptions } from "../../../queries/api.queries";
import { Flex, Heading, Skeleton } from "@chakra-ui/react";

export const CalorieIntake = () => {
    const { isSuccess, data } = useQuery(getAccountDetailsQueryOptions);

    return (
        <Flex w={"full"} justify={"center"} p={4} gap={2} align={"center"}>
            <Heading display={"flex"} alignItems={"center"} gap={2}>
                צריכת קלוריות מומלצת:
                {isSuccess ? (
                    (data.data.calorieIntake ?? "יש למלא את הפרטים למעלה")
                ) : (
                    <Skeleton height={"10px"} width={"20px"} />
                )}
            </Heading>
        </Flex>
    );
};
