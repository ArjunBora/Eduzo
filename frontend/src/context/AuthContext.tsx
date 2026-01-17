import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginService, register as registerService } from '../services/auth';

interface AuthContextType {
    user: any;
    token: string | null;
    login: (credentials: any) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            // Decode token or fetch user profile if needed
            // For now, we assume if token exists, user is authenticated
        }
    }, [token]);

    const login = async (credentials: any) => {
        const data = await loginService(credentials);
        localStorage.setItem('token', data.access_token);
        setToken(data.access_token);
        // You might want to decode the jwt here to get user info like role
    };

    const register = async (userData: any) => {
        await registerService(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
