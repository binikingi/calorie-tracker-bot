import { Flex, Heading } from "@chakra-ui/react";
import { ColorModeButton, useColorModeValue } from "./components/ui/color-mode";

function App() {
  return (
    <Flex w={"full"} flexDir={"column"} gap={8}>
      <Flex
        background={useColorModeValue("gray.50", "gray.800")}
        w={"full"}
        flexDir={"row"}
        justify={"space-around"}
        p={8}
      >
        <Heading>EatBot</Heading>
        <ColorModeButton />
      </Flex>
      <Flex w={"full"} align={"center"} flexDir={"column"} gap={4}>
        <Heading size={"4xl"}>Welcome To EatBot!</Heading>
        <Heading size={"md"}>coming soon...</Heading>
      </Flex>
    </Flex>
  );
}

export default App;
