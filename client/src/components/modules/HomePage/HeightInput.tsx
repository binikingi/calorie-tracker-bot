import { Badge, Input, Text } from "@chakra-ui/react";
import { Field } from "../../ui/field";

export const HeightInput = (props: {
    height: number | null;
    onChange: (weight: number | null) => void;
}) => {
    return (
        <Field
            label={
                <Text>
                    גובה <Badge color={"green"}>ס״מ</Badge>
                </Text>
            }
        >
            <Input
                type="number"
                min={0}
                value={props.height ?? undefined}
                onChange={(e) => {
                    const height = parseInt(e.currentTarget.value);
                    if (isNaN(height)) {
                        props.onChange(null);
                    } else {
                        props.onChange(height);
                    }
                }}
                placeholder="משקל"
            />
        </Field>
    );
};
