import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext(null);

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('ilynect_theme') || 'dark');
  const [language, setLanguage] = useState(() => localStorage.getItem('ilynect_lang') || 'en');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ilynect_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('ilynect_lang', language);
  }, [language]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const toggleLanguage = () => setLanguage(prev => prev === 'en' ? 'te' : 'en');

  const t = language === 'te' ? {
    home: 'హోమ్',
    movies: 'సినిమాలు',
    photos: 'ఫోటోలు',
    reels: 'రీల్స్',
    upload: 'అప్‌లోడ్',
    profile: 'ప్రొఫైల్',
    downloads: 'డౌన్‌లోడ్స్',
    history: 'చరిత్ర',
    search: 'వెతకండి...',
    hello: 'హలో',
    stay_connected: 'మీ ప్రియమైన వారితో అనుసంధానంగా ఉండండి',
    quick_access: 'త్వరిత యాక్సెస్',
    your_activity: 'మీ కార్యాచరణ',
    view_watched: 'మీరు చూసిన వాటిని చూడండి',
    ready_to_watch: 'చూడటానికి సిద్ధంగా ఉన్నారా?',
    watch_online: 'ఆన్‌లైన్‌లో చూడండి',
    download: 'డౌన్‌లోడ్',
    share: 'షేర్',
    delete: 'తొలగించు',
    cancel: 'రద్దు',
    confirm: 'నిర్ధారించు',
    loading: 'లోడ్ అవుతోంది...',
    error: 'లోపం',
    success: 'విజయం',
    enter_name: 'మీ పేరు నమోదు చేయండి',
    enter_email: 'మీ ఇమెయిల్ నమోదు చేయండి',
    login: 'లాగిన్',
  } : {
    home: 'Home',
    movies: 'Movies',
    photos: 'Photos',
    reels: 'Reels',
    upload: 'Upload',
    profile: 'Profile',
    downloads: 'Downloads',
    history: 'History',
    search: 'Search...',
    hello: 'Hello',
    stay_connected: 'Stay connected with your loved ones',
    quick_access: 'Quick Access',
    your_activity: 'Your Activity',
    view_watched: "View what you've watched",
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
  };

  return (
    <SettingsContext.Provider value={{
      theme,
      setTheme,
      language,
      setLanguage,
      t,
      toggleTheme,
      toggleLanguage,
    }}>
      {children}
    </SettingsContext.Provider>
  );
};