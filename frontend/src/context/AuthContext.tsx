import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/user';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<boolean>;
    register: (name: string, email: string, password: string) => Promise<boolean>;
    logout: () => void;
    clearError: () => void;
    refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        error: null
    });

    // Check for stored tokens on mount
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken');
                const refreshToken = localStorage.getItem('refreshToken');

                if (accessToken && refreshToken) {
                    // Verify token with backend
                    const response = await fetch('/api/auth/verify', {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    });

                    if (response.ok) {
                        const { user } = await response.json();
                        setState({
                            user,
                            isAuthenticated: true,
                            isLoading: false,
                            error: null
                        });
                    } else {
                        // Try to refresh token
                        const refreshSuccess = await refreshAuthToken();
                        if (!refreshSuccess) {
                            clearAuthData();
                        }
                    }
                } else {
                    setState(prev => ({ ...prev, isLoading: false }));
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                clearAuthData();
            }
        };

        checkAuthStatus();
    }, []);

    const clearAuthData = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
        });
    };

    const refreshAuthToken = async (): Promise<boolean> => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) return false;

            const response = await fetch('/api/auth/refresh-tokens', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken })
            });

            if (response.ok) {
                const { tokens, user } = await response.json();
                localStorage.setItem('accessToken', tokens.access.token);
                localStorage.setItem('refreshToken', tokens.refresh.token);

                setState({
                    user,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Token refresh failed:', error);
            return false;
        }
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const { user, tokens } = await response.json();

                localStorage.setItem('accessToken', tokens.access.token);
                localStorage.setItem('refreshToken', tokens.refresh.token);

                setState({
                    user,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null
                });
                return true;
            } else {
                const errorData = await response.json();
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: errorData.message || 'Login failed'
                }));
                return false;
            }
        } catch (error) {
            console.error('Network error:', error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Network error. Please try again.'
            }));
            return false;
        }
    };

    const register = async (name: string, email: string, password: string): Promise<boolean> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });

            if (response.ok) {
                const { user, tokens } = await response.json();

                localStorage.setItem('accessToken', tokens.access.token);
                localStorage.setItem('refreshToken', tokens.refresh.token);

                setState({
                    user,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null
                });
                return true;
            } else {
                const errorData = await response.json();
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: errorData.message || 'Registration failed'
                }));
                return false;
            }
        } catch (error) {
            console.error('Network error:', error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Network error. Please try again.'
            }));
            return false;
        }
    };

    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ refreshToken })
                });
            }
        } catch (error) {
            console.error('Logout API call failed:', error);
        } finally {
            clearAuthData();
        }
    };

    const clearError = () => {
        setState(prev => ({ ...prev, error: null }));
    };

    const refreshToken = async (): Promise<boolean> => {
        return refreshAuthToken();
    };

    const contextValue: AuthContextType = {
        ...state,
        login,
        register,
        logout,
        clearError,
        refreshToken
    };

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
