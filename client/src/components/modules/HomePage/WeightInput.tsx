import { Badge, Input, Text } from "@chakra-ui/react";
import { Field } from "../../ui/field";

export const WeightInput = (props: {
    weight: number | null;
    onChange: (weight: number | null) => void;
}) => {
    return (
        <Field
            label={
                <Text>
                    משקל <Badge color={"green"}>ק״ג</Badge>
                </Text>
            }
        >
            <Input
                type="number"
                min={0}
                value={props.weight ?? undefined}
                onChange={(e) => {
                    const weight = parseInt(e.currentTarget.value);
                    if (isNaN(weight)) {
                        props.onChange(null);
                    } else {
                        props.onChange(weight);
                    }
                }}
                placeholder="משקל"
            />
        </Field>
    );
};
