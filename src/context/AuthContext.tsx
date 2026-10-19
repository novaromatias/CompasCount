import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  isGuest: boolean;
  loginWithGoogleMock: (name?: string, email?: string) => Promise<void>;
  logout: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
}

const USER_STORAGE_KEY = '@compascount_user_session';

const DEFAULT_GUEST: UserProfile = {
  id: 'guest-user',
  name: 'Invitado',
  isGuest: true,
};

const AuthContext = createContext<AuthContextType>({
  user: DEFAULT_GUEST,
  isGuest: true,
  loginWithGoogleMock: async () => {},
  logout: async () => {},
  continueAsGuest: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(DEFAULT_GUEST);

  useEffect(() => {
    async function loadUserSession() {
      try {
        const stored = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (stored) {
          setUser(JSON.parse(stored));
        } else {
          setUser(DEFAULT_GUEST);
        }
      } catch (err) {
        console.error('Error cargando sesión local:', err);
        setUser(DEFAULT_GUEST);
      }
    }
    loadUserSession();
  }, []);

  const loginWithGoogleMock = async (
    name: string = 'Matias Novaro',
    email: string = 'matias.novaro@gmail.com'
  ) => {
    const mockGoogleUser: UserProfile = {
      id: `usr-google-${Date.now()}`,
      name,
      email,
      isGuest: false,
      avatarUrl: 'https://lh3.googleusercontent.com/a/default-user',
    };
    setUser(mockGoogleUser);
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockGoogleUser));
  };

  const logout = async () => {
    setUser(DEFAULT_GUEST);
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
  };

  const continueAsGuest = async () => {
    setUser(DEFAULT_GUEST);
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(DEFAULT_GUEST));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isGuest: !user || user.isGuest,
        loginWithGoogleMock,
        logout,
        continueAsGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
