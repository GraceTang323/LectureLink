import { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch } from '../services/api'
import * as SecureStore from 'expo-secure-store';

interface AuthState {
    token: string | null;
    authenticated: boolean | null;
    loading: boolean;
}

interface AuthProps {
    authState: AuthState;
    onRegister: (email: string, password: string, displayName: string) => Promise<any>;
    onLogin: (email: string, password: string) => Promise<any>;
    onLogout: () => Promise<any>;
}

const IP_ADDRESS = process.env.EXPO_PUBLIC_IP_ADDRESS;
export const API_URL = `http://${IP_ADDRESS}:3000/api`;

export const AuthContext = createContext<AuthProps>({
    authState: {
        token: null,
        authenticated: null,
        loading: true,
    },
    onRegister: async () => {},
    onLogin: async () => {},
    onLogout: async () => {},
});

// need to handle login, register, and signout
export const AuthProvider = ({children}: any) => {
    const [authState, setAuthState] = useState<{
        token: string | null;
        authenticated: boolean | null;
        loading: boolean;
    }>({
        token: null,
        authenticated: null,
        loading: true,
    });

    const register = async (email: string, password: string, displayName: string) => {
        try {
            await fetch(`${API_URL}/auth/register`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, displayName })
             })
            .then(response => {
                if (!response.ok) throw new Error('Network error, please try again later');
                return response.json();
            })
            .then(data => console.log(data))
            .catch(error => console.error(error));
            // return 
        } catch (err) {
            return { error: true, message: (err as any).response.data.msg };
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
            const refreshToken = SecureStore.getItem('refreshToken');

            if (!refreshToken) {
                throw new Error("Error retrieving refresh token from secure store");
            }
            const response = await fetch(`${API_URL}/auth/logout`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });
            
            if (!response.ok) {
                throw new Error("Logout failed");
            }
            
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('refreshToken');
        } catch (err) {
            console.error(err);
            return { error: true, message: err instanceof Error ? err.message : "Logout failed" };
        }

        setAuthState({
            token: null,
            authenticated: false,
            loading: false,
        });

        return { success: true };
    }

    const value = {
        authState: authState,
        onRegister: register,
        onLogin: login,
        onLogout: logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};