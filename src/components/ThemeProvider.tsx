
import { createContext, useContext, useEffect } from 'react';
import { useGoalStore } from '../store/goalStore';

type ThemeProviderProps = {
  children: React.ReactNode;
};

const ThemeContext = createContext({
  isDarkMode: false,
  toggleDarkMode: () => {}
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { isDarkMode, toggleDarkMode } = useGoalStore();
  
  // Set dark mode class on document when theme changes
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
