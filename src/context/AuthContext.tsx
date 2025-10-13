import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    session: Session | null;
    login: (email: string, pass: string) => Promise<void>;
    signup: (name: string, email: string, pass: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Set up auth state listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
            setSession(newSession);
            setUser(newSession?.user ?? null);
            setIsAuthenticated(!!newSession);
            
            if (event === 'SIGNED_OUT') {
                navigate('/login', { replace: true });
            }
        });

        // THEN check for existing session
        supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
            setSession(existingSession);
            setUser(existingSession?.user ?? null);
            setIsAuthenticated(!!existingSession);
            setIsLoading(false);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, [navigate]);

    const login = async (email: string, pass: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: pass,
        });

        if (error) {
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
        }
        
        setSession(data.session);
        setUser(data.user);
        setIsAuthenticated(true);
        navigate('/dashboard');
    };
    
    const signup = async (name: string, email: string, pass: string) => {
        if (!name.trim()) throw new Error('الاسم مطلوب.');
        if (pass.length < 6) throw new Error('يجب أن تكون كلمة المرور 6 أحرف على الأقل.');

        const redirectUrl = `${window.location.origin}/dashboard`;
        
        const { data, error } = await supabase.auth.signUp({
            email,
            password: pass,
            options: {
                emailRedirectTo: redirectUrl,
                data: {
                    full_name: name,
                }
            }
        });
        
        if (error) {
            throw new Error(error.message || 'فشل إنشاء الحساب. قد يكون البريد الإلكتروني مستخدمًا.');
        }
        
        setSession(data.session);
        setUser(data.user);
        setIsAuthenticated(true);
        navigate('/dashboard');
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error logging out:', error);
        }
        setSession(null);
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, session, login, signup, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
