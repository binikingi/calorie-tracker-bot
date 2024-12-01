import { Router } from "express";
import { z } from "zod";
import {
    getAccountDailyTrack,
    getAccountDataById,
    getAccountMenuForDate,
    getAccountMenusFromDate,
    getAcountCalorieTrackBetweenDates,
    updateAccountDetailById,
} from "./account/account.controller";
import { authenticated } from "./authenticated.middleware";
import { safeParseLocalDate } from "./date.utils";
import { client } from "./db";

export const apiRouter = Router();

apiRouter.get("/api/user", authenticated, async (req, res) => {
    const data = await getAccountDataById(client, req.accountId);
    if (data === null) {
        res.status(404).json({ error: "לא נמצא משתמש" });
        return;
    }

    res.json(data);
    return;
});

const patchAccountDetailsSchema = z.object({
    weight: z.number().optional(),
    height: z.number().optional(),
    yearOfBirth: z.number().optional(),
    gender: z.union([z.literal("גבר"), z.literal("אישה")]).optional(),
});

apiRouter.patch("/api/user", authenticated, async (req, res) => {
    const parseResult = patchAccountDetailsSchema.safeParse(req.body);
    if (!parseResult.success) {
        res.status(400).json({ error: "פרטים לא תקינים" });
        return;
    }

    await updateAccountDetailById(client, req.accountId, parseResult.data);
    res.sendStatus(200);
    return;
});

apiRouter.get("/api/track/:date", authenticated, async (req, res) => {
    const date = req.params.date;
    const parseLocalDateResult = safeParseLocalDate(date);

    if (parseLocalDateResult === null) {
        res.status(400).json({ error: "תאריך לא תקין" });
        return;
    }

    const result = await getAccountDailyTrack(
        client,
        req.accountId,
        parseLocalDateResult
    );

    res.json(result);
});

apiRouter.get(
    "/api/track_calories/:from/:to",
    authenticated,
    async (req, res) => {
        const from = req.params.from;
        const to = req.params.to;

        const parseLocalDateFromResult = safeParseLocalDate(from);
        const parseLocalDateToResult = safeParseLocalDate(to);

        if (
            parseLocalDateFromResult === null ||
            parseLocalDateToResult === null
        ) {
            res.status(400).json({ error: "תאריך לא תקין" });
            return;
        }

        const result = await getAcountCalorieTrackBetweenDates(
            client,
            req.accountId,
            parseLocalDateFromResult,
            parseLocalDateToResult
        );

        res.json(result);
    }
);

apiRouter.get("/api/menus/:from", authenticated, async (req, res) => {
    const from = req.params.from;
    const parseLocalDateResult = safeParseLocalDate(from);

    if (parseLocalDateResult === null) {
        res.status(400).json({ error: "תאריך לא תקין" });
        return;
    }

    const response = await getAccountMenusFromDate(
        client,
        req.accountId,
        parseLocalDateResult
    );

    res.json(response);
});

apiRouter.get("/api/menu/:date", authenticated, async (req, res) => {
    const date = req.params.date;

    const parseLocalDateResult = safeParseLocalDate(date);

    if (parseLocalDateResult === null) {
        res.status(400).json({ error: "תאריך לא תקין" });
        return;
    }

    const response = await getAccountMenuForDate(
        client,
        req.accountId,
        parseLocalDateResult
    );

    res.json({ foods: response });
});
