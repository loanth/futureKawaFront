import React, { useEffect, useState, createContext, useContext, ReactNode } from 'react';
interface User {
  nom: string;
  prenom: string;
  mail: string;
}
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  selectedCountry: string | null;
  login: (token: string, user: User, selectedCountry?: string) => void;
  logout: () => void;
  setSelectedCountry: (country: string | null) => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider = ({ children }: {children: ReactNode;}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [selectedCountry, setSelectedCountryState] = useState<string | null>(null);
  
  useEffect(() => {
    const token = localStorage.getItem('futurekawa_token');
    const storedUser = localStorage.getItem('futurekawa_user');
    const storedCountry = localStorage.getItem('futurekawa_country');
    if (token && storedUser) {
      setIsAuthenticated(true);
      try {
        setUser(JSON.parse(storedUser));
        if (storedCountry) {
          setSelectedCountryState(storedCountry);
        }
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }
  }, []);
  
  const login = (token: string, userData: User, country?: string) => {
    localStorage.setItem('futurekawa_token', token);
    localStorage.setItem('futurekawa_user', JSON.stringify(userData));
    if (country) {
      localStorage.setItem('futurekawa_country', country);
      setSelectedCountryState(country);
    }
    setIsAuthenticated(true);
    setUser(userData);
  };
  
  const logout = () => {
    localStorage.removeItem('futurekawa_token');
    localStorage.removeItem('futurekawa_user');
    localStorage.removeItem('futurekawa_country');
    setIsAuthenticated(false);
    setUser(null);
    setSelectedCountryState(null);
  };
  
  const setSelectedCountry = (country: string | null) => {
    if (country) {
      localStorage.setItem('futurekawa_country', country);
    } else {
      localStorage.removeItem('futurekawa_country');
    }
    setSelectedCountryState(country);
  };
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        selectedCountry,
        login,
        logout,
        setSelectedCountry
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