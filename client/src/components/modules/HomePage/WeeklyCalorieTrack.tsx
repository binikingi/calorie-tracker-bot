import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";
import { DateTimeFormatter, LocalDate } from "@js-joda/core";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import React from "react";
import { AxisOptions, Chart } from "react-charts";
import { LuArrowLeft } from "react-icons/lu";
import { getDailyCaloriesQueryOptions } from "../../../queries/api.queries";
import { useColorMode } from "../../ui/color-mode";

type DailyCalories = {
    date: LocalDate;
    calories: number;
};

type Series = {
    label: string;
    data: DailyCalories[];
};

export const WeeklyCalorieTrack = () => {
    const { colorMode } = useColorMode();
    const [fromTo, setFromTo] = React.useState<[LocalDate, LocalDate]>([
        LocalDate.now().minusDays(6),
        LocalDate.now(),
    ]);
    const query = useQuery(getDailyCaloriesQueryOptions(fromTo));

    const data = React.useMemo<Series[]>(() => {
        return [
            {
                label: "Daily Calories",
                data: query.data ?? [
                    {
                        date: LocalDate.now(),
                        calories: 0,
                    },
                ],
            },
        ];
    }, [query.data]);

    const primaryAxis = React.useMemo(
        (): AxisOptions<DailyCalories> => ({
            getValue: (datum) =>
                datum.date.format(DateTimeFormatter.ofPattern("dd/MM")),
        }),
        []
    );

    const secondaryAxes = React.useMemo(
        (): AxisOptions<DailyCalories>[] => [
            {
                getValue: (datum) => datum.calories,
                elementType: "line",
                showDatumElements: true,
            },
        ],
        []
    );

    return (
        <Flex flexDir={"column"} gap={4}>
            <Flex flexDir={"column"} gap={4} pb={4}>
                <Heading>מעקב קלוריות שבועי</Heading>
                <Flex justify={"space-between"} align={"center"}>
                    <Button
                        variant={"outline"}
                        onClick={() =>
                            setFromTo((prev) => [
                                prev[1].plusDays(1),
                                prev[1].plusDays(7),
                            ])
                        }
                    >
                        {"<<"}
                    </Button>
                    <Text>
                        {fromTo[0].format(
                            DateTimeFormatter.ofPattern("dd/MM/yyyy")
                        )}{" "}
                        -{" "}
                        {fromTo[1].format(
                            DateTimeFormatter.ofPattern("dd/MM/yyyy")
                        )}
                    </Text>
                    <Button
                        variant={"outline"}
                        onClick={() =>
                            setFromTo((prev) => [
                                prev[0].minusDays(7),
                                prev[0].minusDays(1),
                            ])
                        }
                    >
                        {">>"}
                    </Button>
                </Flex>
            </Flex>
            <Box w="full" h={"250px"}>
                <Chart
                    options={{
                        dark: colorMode === "dark",
                        data,
                        primaryAxis,
                        secondaryAxes,
                    }}
                />
            </Box>
            <Box w={"full"} textAlign={"center"}>
                <Button asChild variant={"ghost"}>
                    <Link to="/all_menus">
                        לפירוט מלא <LuArrowLeft />
                    </Link>
                </Button>
            </Box>
        </Flex>
    );
};
