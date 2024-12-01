import { NativeSelectField, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { getAccountDetailsQueryOptions } from "../../../queries/api.queries";
import { fetchErrorMessage } from "../../../api";
import { useUpdateAccountDetailsMutation } from "../../../hooks/useUpdateAccountDetailsMutation";
import { NativeSelectRoot } from "../../ui/native-select";
import { Field } from "../../ui/field";

export const GenderSelect = () => {
    const query = useQuery(getAccountDetailsQueryOptions);
    const updateAccountMutation = useUpdateAccountDetailsMutation();
    if (query.isLoading || query.isPending) {
        return <Text>טוען מידע</Text>;
    }
    if (query.isError) {
        return <Text>{fetchErrorMessage(query.error)}</Text>;
    }

    return (
        <Field label="מין">
            <NativeSelectRoot>
                <NativeSelectField
                    onChange={(e) =>
                        updateAccountMutation.mutate(
                            { gender: e.currentTarget.value },
                            { onSuccess: () => query.refetch() }
                        )
                    }
                    placeholder="מין"
                    value={query.data.data.gender ?? undefined}
                >
                    <option value="גבר">גבר</option>
                    <option value="אישה">אישה</option>
                </NativeSelectField>
            </NativeSelectRoot>
        </Field>
    );
};
