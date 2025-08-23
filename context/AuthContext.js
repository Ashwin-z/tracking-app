// context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'auth_user';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { name, email }

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) setUser(JSON.parse(raw));
    })();
  }, []);

  const signIn = async (u) => {
    setUser(u);
    await AsyncStorage.setItem(KEY, JSON.stringify(u));
  };

  const signOut = async () => {
    setUser(null);
    await AsyncStorage.removeItem(KEY);
  };

  const updateEmailLocal = async (email) => {
    setUser(prev => (prev ? { ...prev, email } : prev));
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      parsed.email = email;
      await AsyncStorage.setItem(KEY, JSON.stringify(parsed));
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, updateEmailLocal }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
