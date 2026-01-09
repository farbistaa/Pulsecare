// client/src/components/admin/VirtualizedChartGrid.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';

interface VirtualizedChartGridProps {
  children: React.ReactNode[];
  columnCount: number;
  rowHeight: number;
  gap: number;
}

const VirtualizedChartGrid: React.FC<VirtualizedChartGridProps> = ({ 
  children, 
  columnCount, 
  rowHeight, 
  gap 
}) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 6 }); // Initially show 6 items
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    
    // Calculate which items should be visible
    const start = Math.max(0, Math.floor(scrollTop / (rowHeight + gap)) * columnCount);
    const end = Math.min(
      children.length,
      start + Math.ceil(containerHeight / (rowHeight + gap)) * columnCount + columnCount * 2
    );
    
    setVisibleRange({ start, end });
  }, [children.length, columnCount, rowHeight, gap]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    container.addEventListener('scroll', handleScroll);
    // Initial calculation
    handleScroll();
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  const columnWidth = `calc((100% - ${(columnCount - 1) * gap}px) / ${columnCount})`;

  const renderChildren = () => {
    const items = [];
    
    for (let i = visibleRange.start; i < visibleRange.end && i < children.length; i++) {
      const rowIndex = Math.floor(i / columnCount);
      const columnIndex = i % columnCount;
      
      items.push(
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `calc(${columnIndex} * (${columnWidth} + ${gap}px))`,
            top: `calc(${rowIndex} * (${rowHeight}px + ${gap}px))`,
            width: columnWidth,
            height: `${rowHeight}px`,
          }}
        >
          {children[i]}
        </div>
      );
    }
    
    return items;
  };

  const rowCount = Math.ceil(children.length / columnCount);
  const totalHeight = `${rowCount * (rowHeight + gap) - gap}px`;

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full overflow-auto relative"
      style={{ height: `${rowCount * (rowHeight + gap)}px` }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {renderChildren()}
      </div>
    </div>
  );
};

export default VirtualizedChartGrid;