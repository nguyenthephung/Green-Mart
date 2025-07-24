import { useEffect } from 'react';

interface INPMetric {
  name: 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  entries: PerformanceEntry[];
}

interface InteractionData {
  type: string;
  target: string;
  duration: number;
  startTime: number;
  processingStart: number;
  processingEnd: number;
  presentationTime: number;
  inputDelay: number;
  processingTime: number;
  presentationDelay: number;
}

class INPMonitor {
  private interactions: InteractionData[] = [];
  private observer: PerformanceObserver | null = null;
  private onMetric?: (metric: INPMetric) => void;

  constructor(onMetric?: (metric: INPMetric) => void) {
    this.onMetric = onMetric;
    this.initObserver();
  }

  private initObserver() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'event') {
            this.handleEventEntry(entry as PerformanceEventTiming);
          }
        }
      });

      this.observer.observe({ 
        type: 'event',
        buffered: true 
      });
    } catch (error) {
      console.warn('INP monitoring not supported:', error);
    }
  }

  private handleEventEntry(entry: PerformanceEventTiming) {
    // Only track user interactions
    if (!['pointerdown', 'pointerup', 'click', 'keydown', 'keyup'].includes(entry.name)) {
      return;
    }

    const interaction: InteractionData = {
      type: entry.name,
      target: this.getTargetSelector(entry.target),
      duration: entry.duration,
      startTime: entry.startTime,
      processingStart: entry.processingStart,
      processingEnd: entry.processingEnd,
      presentationTime: entry.startTime + entry.duration,
      inputDelay: entry.processingStart - entry.startTime,
      processingTime: entry.processingEnd - entry.processingStart,
      presentationDelay: entry.duration - (entry.processingEnd - entry.startTime)
    };

    this.interactions.push(interaction);

    // Log slow interactions immediately
    if (entry.duration > 200) {
      console.warn('🐌 Slow Interaction Detected:', {
        type: entry.name,
        target: interaction.target,
        duration: `${entry.duration.toFixed(2)}ms`,
        inputDelay: `${interaction.inputDelay.toFixed(2)}ms`,
        processingTime: `${interaction.processingTime.toFixed(2)}ms`,
        presentationDelay: `${interaction.presentationDelay.toFixed(2)}ms`,
        breakdown: {
          'Input Delay': `${interaction.inputDelay.toFixed(2)}ms`,
          'Processing Time': `${interaction.processingTime.toFixed(2)}ms`,
          'Presentation Delay': `${interaction.presentationDelay.toFixed(2)}ms`
        }
      });
    }

    this.calculateINP();
  }

  private getTargetSelector(target: EventTarget | null): string {
    if (!target || !(target instanceof Element)) {
      return 'unknown';
    }

    const tagName = target.tagName.toLowerCase();
    const id = target.id ? `#${target.id}` : '';
    const className = target.className ? `.${target.className.split(' ').join('.')}` : '';
    
    return `${tagName}${id}${className}`.substring(0, 100);
  }

  private calculateINP() {
    if (this.interactions.length === 0) return;

    // Get the 98th percentile interaction duration
    const sortedDurations = this.interactions
      .map(i => i.duration)
      .sort((a, b) => a - b);

    const index = Math.min(
      Math.floor(sortedDurations.length * 0.98),
      sortedDurations.length - 1
    );

    const inp = sortedDurations[index];
    const rating = inp <= 200 ? 'good' : inp <= 500 ? 'needs-improvement' : 'poor';

    const metric: INPMetric = {
      name: 'INP',
      value: inp,
      rating,
      delta: inp,
      id: 'INP',
      entries: []
    };

    if (this.onMetric) {
      this.onMetric(metric);
    }

    // Store in global for debugging
    (window as any).__INP_DATA__ = {
      currentINP: inp,
      rating,
      interactions: this.interactions,
      slowestInteractions: this.getSlowstInteractions()
    };
  }

  public getSlowstInteractions(limit = 10): InteractionData[] {
    return this.interactions
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  public getInteractionsByType(): Record<string, InteractionData[]> {
    return this.interactions.reduce((acc, interaction) => {
      if (!acc[interaction.type]) {
        acc[interaction.type] = [];
      }
      acc[interaction.type].push(interaction);
      return acc;
    }, {} as Record<string, InteractionData[]>);
  }

  public getReport() {
    const byType = this.getInteractionsByType();
    const slowest = this.getSlowstInteractions();
    
    console.group('📊 INP Performance Report');
    console.log('Current INP:', (window as any).__INP_DATA__?.currentINP?.toFixed(2) + 'ms');
    console.log('Rating:', (window as any).__INP_DATA__?.rating);
    console.log('Total Interactions:', this.interactions.length);
    
    console.group('Slowest Interactions:');
    slowest.forEach((interaction, index) => {
      console.log(`${index + 1}.`, {
        type: interaction.type,
        target: interaction.target,
        duration: `${interaction.duration.toFixed(2)}ms`,
        breakdown: {
          inputDelay: `${interaction.inputDelay.toFixed(2)}ms`,
          processing: `${interaction.processingTime.toFixed(2)}ms`,
          presentation: `${interaction.presentationDelay.toFixed(2)}ms`
        }
      });
    });
    console.groupEnd();

    console.group('By Interaction Type:');
    Object.entries(byType).forEach(([type, interactions]) => {
      const avgDuration = interactions.reduce((sum, i) => sum + i.duration, 0) / interactions.length;
      console.log(`${type}:`, {
        count: interactions.length,
        avgDuration: `${avgDuration.toFixed(2)}ms`,
        maxDuration: `${Math.max(...interactions.map(i => i.duration)).toFixed(2)}ms`
      });
    });
    console.groupEnd();
    console.groupEnd();

    return {
      currentINP: (window as any).__INP_DATA__?.currentINP,
      rating: (window as any).__INP_DATA__?.rating,
      totalInteractions: this.interactions.length,
      slowestInteractions: slowest,
      byType
    };
  }

  public reset() {
    this.interactions = [];
    delete (window as any).__INP_DATA__;
  }

  public destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

// React Hook for INP monitoring
export const useINPMonitor = (enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    const monitor = new INPMonitor((metric) => {
      if (metric.rating === 'poor') {
        console.warn('❌ Poor INP detected:', `${metric.value.toFixed(2)}ms`);
      }
    });

    // Add global debugging functions
    (window as any).getINPReport = () => monitor.getReport();
    (window as any).resetINPData = () => monitor.reset();

    return () => {
      monitor.destroy();
      delete (window as any).getINPReport;
      delete (window as any).resetINPData;
    };
  }, [enabled]);
};

export default INPMonitor;
