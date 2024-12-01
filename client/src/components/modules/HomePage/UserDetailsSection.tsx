import { Bleed, Box, Button, Flex, Separator } from "@chakra-ui/react";
import { AgeInput } from "./YearOfBirthInput";
import { GenderSelect } from "./GenderSelect";
import { WeightInput } from "./WeightInput";
import { HeightInput } from "./HeightInput";
import { CalorieIntake } from "./CalorieIntake";
import { DailyTrack } from "./DailyTrack";
import { WeeklyCalorieTrack } from "./WeeklyCalorieTrack";
import { getAccountDetailsQueryOptions } from "../../../queries/api.queries";
import { useUpdateAccountDetailsMutation } from "../../../hooks/useUpdateAccountDetailsMutation";
import { infiniteQueryOptions, useQuery } from "@tanstack/react-query";
import React from "react";

export const UserDetailsSection = () => {
    const { isSuccess, data, refetch } = useQuery({
        ...getAccountDetailsQueryOptions,
        staleTime: Infinity,
    });
    const updateAccountMutation = useUpdateAccountDetailsMutation();
    const [accountData, setAccountData] = React.useState<{
        weight: number | null;
        height: number | null;
        yearOfBirth: number | null;
        gender: string | null;
    }>({
        gender: null,
        height: null,
        weight: null,
        yearOfBirth: null,
    });

    React.useEffect(() => {
        if (isSuccess) {
            setAccountData({
                gender: data.data.gender,
                height: data.data.height,
                weight: data.data.weight,
                yearOfBirth: data.data.yearOfBirth,
            });
        }
    }, [isSuccess, data]);

    const updateAccountData = () => {
        updateAccountMutation.mutate(
            {
                gender: accountData.gender ?? undefined,
                height: accountData.height ?? undefined,
                weight: accountData.weight ?? undefined,
                yearOfBirth: accountData.yearOfBirth ?? undefined,
            },
            {
                onSuccess: () => refetch(),
            }
        );
    };

    return (
        <Box>
            <Bleed>
                <Flex flexDir={"column"} gap={2} w={"full"}>
                    <Flex w={"full"} gap={2} justify={"center"}>
                        <GenderSelect
                            gender={accountData.gender}
                            onChange={(gender) =>
                                setAccountData((prev) => ({ ...prev, gender }))
                            }
                        />
                        <AgeInput
                            yearOfBirth={accountData.yearOfBirth}
                            onChange={(yearOfBirth) =>
                                setAccountData((prev) => ({
                                    ...prev,
                                    yearOfBirth,
                                }))
                            }
                        />
                        <WeightInput
                            weight={accountData.weight}
                            onChange={(weight) =>
                                setAccountData((prev) => ({ ...prev, weight }))
                            }
                        />
                        <HeightInput
                            height={accountData.height}
                            onChange={(height) =>
                                setAccountData((prev) => ({ ...prev, height }))
                            }
                        />
                    </Flex>
                    <Button variant={"outline"} onClick={updateAccountData}>
                        שמירה
                    </Button>
                </Flex>
            </Bleed>
            <CalorieIntake />
            <Separator />
            <DailyTrack />
            <Separator />
            <WeeklyCalorieTrack />
        </Box>
    );
};
