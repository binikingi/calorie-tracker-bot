import { Badge, Input, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce, usePrevious } from "@uidotdev/usehooks";
import React from "react";
import { fetchErrorMessage } from "../../../api";
import { useUpdateAccountDetailsMutation } from "../../../hooks/useUpdateAccountDetailsMutation";
import { getAccountDetailsQueryOptions } from "../../../queries/api.queries";
import { Field } from "../../ui/field";
import { InputGroup } from "../../ui/input-group";

export const HeightInput = () => {
    const [height, setHeight] = React.useState<number>(0);
    const query = useQuery({ ...getAccountDetailsQueryOptions });
    const updateAccountMutation = useUpdateAccountDetailsMutation();
    const debounceVal = useDebounce(height, 500);
    const prevDebounceVal = usePrevious(debounceVal);

    React.useEffect(() => {
        if (query.isSuccess) {
            setHeight(query.data.data.height ?? 0);
        }
    }, [query.isSuccess]);

    React.useEffect(() => {
        if (debounceVal !== prevDebounceVal && prevDebounceVal) {
            updateAccountMutation.mutate(
                { height },
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
        <Field label="גובה">
            <InputGroup endElement={<Badge color={"green"}>ס״מ</Badge>}>
                <Input
                    type="number"
                    min={0}
                    value={height}
                    onChange={(e) => setHeight(parseInt(e.currentTarget.value))}
                    placeholder="משקל"
                />
            </InputGroup>
        </Field>
    );
};
