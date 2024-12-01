import { atomWithStorage } from "jotai/utils";
import { Account } from "./Account.interface";
import { useAtom } from "jotai/react";

const accountAtom = atomWithStorage<Account | null>("account", null);

export const useAccount = () => {
    return useAtom(accountAtom);
};
