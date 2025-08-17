import { Stack } from 'expo-router';

export default function StatsLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="[id]"
                options={{
                    headerShown: false
                }}
            />
        </Stack>
    );
}