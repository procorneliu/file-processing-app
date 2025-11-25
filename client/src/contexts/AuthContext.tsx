/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import type { ReactNode } from 'react';
import {
  login as loginApi,
  register as registerApi,
  logout as logoutApi,
  getCurrentUser,
} from '../api/auth';
import type { LoginRequest, RegisterRequest, UserProfile } from '../api/auth';

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
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateUserFromResponse = (response: { user: UserProfile } | null) => {
    if (response?.user) {
      setUser({
        email: response.user.email,
        id: response.user.id,
        plan: response.user.plan,
      });
    } else {
      setUser(null);
    }
  };

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getCurrentUser();
      updateUserFromResponse(response);
    } catch (error) {
      logError(error, 'Failed to refresh user');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check auth status on mount using /me endpoint
  // Server returns { user: null } instead of throwing error if not authenticated
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (data: LoginRequest) => {
    try {
      const response = await loginApi(data);
      updateUserFromResponse(response);
    } catch (error) {
      logError(error, 'Login failed');
      throw error;
    }
  };

  const logError = (error: unknown, defaultMessage: string) => {
    const message = error instanceof Error ? error.message : defaultMessage;
    console.error(message);
  };

  const register = async (data: RegisterRequest) => {
    try {
      const response = await registerApi(data);
      updateUserFromResponse(response);
    } catch (error) {
      logError(error, 'Registration failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      logError(error, 'Logout failed');
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
        refreshUser,
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
