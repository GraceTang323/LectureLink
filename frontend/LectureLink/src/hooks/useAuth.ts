import { useContext } from 'react';
import { AuthContext } from '@/src/context/AuthContext';

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('Error getting AuthProvider');
    }
    return context;
}