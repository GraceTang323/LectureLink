const API_URL = `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/api`;

export async function apiFetch(
    endpoint: string,
    options: RequestInit = {},
    accessToken?: string
) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options, // pulls properties from the object
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {} ),
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Request failed");
    }

    return data;
}