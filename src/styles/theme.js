export const lightTheme = {
  colors: {
    // Primary Brand Colors (Peaceful Teal)
    primary: '#22575D',
    primaryLight: '#55BAC6',
    secondary: '#d4af37',
    secondaryLight: '#f1cd57',
    
    // Success & Achievement
    success: '#6B9B7C',
    successLight: '#E8F4EA',
    
    // Background Colors (Light Mode)
    background: '#FFFFFF',
    backgroundLight: '#F8FAFA',
    cardBackground: '#FFFFFF',
    
    // Text Colors (Light Mode)
    textPrimary: '#2C3E3F',
    textSecondary: '#556B6D',
    textMuted: '#7A8E90',
    textOnDark: '#FFFFFF',
    
    // Status Colors
    warning: '#D4A574',
    error: '#C87B7B',
    info: '#55BAC6',
    
    // Neutral Colors
    white: '#FFFFFF',
    gray100: '#F5F7F7',
    gray200: '#E8ECEC',
    gray300: '#D1D9DA',
    gray400: '#A8B5B6',
    gray500: '#7A8E90',
  },
  
  gradients: {
    primary: 'linear-gradient(135deg, #22575D 0%, #55BAC6 100%)',
    primaryDark: 'linear-gradient(135deg, #1A4449 0%, #2D6B74 100%)',
    secondary: 'linear-gradient(135deg, #B8947D 0%, #D4C4B0 100%)',
    success: 'linear-gradient(135deg, #6B9B7C 0%, #8FBC9F 100%)',
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
  },
  
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '28px',
    '4xl': '32px',
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
  }
};

export const darkTheme = {
  colors: {
    // Primary Brand Colors (Adjusted for dark mode)
    primary: '#55BAC6',
    primaryLight: '#7DD4DE',
    secondary: '#f1cd57',
    secondaryLight: '#FFE08A',
    
    // Success & Achievement
    success: '#8FBC9F',
    successLight: '#2C4A36',
    
    // Background Colors (Dark Mode)
    background: '#0F1419',
    backgroundLight: '#1A1F26',
    cardBackground: '#252C35',
    
    // Text Colors (Dark Mode)
    textPrimary: '#E8ECEC',
    textSecondary: '#A8B5B6',
    textMuted: '#7A8E90',
    textOnDark: '#FFFFFF',
    
    // Status Colors (Adjusted for visibility)
    warning: '#E5B88A',
    error: '#E89999',
    info: '#7DD4DE',
    
    // Neutral Colors (Dark)
    white: '#FFFFFF',
    gray100: '#2C3E3F',
    gray200: '#3A4B4D',
    gray300: '#556B6D',
    gray400: '#7A8E90',
    gray500: '#A8B5B6',
  },
  
  gradients: {
    primary: 'linear-gradient(135deg, #55BAC6 0%, #7DD4DE 100%)',
    primaryDark: 'linear-gradient(135deg, #0F1419 0%, #1A2832 100%)',
    secondary: 'linear-gradient(135deg, #D4C4B0 0%, #E5D5BF 100%)',
    success: 'linear-gradient(135deg, #8FBC9F 0%, #A8D1B5 100%)',
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.6)',
  },
  
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '28px',
    '4xl': '32px',
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
  }
};

// Export the default light theme for backward compatibility
export const theme = lightTheme;

// Helper function to get the appropriate theme
export const getTheme = (isDarkMode) => {
  return isDarkMode ? darkTheme : lightTheme;
};

export default theme;