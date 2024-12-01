import { NativeSelectField, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { getAccountDetailsQueryOptions } from "../../../queries/api.queries";
import { fetchErrorMessage } from "../../../api";
import { useUpdateAccountDetailsMutation } from "../../../hooks/useUpdateAccountDetailsMutation";
import { NativeSelectRoot } from "../../ui/native-select";
import { Field } from "../../ui/field";

export const GenderSelect = (props: {
    gender: string | null;
    onChange: (gender: string) => void;
}) => {
    return (
        <Field label="מין">
            <NativeSelectRoot>
                <NativeSelectField
                    onChange={(e) => props.onChange(e.currentTarget.value)}
                    placeholder="מין"
                    value={props.gender ?? undefined}
                >
                    <option value="גבר">גבר</option>
                    <option value="אישה">אישה</option>
                </NativeSelectField>
            </NativeSelectRoot>
        </Field>
    );
};
