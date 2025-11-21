/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import {
  login as loginApi,
  register as registerApi,
  logout as logoutApi,
  getCurrentUser,
} from '../api/auth';
import type { LoginRequest, RegisterRequest } from '../api/auth';

type User = {
  email: string;
  id: string;
  plan: 'free' | 'pro';
} | null;

type AuthContextType = {
  user: User;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Check auth status on mount using /me endpoint
  // Server returns { user: null } instead of throwing error if not authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const response = await getCurrentUser();

      if (response?.user) {
        setUser({
          email: response.user.email,
          id: response.user.id,
          plan: response.user.plan,
        });
      } else {
        setUser(null);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (data: LoginRequest) => {
    try {
      const response = await loginApi(data);

      // Cookies are automatically set by server for API authentication
      // We just store user info in state
      setUser({
        email: response.user.email,
        id: response.user.id,
        plan: response.user.plan,
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const response = await registerApi(data);

      // Cookies are automatically set by server for API authentication
      // We just store user info in state
      setUser({
        email: response.user.email,
        id: response.user.id,
        plan: response.user.plan,
      });
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Server clears cookies via logout endpoint
      // Just clear user state
      setUser(null);
    }
  };

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw new Error('AuthContext was used outside AuthProvider');
  return context;
}

export { AuthProvider, useAuth };
