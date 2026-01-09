import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    console.log('Toggling theme from', theme, 'to', isDark ? 'light' : 'dark');
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Sliding background */}
      <motion.div
        className="absolute inset-y-1 left-1 h-6 w-6 rounded-full bg-white dark:bg-gray-800 shadow-md transition-colors duration-300"
        animate={{
          x: isDark ? 24 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30
        }}
      />
      
      {/* Light mode icon - always visible on left */}
      <motion.div
        className="absolute left-2 flex h-4 w-4 items-center justify-center"
        animate={{
          opacity: isDark ? 0.4 : 1,
          scale: isDark ? 0.8 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        <Sun className="h-3 w-3 text-black dark:text-yellow-400" />
      </motion.div>
      
      {/* Dark mode icon - always visible on right */}
      <motion.div
        className="absolute right-2 flex h-4 w-4 items-center justify-center"
        animate={{
          opacity: isDark ? 1 : 0.4,
          scale: isDark ? 1 : 0.8,
        }}
        transition={{ duration: 0.2 }}
      >
        <Moon className="h-3 w-3 text-slate-600 dark:text-blue-300" />
      </motion.div>
    </motion.button>
  );
}