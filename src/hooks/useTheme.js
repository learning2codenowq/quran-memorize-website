import { useMemo } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { lightTheme, darkTheme } from '../styles/theme';

export const useTheme = () => {
  const { settings } = useSettings();
  
  const theme = useMemo(() => {
    return settings.darkMode ? darkTheme : lightTheme;
  }, [settings.darkMode]);
  
  return theme;
};