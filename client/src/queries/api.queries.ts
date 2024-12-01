import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { api, getAuthorizationHeader } from "../api";
import { AxiosResponse } from "axios";
import { LocalDate } from "@js-joda/core";

export const getAccountDetailsQueryOptions = queryOptions({
    queryKey: ["userDetails"],
    queryFn: async () => {
        return api.get<
            any,
            AxiosResponse<{
                accountId: number;
                weight: number | null;
                height: number | null;
                yearOfBirth: number | null;
                gender: string | null;
                whatsappNumber: string;
                calorieIntake: number | null;
            }>
        >("/api/user", {
            headers: getAuthorizationHeader(),
        });
    },
});

export const getDailyTrackQueryOptions = (date: LocalDate) =>
    queryOptions({
        queryKey: ["dailyTrack", date.toString()],
        queryFn: async () => {
            return api.get<
                any,
                AxiosResponse<{
                    totalCalories: number;
                    totalProtein: number;
                    totalFat: number;
                    totalCarbs: number;
                }>
            >("/api/track/" + date.toString(), {
                headers: getAuthorizationHeader(),
            });
        },
    });

export const getDailyCaloriesQueryOptions = (
    fromTo: [LocalDate, LocalDate]
) => {
    return queryOptions({
        queryKey: ["dailyCalories", fromTo[0].toString(), fromTo[1].toString()],
        queryFn: async () => {
            return api.get<
                any,
                AxiosResponse<
                    {
                        date: string;
                        calories: number;
                    }[]
                >
            >(`/api/track_calories/${fromTo[0]}/${fromTo[1]}`, {
                headers: getAuthorizationHeader(),
            });
        },
        select: (data) => {
            return data.data.map((row) => ({
                date: LocalDate.parse(row.date),
                calories: row.calories,
            }));
        },
    });
};

export const getAllMenuQueryOptions = (fromDate: LocalDate) => {
    return infiniteQueryOptions({
        queryKey: ["allMenus"],
        queryFn: async ({ pageParam }) => {
            return api.get<
                any,
                AxiosResponse<{
                    menus: {
                        date: string;
                        totalCalories: number;
                        totalProtein: number;
                        totalFat: number;
                        totalCarbs: number;
                    }[];
                    nextDatePage: string | null;
                }>
            >(`/api/menus/${pageParam}`, {
                headers: getAuthorizationHeader(),
            });
        },
        initialPageParam: fromDate.toString(),
        getNextPageParam: (lastPage) => lastPage.data.nextDatePage,
    });
};

export const getMenuByDateSummaryQueryOptions = (date: LocalDate) => {
    return queryOptions({
        queryKey: ["menuByDate", date.toString()],
        queryFn: async () => {
            return api.get<
                any,
                AxiosResponse<{
                    foods: {
                        id: number;
                        name: string;
                        fat: number;
                        protein: number;
                        carbs: number;
                        calories: number;
                    }[];
                }>
            >(`/api/menu/${date}`, {
                headers: getAuthorizationHeader(),
            });
        },
    });
};
