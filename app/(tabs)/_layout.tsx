// app/api/(screen)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';
import { useSelector } from 'react-redux';

export default function ScreenTabLayout() {
    const { isLoggedIn } = useSelector((state: { auth: any }) => state.auth);
    return (
        <Tabs
            screenOptions={{
                header: () => (
                    <View style={{ padding: 16, alignItems: 'center' }}>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1f2937' }}>
                            <Text style={{ color: '#2563eb' }}>Feed</Text>backer
                        </Text>
                    </View>
                ),
                tabBarActiveTintColor: '#2563eb',
                tabBarStyle: { backgroundColor: '#f9fafb', height: 60 },
            }}
        >
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: "Dashboard",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="grid-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="listForm"
                options={{
                    title: "My Forms",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="list-circle-outline" color={color} size={size} />
                    ),
                }}
            />
            {/* <Tabs.Screen
                name="stats"
                options={{
                    title: "Stats",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="stats-chart-outline" color={color} size={size} />
                    ),
                }}
            /> */}
            <Tabs.Screen
                name={isLoggedIn ? "userProfile" : "login"}
                options={{
                    title: isLoggedIn ? "Profile" : "Login",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-circle-outline" color={color} size={size} />
                    ),
                }}
            />
        </Tabs>
    )
};
