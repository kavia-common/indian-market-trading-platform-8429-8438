/**
 * Retry mechanism for failed operations
 */
export async function retry(operation, { maxAttempts = 3, backoff = 1000, maxBackoff = 10000 } = {}) {
  let lastError;
  let attempt = 0;
  
  while (attempt < maxAttempts) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      attempt++;
      
      if (attempt === maxAttempts) {
        break;
      }

      // Exponential backoff with jitter
      const delay = Math.min(
        maxBackoff,
        backoff * Math.pow(2, attempt - 1) * (0.8 + Math.random() * 0.4)
      );
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Create a retryable version of a function
 */
export function withRetry(fn, options) {
  return (...args) => retry(() => fn(...args), options);
}
