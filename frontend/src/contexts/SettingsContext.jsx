import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext(null);

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('ilynect_theme') || 'dark');
  const [bgcolor, setBgcolor] = useState(() => localStorage.getItem('ilynect_bgcolor') || '');
  const [t, setT] = useState({
    ready_to_watch: 'Ready to watch?',
    watch_online: 'Watch Online',
    download: 'Download',
    share: 'Share',
    delete: 'Delete',
    cancel: 'Cancel',
    confirm: 'Confirm',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    enter_name: 'Enter your name',
    enter_email: 'Enter your email',
    login: 'Login',
    upload: 'Upload',
  });

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    if (bgcolor) {
      document.body.setAttribute('data-bgcolor', bgcolor);
    } else {
      document.body.removeAttribute('data-bgcolor');
    }
    localStorage.setItem('ilynect_theme', theme);
    localStorage.setItem('ilynect_bgcolor', bgcolor);
  }, [theme, bgcolor]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const toggleBgcolor = (bg) => setBgcolor(prev => prev === bg ? '' : bg);

  return (
    <SettingsContext.Provider value={{
      theme,
      bgcolor,
      t,
      toggleTheme,
      toggleBgcolor,
    }}>
      {children}
    </SettingsContext.Provider>
  );
};