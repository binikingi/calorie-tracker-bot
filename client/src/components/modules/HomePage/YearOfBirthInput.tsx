import { Input } from "@chakra-ui/react";
import { Field } from "../../ui/field";

export const AgeInput = (props: {
    yearOfBirth: number | null;
    onChange: (yearOfBirth: number | null) => void;
}) => {
    return (
        <Field label="שנת לידה">
            <Input
                type="number"
                min={1900}
                max={new Date().getFullYear()}
                value={props.yearOfBirth ?? undefined}
                onChange={(e) => {
                    const year = parseInt(e.currentTarget.value);
                    if (isNaN(year)) {
                        props.onChange(null);
                    } else {
                        props.onChange(year);
                    }
                }}
                placeholder="שנת לידה"
            />
        </Field>
    );
};
