import React, { useEffect, useState, createContext, useContext, ReactNode } from 'react';
interface User {
  nom: string;
  prenom: string;
  mail: string;
}
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider = ({ children }: {children: ReactNode;}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const token = localStorage.getItem('futurekawa_token');
    const storedUser = localStorage.getItem('futurekawa_user');
    if (token && storedUser) {
      setIsAuthenticated(true);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }
  }, []);
  const login = (token: string, userData: User) => {
    localStorage.setItem('futurekawa_token', token);
    localStorage.setItem('futurekawa_user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };
  const logout = () => {
    localStorage.removeItem('futurekawa_token');
    localStorage.removeItem('futurekawa_user');
    setIsAuthenticated(false);
    setUser(null);
  };
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout
      }}>
      
      {children}
    </AuthContext.Provider>);

};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};