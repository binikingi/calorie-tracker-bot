import { useState, useEffect } from "react";
import { Box, Container, Heading, Stack, HStack } from "@chakra-ui/react";
import { Button } from "../../ui/button";
import { Field } from "../../ui/field";
import { useColorModeValue } from "../../ui/color-mode";
import { ImageIcon, SendIcon, TypeIcon } from "lucide-react";

export function FoodEntryPage() {
    const [text, setText] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [inputMode, setInputMode] = useState<"text" | "image">("text");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [progress, setProgress] = useState(0);

    const bgColor = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.700");
    const textColor = useColorModeValue("gray.800", "white");
    const textareaBg = useColorModeValue("white", "gray.700");
    const textareaBorder = useColorModeValue("gray.200", "gray.600");
    const textareaColor = useColorModeValue("gray.800", "white");

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isSubmitting && progress < 99) {
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 99;
                    }
                    return prev + 1;
                });
            }, 50);
        }
        return () => clearInterval(interval);
    }, [isSubmitting, progress]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setProgress(0);

        try {
            // TODO: Implement API call to save food entry
            await new Promise((resolve) => setTimeout(resolve, 5000)); // Simulated API call
            console.log("Submitting food entry:", { text, image });
        } catch (error) {
            console.error("Error submitting food entry:", error);
        } finally {
            setIsSubmitting(false);
            setProgress(0);
        }
    };

    return (
        <Container maxW="container.md" py={4}>
            <Box
                bg={bgColor}
                borderRadius="lg"
                boxShadow="md"
                overflow="hidden"
            >
                <Box p={6} borderBottomWidth={1} borderColor={borderColor}>
                    <Heading size="md" color={textColor}>
                        תיעוד חדש
                    </Heading>
                </Box>
                <Box p={6}>
                    <form onSubmit={handleSubmit}>
                        <Stack gap={4}>
                            <HStack>
                                <Button
                                    variant={
                                        inputMode === "text"
                                            ? "solid"
                                            : "outline"
                                    }
                                    onClick={() => setInputMode("text")}
                                    type="button"
                                    disabled={isSubmitting}
                                >
                                    <TypeIcon
                                        size={16}
                                        style={{ marginRight: "8px" }}
                                    />
                                    טקסט
                                </Button>
                                <Button
                                    variant={
                                        inputMode === "image"
                                            ? "solid"
                                            : "outline"
                                    }
                                    onClick={() => setInputMode("image")}
                                    type="button"
                                    disabled={isSubmitting}
                                >
                                    <ImageIcon
                                        size={16}
                                        style={{ marginRight: "8px" }}
                                    />
                                    תמונה
                                </Button>
                            </HStack>

                            {inputMode === "text" ? (
                                <Field label="תיאור האוכל">
                                    <textarea
                                        value={text}
                                        onChange={(e) =>
                                            setText(e.target.value)
                                        }
                                        placeholder="תאר את האוכל שלך..."
                                        style={{
                                            minHeight: "100px",
                                            width: "100%",
                                            padding: "8px",
                                            backgroundColor: textareaBg,
                                            borderColor: textareaBorder,
                                            color: textareaColor,
                                            borderRadius: "4px",
                                            border: "1px solid",
                                        }}
                                        disabled={isSubmitting}
                                    />
                                </Field>
                            ) : (
                                <Field label="העלאת תמונה">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        style={{ display: "none" }}
                                        id="image-input"
                                        disabled={isSubmitting}
                                    />
                                    <label htmlFor="image-input">
                                        <Button
                                            as="span"
                                            disabled={isSubmitting}
                                        >
                                            <ImageIcon
                                                size={16}
                                                style={{ marginRight: "8px" }}
                                            />
                                            בחירת תמונה
                                        </Button>
                                    </label>
                                    {previewUrl && (
                                        <Box mt={2}>
                                            <img
                                                src={previewUrl}
                                                alt="תצוגה מקדימה"
                                                style={{
                                                    maxWidth: "300px",
                                                    borderRadius: "8px",
                                                }}
                                            />
                                        </Box>
                                    )}
                                </Field>
                            )}

                            <Button
                                type="submit"
                                disabled={
                                    isSubmitting ||
                                    (inputMode === "text" ? !text : !image)
                                }
                            >
                                {isSubmitting ? (
                                    `${progress}%`
                                ) : (
                                    <>
                                        <SendIcon
                                            size={16}
                                            style={{ marginRight: "8px" }}
                                        />
                                        שלח
                                    </>
                                )}
                            </Button>
                        </Stack>
                    </form>
                </Box>
            </Box>
        </Container>
    );
}
