import {
    Badge,
    Box,
    ColorPalette,
    Flex,
    Heading,
    Link,
    Text,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import {
    getAccountDetailsQueryOptions,
    getDailyTrackQueryOptions,
} from "../../../queries/api.queries";
import React from "react";
import { LocalDate } from "@js-joda/core";
import { PieChart } from "react-minimal-pie-chart";

const proteinColor = "#92C5F9";
const fatColor = "#AFDC8F";
const carbColor = "#F8AE54";

export const DailyTrack = () => {
    const [date] = React.useState(LocalDate.now());
    const dailyTrack = useQuery(getDailyTrackQueryOptions(date));
    const accountData = useQuery(getAccountDetailsQueryOptions);

    const calorieColor: ColorPalette | undefined =
        accountData.isSuccess &&
        dailyTrack.isSuccess &&
        accountData.data.data.calorieIntake !== null &&
        accountData.data.data.calorieIntake > dailyTrack.data.data.totalCalories
            ? "green"
            : accountData.data?.data.calorieIntake === null
              ? undefined
              : "red";

    return (
        <Flex w={"full"} flexDir={"column"} gap={4} p={4}>
            <Heading>מעקב יומי</Heading>
            {dailyTrack.data?.data.totalCalories === 0 ? (
                <Box>
                    <Text>
                        לא הוספת כלום{" "}
                        <Link
                            target="_blank"
                            variant={"underline"}
                            href={`https://wa.me/97233820518?text=עזרה`}
                        >
                            להוספה דברו עם הבוט שלנו
                        </Link>
                    </Text>
                </Box>
            ) : (
                <>
                    <Heading size={"md"}>
                        קלוריות:{" "}
                        <span style={{ color: calorieColor }}>
                            {dailyTrack.data?.data.totalCalories ?? "..."}
                        </span>
                    </Heading>
                    <PieChart
                        data={[
                            {
                                title: "חלבון",
                                color: proteinColor,
                                value: dailyTrack.data?.data.totalProtein ?? 0,
                            },
                            {
                                title: "שומן",
                                color: fatColor,
                                value: dailyTrack.data?.data.totalFat ?? 0,
                            },
                            {
                                title: "פחמימה",
                                color: carbColor,
                                value: dailyTrack.data?.data.totalCarbs ?? 0,
                            },
                        ]}
                        style={{
                            maxHeight: "300px",
                        }}
                        labelStyle={{
                            fontSize: "5px",
                            fontFamily: "sans-serif",
                            fontWeight: "bold",
                            color: "black",
                        }}
                        label={({ dataEntry }) => {
                            return `${dataEntry.title}: ${dataEntry.value} גרם`;
                        }}
                        radius={43}
                        labelPosition={60}
                        segmentsShift={0.3}
                    />
                    <Flex direction={"row"} justify={"space-between"} gap={4}>
                        <Box flex={1} />
                        <Badge background={proteinColor} color={"black"}>
                            חלבון
                        </Badge>
                        <Badge background={carbColor} color={"black"}>
                            פחמימה
                        </Badge>
                        <Badge background={fatColor} color={"black"}>
                            שומן
                        </Badge>
                        <Box flex={1} />
                    </Flex>
                </>
            )}
        </Flex>
    );
};
