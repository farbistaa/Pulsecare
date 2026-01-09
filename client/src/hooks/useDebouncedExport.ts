// client/src/hooks/useDebouncedExport.ts
import { useCallback, useRef } from 'react';

export const useDebouncedExport = () => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleExport = useCallback((exportFunction: () => void) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      exportFunction();
    }, 300); // 300ms debounce time
  }, []);

  return { handleExport };
};