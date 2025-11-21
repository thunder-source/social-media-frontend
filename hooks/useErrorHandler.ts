import { useEffect } from 'react';

/**
 * Custom hook to handle errors in async operations
 * Throws errors so they can be caught by Error Boundaries
 * 
 * @example
 * const throwError = useErrorHandler();
 * 
 * const fetchData = async () => {
 *   try {
 *     const response = await api.getData();
 *     return response;
 *   } catch (error) {
 *     throwError(error);
 *   }
 * };
 */
export function useErrorHandler() {
  return (error: Error | unknown) => {
    throw error instanceof Error ? error : new Error(String(error));
  };
}

/**
 * Hook to report errors to an external service (e.g., Sentry, LogRocket)
 * Extend this to integrate with your error reporting service
 */
export function useErrorReporting() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      // TODO: Send to error reporting service
      // Sentry.captureException(event.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      // TODO: Send to error reporting service
      // Sentry.captureException(event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
}
