import { Input, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce, usePrevious } from "@uidotdev/usehooks";
import React from "react";
import { fetchErrorMessage } from "../../../api";
import { useUpdateAccountDetailsMutation } from "../../../hooks/useUpdateAccountDetailsMutation";
import { getAccountDetailsQueryOptions } from "../../../queries/api.queries";
import { Field } from "../../ui/field";

export const AgeInput = () => {
    const [yearOfBirth, setYearOfBirth] = React.useState<number>(0);
    const query = useQuery({ ...getAccountDetailsQueryOptions });
    const updateAccountMutation = useUpdateAccountDetailsMutation();
    const debounceVal = useDebounce(yearOfBirth, 500);
    const prevDebounceVal = usePrevious(debounceVal);

    React.useEffect(() => {
        if (query.isSuccess) {
            setYearOfBirth(query.data.data.yearOfBirth ?? 0);
        }
    }, [query.isSuccess]);

    React.useEffect(() => {
        if (debounceVal !== prevDebounceVal && prevDebounceVal) {
            updateAccountMutation.mutate(
                { yearOfBirth },
                {
                    onSuccess: () => query.refetch(),
                }
            );
        }
    }, [debounceVal, prevDebounceVal]);

    if (query.isLoading || query.isPending) {
        return <Text>טוען מידע</Text>;
    }
    if (query.isError) {
        return <Text>{fetchErrorMessage(query.error)}</Text>;
    }
    return (
        <Field label="שנת לידה">
            <Input
                type="number"
                min={1900}
                max={new Date().getFullYear()}
                value={yearOfBirth}
                onChange={(e) =>
                    setYearOfBirth(parseInt(e.currentTarget.value))
                }
                placeholder="שנת לידה"
            />
        </Field>
    );
};
