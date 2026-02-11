import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { User, AuthError, SignInWithPasswordCredentials, SignUpWithPasswordCredentials } from '@supabase/supabase-js';
import { isSuperAdmin } from '../utils/authRoles';

/**
 * Tipo del contexto de autenticación
 */
export interface AuthContextType {
    user: User | null;
    signUp: (credentials: SignUpWithPasswordCredentials) => Promise<{ data: any; error: AuthError | null }>;
    signIn: (credentials: SignInWithPasswordCredentials) => Promise<{ data: any; error: AuthError | null }>;
    signOut: () => Promise<{ error: AuthError | null }>;
    impersonatedUser: string | null;
    setImpersonatedUser: (userId: string | null) => void;
    isMaster: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [impersonatedUser, setImpersonatedUser] = useState<string | null>(() => {
        return localStorage.getItem('clicando_impersonated_user');
    });

    const isMaster = isSuperAdmin(user);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setLoading(false);
        };

        getSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setUser(session?.user ?? null);
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    // Persistir impersonación
    useEffect(() => {
        if (impersonatedUser) {
            localStorage.setItem('clicando_impersonated_user', impersonatedUser);
        } else {
            localStorage.removeItem('clicando_impersonated_user');
        }
    }, [impersonatedUser]);

    const value: AuthContextType = {
        signUp: (data) => supabase.auth.signUp(data),
        signIn: (data) => supabase.auth.signInWithPassword(data),
        signOut: () => supabase.auth.signOut(),
        user,
        impersonatedUser,
        setImpersonatedUser,
        isMaster
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
