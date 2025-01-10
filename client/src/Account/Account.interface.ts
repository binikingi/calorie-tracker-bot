import z from "zod";

export const AccountSchema = z.object({
    id: z.number(),
    token: z.string(),
});

export type Account = z.infer<typeof AccountSchema>;
