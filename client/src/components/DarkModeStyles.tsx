import { useEffect } from 'react';
import { useTheme } from './ThemeProvider';

export function DarkModeStyles() {
  const { theme } = useTheme();
  
  useEffect(() => {
    // Add global styles for components that might not be using proper dark mode classes
    const style = document.createElement('style');
    style.innerHTML = `
      .force-dark-mode {
        background-color: ${theme === 'dark' ? 'hsl(var(--background))' : ''} !important;
        color: ${theme === 'dark' ? 'hsl(var(--foreground))' : ''} !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [theme]);
  
  return null;
}