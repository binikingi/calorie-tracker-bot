import { LocalDate } from "@js-joda/core";

export function safeParseLocalDate(date: string) {
    try {
        return LocalDate.parse(date);
    } catch {
        return null;
    }
}
