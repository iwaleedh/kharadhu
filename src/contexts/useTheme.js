import { useContext } from 'react';
import { ThemeContext } from './themeContextState';

export const useTheme = () => useContext(ThemeContext);
