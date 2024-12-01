import { Box, Flex, Separator } from "@chakra-ui/react";
import { AgeInput } from "./YearOfBirthInput";
import { GenderSelect } from "./GenderSelect";
import { WeightInput } from "./WeightInput";
import { HeightInput } from "./HeightInput";
import { CalorieIntake } from "./CalorieIntake";
import { DailyTrack } from "./DailyTrack";
import { WeeklyCalorieTrack } from "./WeeklyCalorieTrack";

export const UserDetailsSection = () => {
    return (
        <Box gap={2}>
            <Flex w={"full"} gap={2}>
                <GenderSelect />
                <AgeInput />
                <WeightInput />
                <HeightInput />
            </Flex>
            <CalorieIntake />
            <Separator />
            <DailyTrack />
            <Separator />
            <WeeklyCalorieTrack />
        </Box>
    );
};
