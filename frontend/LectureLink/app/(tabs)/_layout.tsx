import { Tabs } from "expo-router";

export default function TabsLayout() {
    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: '#007AFF' }}>
            <Tabs.Screen name="index" options={{ headerShown: false }}/>
            <Tabs.Screen name="profile" options={{ headerShown: false }}/>
        </Tabs>
    )
}