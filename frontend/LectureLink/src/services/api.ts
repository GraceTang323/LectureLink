import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../hooks/useAuth';

const API_URL = `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/api`;
const { onRefresh } = useAuth();

export async function apiFetch(
    endpoint: string,
    options: RequestInit = {}, // defines the second fetch() argument
    accessToken?: string,
    refreshAttempt: boolean = false,
) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options, // pulls and formats properties from the object
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {} ),
        },
    });

    const data = await response.json();

    if (response.status === 401 && refreshAttempt === false) {
        // check for possible expired token
        const refreshToken = await SecureStore.getItemAsync("refreshToken");

        if (!refreshToken) {
            throw new Error("No refresh token available");
        }
        const newToken = await onRefresh(refreshToken);

        return apiFetch(endpoint, options, newToken, true);
    }
    if (!response.ok) {
        throw new Error(data.message || "Request failed");
    }

    return data;
}