import { createContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
    token: string | null;
    authenticated: boolean | null;
    profileComplete: boolean;
    loading: boolean;
}

interface AuthProps {
    authState: AuthState;
    onRegister: (email: string, password: string, confirmPassword: string) => Promise<any>;
    onLogin: (email: string, password: string) => Promise<any>;
    onLogout: () => Promise<any>;
    onRefresh: (refreshToken: string) => Promise<any>;
    completeProfile: () => void;
}

const IP_ADDRESS = process.env.EXPO_PUBLIC_IP_ADDRESS;
export const API_URL = `http://${IP_ADDRESS}:3000/api`;

export const AuthContext = createContext<AuthProps>({
    authState: {
        token: null,
        authenticated: null,
        profileComplete: false,
        loading: true,
    },
    onRegister: async () => {},
    onLogin: async () => {},
    onLogout: async () => {},
    onRefresh: async () => {},
    completeProfile: () => {},
});

// need to handle login, register, logout, and refresh
export const AuthProvider = ({children}: any) => {
    const [authState, setAuthState] = useState<{
        token: string | null;
        authenticated: boolean | null;
        profileComplete: boolean;
        loading: boolean;
    }>({
        token: null,
        authenticated: null,
        profileComplete: false,
        loading: true,
    });

    // check if user is already logged in on mount
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const savedRefreshToken = await SecureStore.getItemAsync("refreshToken");
                // refresh token exists, refresh for new access token and update auth status
                if (savedRefreshToken) {
                    const newToken = await refresh(savedRefreshToken);

                    setAuthState({
                        token: newToken,
                        authenticated: true,
                        profileComplete: authState.profileComplete,
                        loading: false,
                    });
                } else {
                    // await clean token table? periodically delete expired or revoked tokens in refresh_tokens table
                    setAuthState({
                        token: null,
                        authenticated: false,
                        profileComplete: authState.profileComplete, // TODO fix?
                        loading: false,
                    });
                }
            } catch (err) {
                console.error(err);
                setAuthState({
                    token: null,
                    authenticated: false,
                    profileComplete: authState.profileComplete,
                    loading: false,
                });
            }
        };
        restoreSession();
    }, []);

    useEffect(() => {
        console.log("AUTH STATE CHANGED:", {
            authenticated: authState.authenticated,
            profileStatus: authState.profileComplete,
            loading: authState.loading,
        });
    }, [authState]);

    const register = async (email: string, password: string, confirmPassword: string) => {
        try {
            if (email.length === 0 || password.length === 0) {
                throw new Error("Missing one or more fields");
            }
            if (password !== confirmPassword) {
                throw new Error("Passwords must match");
            }
            const displayName = email.split('@')[0]; // set default displayName as email header until changed

            const response = await fetch(`${API_URL}/auth/register`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, displayName })
             });

             const data = await response.json();

             if (!response.ok) {
                throw new Error(data.error || "Register failed");
             }

            await SecureStore.setItemAsync("accessToken", data.accessToken);
            await SecureStore.setItemAsync("refreshToken", data.refreshToken);

            setAuthState({
                token: data.accessToken,
                authenticated: true,
                profileComplete: false,
                loading: false
            });

            return data;
            
        } catch (err) {
            console.error(err);
            return { error: true, message: err instanceof Error ? err.message : "Register failed" };
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Login failed");
            }

            await SecureStore.setItemAsync("accessToken", data.accessToken);
            await SecureStore.setItemAsync("refreshToken", data.refreshToken);

            setAuthState({
                token: data.accessToken,
                authenticated: true,
                profileComplete: authState.profileComplete,
                loading: false
            });

            return data;
        } catch (err) {
            console.error(err);
            return { error: true, message: err instanceof Error ? err.message : "Login failed" };
        }
    }

    const logout = async () => {
        try {
            const refreshToken = await SecureStore.getItemAsync('refreshToken');

            if (refreshToken) { // refresh token exists, call backend endpoint first
                const response = await fetch(`${API_URL}/auth/logout`, { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken })
                });
            
                if (!response.ok) {
                    throw new Error("Logout failed");
                }
            }
            
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('refreshToken');

            setAuthState({
                token: null,
                authenticated: false,
                profileComplete: authState.profileComplete,
                loading: false,
            });

        } catch (err) {
            console.error(err);
            return { error: true, message: err instanceof Error ? err.message : "Logout failed" };
        }

        return { success: true };
    }

    const refresh = async (refreshToken: string) => {
        try {
            const response = await fetch(`${API_URL}/auth/refresh`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error("Refresh failed");
            }

            await SecureStore.setItemAsync('accessToken', data.accessToken);
            await SecureStore.setItemAsync('refreshToken', data.refreshToken);

            return data.accessToken;

        } catch (err) {
            console.error(err);
            return { error: true, message: err instanceof Error ? err.message : "Refresh failed" };
        }
    }


    const completeProfile = () => {
        setAuthState(prev => ({
            ...prev,
            profileComplete: true,
        }));
    };

    const value = {
        authState: authState,
        onRegister: register,
        onLogin: login,
        onLogout: logout,
        onRefresh: refresh,
        completeProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};