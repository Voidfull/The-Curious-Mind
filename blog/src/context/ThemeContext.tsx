import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { readString, writeString } from '../utils/storage';
import { trackEvent } from '../utils/analytics';

interface ThemeContextType {
  isDark: boolean;
  toggle: () => void;
}

const STORAGE_KEY = 'blog_theme';
const ThemeContext = createContext<ThemeContextType>({ isDark: false, toggle: () => {} });

function prefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function getInitialTheme(): boolean {
  const stored = readString(STORAGE_KEY);
  if (stored === 'dark') return true;
  if (stored === 'light') return false;
  return prefersDark();
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    writeString(STORAGE_KEY, isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      const stored = readString(STORAGE_KEY);
      if (!stored) setIsDark(event.matches);
    };

    media.addEventListener('change', handleSystemThemeChange);
    return () => media.removeEventListener('change', handleSystemThemeChange);
  }, []);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        setIsDark(event.newValue === 'dark');
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const toggle = () => {
    setIsDark(prev => {
      trackEvent('theme_toggle', { theme: prev ? 'light' : 'dark' });
      return !prev;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);