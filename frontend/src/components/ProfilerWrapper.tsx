import { Profiler, type ProfilerOnRenderCallback } from 'react';

interface ProfilerWrapperProps {
  id: string;
  children: React.ReactNode;
  logToConsole?: boolean;
}

// Performance tracking data
const performanceData: Record<
  string,
  {
    renderCount: number;
    totalTime: number;
    averageTime: number;
    maxTime: number;
    minTime: number;
  }
> = {};

const ProfilerWrapper: React.FC<ProfilerWrapperProps> = ({
  id,
  children,
  logToConsole = false,
}) => {
  const onRender: ProfilerOnRenderCallback = (
    id: string,
    phase: 'mount' | 'update' | 'nested-update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ) => {
    // Initialize tracking data if not exists
    if (!performanceData[id]) {
      performanceData[id] = {
        renderCount: 0,
        totalTime: 0,
        averageTime: 0,
        maxTime: 0,
        minTime: Infinity,
      };
    }

    const data = performanceData[id];
    data.renderCount++;
    data.totalTime += actualDuration;
    data.averageTime = data.totalTime / data.renderCount;
    data.maxTime = Math.max(data.maxTime, actualDuration);
    data.minTime = Math.min(data.minTime, actualDuration);

    // Log to console if enabled and render is slow
    if (logToConsole && actualDuration > 16) {
      // 16ms = 60fps threshold
      console.warn(`⚡ Slow Render Detected:`, {
        component: id,
        phase,
        actualDuration: `${actualDuration.toFixed(2)}ms`,
        baseDuration: `${baseDuration.toFixed(2)}ms`,
        renderCount: data.renderCount,
        averageTime: `${data.averageTime.toFixed(2)}ms`,
        startTime,
        commitTime,
      });
    }

    // Store in global for debugging
    (window as any).__REACT_PERFORMANCE_DATA__ = performanceData;
  };

  return (
    <Profiler id={id} onRender={onRender}>
      {children}
    </Profiler>
  );
};

// Utility functions for analyzing performance
export const getPerformanceReport = () => {
  const sortedComponents = Object.entries(performanceData)
    .sort(([, a], [, b]) => b.renderCount - a.renderCount)
    .map(([id, data]) => ({
      component: id,
      ...data,
      totalTime: parseFloat(data.totalTime.toFixed(2)),
      averageTime: parseFloat(data.averageTime.toFixed(2)),
      maxTime: parseFloat(data.maxTime.toFixed(2)),
      minTime: data.minTime === Infinity ? 0 : parseFloat(data.minTime.toFixed(2)),
    }));

  console.table(sortedComponents);
  return sortedComponents;
};

export const resetPerformanceData = () => {
  Object.keys(performanceData).forEach(key => {
    delete performanceData[key];
  });
  console.log('Performance data reset');
};

export const getSlowComponents = (threshold = 16) => {
  return Object.entries(performanceData)
    .filter(([, data]) => data.averageTime > threshold)
    .sort(([, a], [, b]) => b.averageTime - a.averageTime)
    .map(([id, data]) => ({
      component: id,
      averageTime: parseFloat(data.averageTime.toFixed(2)),
      maxTime: parseFloat(data.maxTime.toFixed(2)),
      renderCount: data.renderCount,
    }));
};

// Add global functions for debugging
if (typeof window !== 'undefined') {
  (window as any).getPerformanceReport = getPerformanceReport;
  (window as any).resetPerformanceData = resetPerformanceData;
  (window as any).getSlowComponents = getSlowComponents;
}

export default ProfilerWrapper;
