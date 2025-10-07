// Environment variables validation utility
interface EnvConfig {
  VITE_API_URL: string;
  VITE_ENABLE_LOGS?: string;
  DEV: boolean;
  PROD: boolean;
  MODE: string;
}

class EnvironmentValidator {
  private static requiredVars = ['VITE_API_URL'];

  static validate(): EnvConfig {
    const env = import.meta.env;
    const errors: string[] = [];

    // Check required variables
    this.requiredVars.forEach(varName => {
      if (!env[varName]) {
        errors.push(`Missing required environment variable: ${varName}`);
      }
    });

    // Validate API URL format
    if (env.VITE_API_URL && !this.isValidUrl(env.VITE_API_URL)) {
      errors.push('VITE_API_URL must be a valid URL');
    }

    if (errors.length > 0) {
      console.error('Environment validation failed:');
      errors.forEach(error => console.error(`- ${error}`));
      
      if (env.PROD) {
        // In production, fail gracefully with defaults
        console.warn('Using fallback configuration in production');
      } else {
        // In development, throw error to catch issues early
        throw new Error(`Environment validation failed: ${errors.join(', ')}`);
      }
    }

    return {
      VITE_API_URL: env.VITE_API_URL || 'http://localhost:5000/api',
      VITE_ENABLE_LOGS: env.VITE_ENABLE_LOGS,
      DEV: env.DEV,
      PROD: env.PROD,
      MODE: env.MODE
    };
  }

  private static isValidUrl(string: string): boolean {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  }

  static getConfig(): EnvConfig {
    return this.validate();
  }

  // Security check for sensitive data exposure
  static checkForSecrets(): void {
    const env = import.meta.env;
    const sensitivePatterns = [
      /password/i,
      /secret/i,
      /key/i,
      /token/i,
      /auth/i
    ];

    Object.keys(env).forEach(key => {
      if (sensitivePatterns.some(pattern => pattern.test(key))) {
        if (!key.startsWith('VITE_')) {
          console.warn(`⚠️ Potential sensitive data in environment: ${key}`);
        }
      }
    });
  }
}

// Initialize and validate on module load
const envConfig = EnvironmentValidator.getConfig();

// Run security check in development
if (envConfig.DEV) {
  EnvironmentValidator.checkForSecrets();
}

export { EnvironmentValidator, envConfig };