import { Stack } from 'expo-router';
import React from 'react';

const FormLayout = () => {
    return (
        <Stack>
            <Stack.Screen
                name="createform"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="[id]"
                options={{
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="edit"
                options={{
                    headerShown: false,
                }}
            />
        </Stack>
    )
}

export default FormLayout;