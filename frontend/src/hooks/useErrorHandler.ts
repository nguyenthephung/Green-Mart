import { useState, useCallback } from 'react';
import { ErrorHandler } from '../utils/errorHandler';
import type { ErrorInfo, ValidationError } from '../utils/errorHandler';

interface UseErrorHandlerReturn {
  error: ErrorInfo | null;
  isError: boolean;
  validationErrors: ValidationError[];
  handleError: (error: any, context?: string) => void;
  handleValidationErrors: (errors: ValidationError[]) => void;
  clearError: () => void;
  clearValidationErrors: () => void;
  clearAllErrors: () => void;
  withErrorHandling: <T>(
    operation: () => Promise<T>,
    context?: string
  ) => Promise<T | null>;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const handleError = useCallback((error: any, context?: string) => {
    const errorInfo = ErrorHandler.formatError(error);
    setError(errorInfo);
    
    // Also show toast notification
    ErrorHandler.handleError(error, context);
  }, []);

  const handleValidationErrors = useCallback((errors: ValidationError[]) => {
    setValidationErrors(errors);
    
    if (errors.length > 0) {
      const validationError = ErrorHandler.createValidationError(
        'Dữ liệu không hợp lệ',
        errors
      );
      ErrorHandler.handleError(validationError, 'Form Validation');
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearValidationErrors = useCallback(() => {
    setValidationErrors([]);
  }, []);

  const clearAllErrors = useCallback(() => {
    setError(null);
    setValidationErrors([]);
  }, []);

  const withErrorHandling = useCallback(async <T,>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    try {
      clearAllErrors();
      return await operation();
    } catch (error) {
      handleError(error, context);
      return null;
    }
  }, [handleError, clearAllErrors]);

  return {
    error,
    isError: error !== null,
    validationErrors,
    handleError,
    handleValidationErrors,
    clearError,
    clearValidationErrors,
    clearAllErrors,
    withErrorHandling
  };
};

export default useErrorHandler;
