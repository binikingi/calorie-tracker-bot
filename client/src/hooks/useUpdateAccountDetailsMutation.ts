import { useMutation } from "@tanstack/react-query";
import { api, getAuthorizationHeader } from "../api";

export const useUpdateAccountDetailsMutation = () => {
    return useMutation({
        mutationFn: (params: {
            yearOfBirth?: number;
            weight?: number;
            height?: number;
            gender?: string;
        }) => {
            return api.patch("/api/user", params, {
                headers: getAuthorizationHeader(),
            });
        },
    });
};
