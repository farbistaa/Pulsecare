// client/src/components/admin/ProgressiveChartLoader.tsx
import React, { useState, useEffect, useCallback } from 'react';

interface ChartGroup {
  priority: 'high' | 'medium' | 'low';
  charts: React.ReactNode[];
}

interface ProgressiveChartLoaderProps {
  chartGroups: ChartGroup[];
  delayBetweenGroups?: number; // in milliseconds
}

const ProgressiveChartLoader: React.FC<ProgressiveChartLoaderProps> = ({ 
  chartGroups, 
  delayBetweenGroups = 500 
}) => {
  const [loadedGroups, setLoadedGroups] = useState<('high' | 'medium' | 'low')[]>(['high']);

  useEffect(() => {
    const priorities: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
    let currentIndex = priorities.indexOf(loadedGroups[loadedGroups.length - 1]);
    
    if (currentIndex < priorities.length - 1) {
      const timer = setTimeout(() => {
        setLoadedGroups(prev => [...prev, priorities[currentIndex + 1]]);
      }, delayBetweenGroups);
      
      return () => clearTimeout(timer);
    }
  }, [loadedGroups, delayBetweenGroups]);

  const renderCharts = useCallback(() => {
    const allCharts: React.ReactNode[] = [];
    
    chartGroups.forEach(group => {
      if (loadedGroups.includes(group.priority)) {
        allCharts.push(...group.charts);
      } else {
        // Add skeleton loaders for charts not yet loaded
        group.charts.forEach((_, index) => {
          allCharts.push(
            <div key={`skeleton-${group.priority}-${index}`} className="animate-pulse">
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          );
        });
      }
    });
    
    return allCharts;
  }, [chartGroups, loadedGroups]);

  return <>{renderCharts()}</>;
};

export default ProgressiveChartLoader;