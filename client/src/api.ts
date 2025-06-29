import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_SERVER_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fetchErrorMessage(error: any) {
    if (error.isAxiosError && error.response?.data?.error) {
        return error.response.data.error;
    }
    return "ארעה שגיאה";
}

export const getAuthorizationHeader = () => {
    const accountData = localStorage.getItem("account");
    if (accountData === null) {
        return {};
    }

    try {
        const account = JSON.parse(accountData);
        if (account.token) {
            return {
                Authorization: `Bearer ${account.token}`,
            };
        }
    } catch {
        // Nothing
    }
    return {};
};
