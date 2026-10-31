import { defaultThemeId, getTheme, type ThemeId, type ThemeManifest } from '@argiva/design-tokens';
import { createContext, useContext, type ReactNode } from 'react';

const ThemeContext = createContext<ThemeManifest>(getTheme(defaultThemeId));

export function ThemeProvider({ themeId = defaultThemeId, children }: { themeId?: ThemeId; children: ReactNode }) {
  return <ThemeContext.Provider value={getTheme(themeId)}>{children}</ThemeContext.Provider>;
}

export function useThemeManifest(): ThemeManifest {
  return useContext(ThemeContext);
}
