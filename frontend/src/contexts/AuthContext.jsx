import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, updateUserName, setUserOnline } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState(localStorage.getItem('ilynect_lang') || 'te');
  const [theme, setTheme] = useState(localStorage.getItem('ilynect_theme') || 'dark');

  useEffect(() => {
    const storedUser = localStorage.getItem('ilynect_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {}
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('ilynect_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('ilynect_lang', language);
  }, [language]);

  useEffect(() => {
    if (user) {
      const presenceInterval = setInterval(() => {
        setUserOnline(user.id, user.name || user.displayName);
      }, 30000);
      setUserOnline(user.id, user.name || user.displayName);
      return () => clearInterval(presenceInterval);
    }
  }, [user]);

  const login = async (email, name) => {
    const data = await loginUser(email, name);
    const userData = {
      id: data.user.id,
      uid: data.user.id,
      email: data.user.email,
      name: data.user.name,
      displayName: data.user.name,
      role: data.user.role || 'user',
      avatar_color: data.user.avatar_color,
      avatar_index: data.user.avatar_index,
      flower: data.user.flower,
    };
    setUser(userData);
    localStorage.setItem('ilynect_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ilynect_user');
    localStorage.removeItem('ilynect_token');
  };

  const updateName = async (userId, newName) => {
    const data = await updateUserName(userId, newName);
    const userData = {
      id: data.user.id,
      uid: data.user.id,
      email: data.user.email,
      name: data.user.name,
      displayName: data.user.name,
      role: data.user.role || 'user',
      avatar_color: data.user.avatar_color,
      avatar_index: data.user.avatar_index,
      flower: data.user.flower,
    };
    setUser(userData);
    localStorage.setItem('ilynect_user', JSON.stringify(userData));
    return userData;
  };

  const toggleLanguage = () => setLanguage(prev => prev === 'en' ? 'te' : 'en');
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      updateName,
      language,
      theme,
      toggleLanguage,
      toggleTheme
    }}>
      {children}
    </AuthContext.Provider>
  );
};
