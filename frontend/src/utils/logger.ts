// Production-safe logging utility
class Logger {
  private static isDevelopment = import.meta.env.DEV;
  private static isProduction = import.meta.env.PROD;

  // Safe logging methods
  static error(message: string, ...args: any[]) {
    // Always log errors, even in production
    console.error(`[ERROR] ${message}`, ...args);
  }

  static warn(message: string, ...args: any[]) {
    // Log warnings in development and staging
    if (this.isDevelopment || import.meta.env.VITE_ENABLE_LOGS === 'true') {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  static info(message: string, ...args: any[]) {
    // Only log info in development
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  static debug(message: string, ...args: any[]) {
    // Only log debug in development
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  // Performance logging
  static performance(label: string, duration: number) {
    if (this.isDevelopment) {
      if (duration > 16.67) { // 60fps threshold
        console.warn(`⚡ [PERFORMANCE] ${label}: ${duration.toFixed(2)}ms (>16.67ms)`);
      } else {
        console.log(`✅ [PERFORMANCE] ${label}: ${duration.toFixed(2)}ms`);
      }
    }
  }

  // Network logging
  static network(method: string, url: string, status: number, duration?: number) {
    if (this.isDevelopment) {
      const statusColor = status >= 400 ? '🔴' : status >= 300 ? '🟡' : '🟢';
      const durationText = duration ? ` (${duration}ms)` : '';
      console.log(`${statusColor} [NETWORK] ${method} ${url} - ${status}${durationText}`);
    }
  }

  // Auth logging
  static auth(action: string, data?: any) {
    if (this.isDevelopment) {
      console.log(`🔐 [AUTH] ${action}:`, data);
    }
  }

  // Remove all console logs in production build
  static removeProductionLogs() {
    if (this.isProduction) {
      // Override console methods in production
      const noop = () => {};
      console.log = noop;
      console.info = noop;
      console.warn = noop;
      // Keep console.error for critical issues
    }
  }
}

// Auto-remove logs in production
Logger.removeProductionLogs();

export { Logger };