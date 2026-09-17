import { createContext, useContext, useMemo } from 'react';
import { darkTheme, lightTheme, semantic, type ThemeColors } from './tokens/colors';
import { spacing, radii } from './tokens/spacing';
import { typeScale } from './tokens/typography';

export type ThemeMode = 'dark' | 'light';

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
  semantic: typeof semantic;
  spacing: typeof spacing;
  radii: typeof radii;
  type: typeof typeScale;
}

function buildTheme(mode: ThemeMode): Theme {
  return {
    mode,
    colors: mode === 'dark' ? darkTheme : lightTheme,
    semantic,
    spacing,
    radii,
    type: typeScale,
  };
}

export const themes: Record<ThemeMode, Theme> = {
  dark: buildTheme('dark'),
  light: buildTheme('light'),
};

const ThemeContext = createContext<Theme>(themes.dark);

export function ThemeProvider({
  mode = 'dark',
  children,
}: {
  mode?: ThemeMode;
  children: React.ReactNode;
}) {
  const value = useMemo(() => themes[mode], [mode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
