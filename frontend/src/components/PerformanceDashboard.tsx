import React, { useState, useEffect } from 'react';

interface PerformanceData {
  inp: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  interactions: {
    type: string;
    target: string;
    duration: number;
    timestamp: number;
  }[];
  componentRenders: {
    componentName: string;
    renderCount: number;
    totalTime: number;
    avgTime: number;
  }[];
}

const PerformanceDashboard: React.FC = () => {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateData = () => {
      const inpData = (window as any).__INP_DATA__;
      const profilerData = (window as any).__PROFILER_DATA__;

      if (inpData || profilerData) {
        setData({
          inp: inpData?.currentINP || 0,
          rating: inpData?.rating || 'good',
          interactions: (inpData?.slowestInteractions || []).map((i: any) => ({
            type: i.type,
            target: i.target,
            duration: i.duration,
            timestamp: i.startTime
          })),
          componentRenders: Object.entries(profilerData || {}).map(([name, data]: [string, any]) => ({
            componentName: name,
            renderCount: data.count,
            totalTime: data.totalTime,
            avgTime: data.totalTime / data.count
          })).sort((a, b) => b.renderCount - a.renderCount)
        });
      }
    };

    updateData();
    const interval = setInterval(updateData, 1000);

    // Keyboard shortcut to toggle dashboard
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(!isVisible);
      }
    };

    window.addEventListener('keydown', handleKeydown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [isVisible]);

  if (!isVisible || !data) {
    return (
      <div
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          padding: '8px 12px',
          background: data?.rating === 'poor' ? '#ff4444' : data?.rating === 'needs-improvement' ? '#ff8800' : '#44aa44',
          color: 'white',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold',
          zIndex: 10000,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}
        onClick={() => setIsVisible(true)}
        title="Click to open Performance Dashboard (Ctrl+Shift+P)"
      >
        INP: {data?.inp?.toFixed(0) || '?'}ms
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        width: '400px',
        maxHeight: '600px',
        background: 'white',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        zIndex: 10000,
        fontFamily: 'monospace',
        fontSize: '12px',
        overflow: 'auto'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px',
          borderBottom: '1px solid #ddd',
          background: '#f5f5f5',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <h3 style={{ margin: 0, fontSize: '14px' }}>Performance Monitor</h3>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            padding: '0 4px'
          }}
        >
          ×
        </button>
      </div>

      {/* INP Section */}
      <div style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '13px' }}>
          Interaction to Next Paint (INP)
        </h4>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}
        >
          <span
            style={{
              padding: '2px 6px',
              borderRadius: '3px',
              background: data.rating === 'good' ? '#d4edda' : data.rating === 'needs-improvement' ? '#fff3cd' : '#f8d7da',
              color: data.rating === 'good' ? '#155724' : data.rating === 'needs-improvement' ? '#856404' : '#721c24',
              fontSize: '11px'
            }}
          >
            {data.rating.toUpperCase()}
          </span>
          <strong>{data.inp.toFixed(1)}ms</strong>
        </div>
        <div style={{ fontSize: '11px', color: '#666' }}>
          Target: &lt;200ms (Good), &lt;500ms (Needs Improvement)
        </div>
      </div>

      {/* Slowest Interactions */}
      <div style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '13px' }}>
          Slowest Interactions ({data.interactions.length})
        </h4>
        <div style={{ maxHeight: '150px', overflow: 'auto' }}>
          {data.interactions.slice(0, 5).map((interaction, index) => (
            <div
              key={index}
              style={{
                padding: '4px 0',
                borderBottom: index < 4 ? '1px solid #f0f0f0' : 'none',
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '11px' }}>
                  {interaction.type}
                </div>
                <div style={{ color: '#666', fontSize: '10px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {interaction.target}
                </div>
              </div>
              <div
                style={{
                  color: interaction.duration > 500 ? '#dc3545' : interaction.duration > 200 ? '#fd7e14' : '#28a745',
                  fontWeight: 'bold',
                  fontSize: '11px'
                }}
              >
                {interaction.duration.toFixed(1)}ms
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Component Renders */}
      <div style={{ padding: '12px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '13px' }}>
          Component Renders
        </h4>
        <div style={{ maxHeight: '200px', overflow: 'auto' }}>
          {data.componentRenders.slice(0, 10).map((component, index) => (
            <div
              key={index}
              style={{
                padding: '4px 0',
                borderBottom: index < 9 ? '1px solid #f0f0f0' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: 'bold', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {component.componentName}
                </div>
                <div style={{ fontSize: '10px', color: '#666' }}>
                  {component.renderCount} renders
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#666' }}>
                <span>Total: {component.totalTime.toFixed(1)}ms</span>
                <span>Avg: {component.avgTime.toFixed(1)}ms</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div
        style={{
          padding: '12px',
          borderTop: '1px solid #ddd',
          background: '#f9f9f9',
          display: 'flex',
          gap: '8px'
        }}
      >
        <button
          onClick={() => {
            if ((window as any).getINPReport) {
              (window as any).getINPReport();
            }
          }}
          style={{
            padding: '4px 8px',
            fontSize: '11px',
            border: '1px solid #ddd',
            borderRadius: '3px',
            background: 'white',
            cursor: 'pointer'
          }}
        >
          Console Report
        </button>
        <button
          onClick={() => {
            if ((window as any).resetINPData) {
              (window as any).resetINPData();
            }
            if ((window as any).resetProfilerData) {
              (window as any).resetProfilerData();
            }
          }}
          style={{
            padding: '4px 8px',
            fontSize: '11px',
            border: '1px solid #ddd',
            borderRadius: '3px',
            background: 'white',
            cursor: 'pointer'
          }}
        >
          Reset Data
        </button>
      </div>

      <div style={{ padding: '8px 12px', fontSize: '10px', color: '#666', background: '#f9f9f9', borderTop: '1px solid #eee' }}>
        Press Ctrl+Shift+P to toggle dashboard
      </div>
    </div>
  );
};

export default PerformanceDashboard;
