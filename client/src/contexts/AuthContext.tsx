/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';

type User = {
  email: string;
} | null;

type AuthContextType = {
  user: User;
  setUser: Dispatch<SetStateAction<User>>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isAuthenticated: false,
});

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
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
