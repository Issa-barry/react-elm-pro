import { createContext, useContext, useState, ReactNode } from 'react';
import { Colors, DarkColors } from '@/shared/constants/theme';

type ThemeColors = typeof Colors;

interface ThemeContextValue {
  isDark: boolean;
  colors: ThemeColors;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  colors: Colors,
  toggle: () => {},
});

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  return (
    <ThemeContext.Provider value={{
      isDark,
      colors: isDark ? DarkColors as unknown as ThemeColors : Colors,
      toggle: () => setIsDark(prev => !prev),
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
