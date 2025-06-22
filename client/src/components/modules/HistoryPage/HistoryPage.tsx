import { Box, Button, Flex, Heading, Separator } from "@chakra-ui/react";
import { DateTimeFormatter, LocalDate } from "@js-joda/core";
import { useInfiniteQuery } from "@tanstack/react-query";
import React from "react";
import { LuArrowLeft } from "react-icons/lu";
import { getAllMenuQueryOptions } from "../../../queries/api.queries";
import { Link } from "@tanstack/react-router";

export const HistoryPage = () => {
    const [queryDate] = React.useState(LocalDate.now());
    const { data, fetchNextPage, hasNextPage, isSuccess, isFetchingNextPage } =
        useInfiniteQuery(getAllMenuQueryOptions(queryDate));

    React.useEffect(() => {
        const onScroll = () => {
            if (
                window.innerHeight + window.scrollY ===
                    document.body.scrollHeight &&
                hasNextPage &&
                !isFetchingNextPage
            ) {
                fetchNextPage();
            }
        };
        window.addEventListener("scroll", onScroll);
        return () => {
            window.removeEventListener("scroll", onScroll);
        };
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    if (!isSuccess) {
        return <Box>טוען...</Box>;
    }

    const render = data.pages.flatMap((page, pi) =>
        page.data.menus.map((menu, mi) => {
            return (
                <React.Fragment key={menu.date.toString()}>
                    <Flex
                        px={2}
                        flexDir={"row"}
                        w={"full"}
                        justify={"space-between"}
                        align={"center"}
                    >
                        <Flex
                            key={menu.date.toString()}
                            flexDir={"column"}
                            gap={2}
                        >
                            <Heading>
                                {LocalDate.parse(menu.date).format(
                                    DateTimeFormatter.ofPattern("dd/MM/yyyy")
                                )}
                            </Heading>
                            <Box>
                                🥛 חלבון: <b>{menu.totalProtein.toFixed(2)}</b>{" "}
                                גרם
                            </Box>
                            <Box>
                                🥜 שומן: <b>{menu.totalFat.toFixed(2)}</b> גרם
                            </Box>
                            <Box>
                                🥐 פחמימה: <b>{menu.totalCarbs.toFixed(2)}</b>{" "}
                                גרם
                            </Box>
                            <Box>
                                ✅ קלוריות:{" "}
                                <b>{menu.totalCalories.toFixed(2)}</b>
                            </Box>
                        </Flex>
                        <Button asChild>
                            <Link
                                to={"/menu/$date"}
                                params={{ date: menu.date }}
                            >
                                <LuArrowLeft />
                            </Link>
                        </Button>
                    </Flex>
                    {pi === data.pages.length - 1 &&
                    mi === page.data.menus.length - 1 ? null : (
                        <Separator />
                    )}
                </React.Fragment>
            );
        })
    );

    return (
        <Flex flexDir={"column"} w={"full"} gap={4} p={4}>
            <Heading>היסטורית מעקבים</Heading>
            <Flex flexDir={"column"} w={"full"} gap={4} overflowY={"scroll"}>
                {render}
                {!hasNextPage && (
                    <Box w={"full"} textAlign={"center"}>
                        <Heading size={"md"}>זה הכל!</Heading>
                    </Box>
                )}
            </Flex>
        </Flex>
    );
};
