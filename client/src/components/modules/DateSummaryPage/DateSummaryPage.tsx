import { Box, Flex, Heading, Separator, Text } from "@chakra-ui/react";
import { DateTimeFormatter, LocalDate } from "@js-joda/core";
import { useQuery } from "@tanstack/react-query";
import { getMenuByDateSummaryQueryOptions } from "../../../queries/api.queries";
import { fetchErrorMessage } from "../../../api";

export const DateSummaryPage = (props: { date: LocalDate }) => {
    const { data, isSuccess, isError, error } = useQuery(
        getMenuByDateSummaryQueryOptions(props.date)
    );

    if (isError) {
        return <Box>{fetchErrorMessage(error)}</Box>;
    }
    if (!isSuccess) {
        return <Box>טוען...</Box>;
    }
    return (
        <Flex gap={4} px={4} flexDir={"column"}>
            <Heading>
                תפריט לתאריך{" "}
                {props.date.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))}
            </Heading>
            {data.data.foods.length === 0 ? (
                <Text>לא עדכנת שום מאכל בתאריך זה</Text>
            ) : (
                <>
                    <Flex flexWrap={"wrap"} gap={4}>
                        {data.data.foods.map((food) => (
                            <Flex
                                key={food.id.toString()}
                                flexDir={"column"}
                                gap={2}
                            >
                                <Heading size={"md"}>{food.name}</Heading>
                                <Box>
                                    <Text>
                                        🥛 חלבון:{" "}
                                        <b>{food.protein.toFixed(0)}</b> גרם
                                    </Text>
                                    <Text>
                                        🥜 שומן: <b>{food.fat.toFixed(0)}</b>{" "}
                                        גרם
                                    </Text>
                                    <Text>
                                        🥐 פחמימה:{" "}
                                        <b>{food.carbs.toFixed(0)}</b> גרם
                                    </Text>
                                    <Text>
                                        ✅ קלוריות:{" "}
                                        <b>{food.calories.toFixed(0)}</b>
                                    </Text>
                                </Box>
                            </Flex>
                        ))}
                    </Flex>
                    <Separator />
                    <Flex flexDir={"column"}>
                        <Heading>סיכום</Heading>
                        <Text>
                            🥛 חלבון:{" "}
                            <b>
                                {data.data.foods
                                    .reduce(
                                        (acc, curr) => curr.protein + acc,
                                        0
                                    )
                                    .toFixed(2)}{" "}
                            </b>
                            גרם
                        </Text>
                        <Text>
                            🥜 שומן:{" "}
                            <b>
                                {data.data.foods
                                    .reduce((acc, curr) => curr.fat + acc, 0)
                                    .toFixed(2)}{" "}
                            </b>
                            גרם
                        </Text>
                        <Text>
                            🥐 פחמימה:{" "}
                            <b>
                                {data.data.foods
                                    .reduce((acc, curr) => curr.carbs + acc, 0)
                                    .toFixed(2)}{" "}
                            </b>
                            גרם
                        </Text>
                        <Text>
                            ✅ קלוריות:{" "}
                            <b>
                                {data.data.foods
                                    .reduce(
                                        (acc, curr) => curr.calories + acc,
                                        0
                                    )
                                    .toFixed(2)}
                            </b>
                        </Text>
                    </Flex>
                </>
            )}
        </Flex>
    );
};
