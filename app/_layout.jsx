import { Stack } from "expo-router";

const RootLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{headerShown: false}}/> {/* This header shown thing removes the header */}
    </Stack>
  );
}

export default RootLayout;
