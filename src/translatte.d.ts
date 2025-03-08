declare module "translatte" {
    export default function translatte(
        text: string,
        options: { from?: string; to: string }
    ): Promise<{ text: string }>;
}
