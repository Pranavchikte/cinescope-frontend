"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getAccessToken } from "./api";

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: any;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkAuth = () => {
            if (typeof window === "undefined") {
                setIsLoading(false);
                return;
            }

            const token = getAccessToken();
            setIsAuthenticated(!!token);
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
