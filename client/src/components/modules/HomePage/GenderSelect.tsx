import { NativeSelectField } from "@chakra-ui/react";
import { Field } from "../../ui/field";
import { NativeSelectRoot } from "../../ui/native-select";

export const GenderSelect = (props: {
    gender: string | null;
    onChange: (gender: string) => void;
}) => {
    return (
        <Field label="מגדר">
            <NativeSelectRoot>
                <NativeSelectField
                    onChange={(e) => props.onChange(e.currentTarget.value)}
                    placeholder="מגדר"
                    value={props.gender ?? ""}
                >
                    <option value="גבר">גבר</option>
                    <option value="אישה">אישה</option>
                </NativeSelectField>
            </NativeSelectRoot>
        </Field>
    );
};
