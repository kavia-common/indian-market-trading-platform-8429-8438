/**
 * Standardized error handling for API calls
 */
export class ApiError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export function handleApiError(error) {
  console.error('API Error:', error);
  
  if (error instanceof ApiError) {
    return {
      message: error.message,
      status: error.status,
      details: error.details
    };
  }

  if (error.response) {
    return {
      message: error.response.data?.message || 'Server error',
      status: error.response.status,
      details: error.response.data
    };
  }

  if (error.request) {
    return {
      message: 'No response from server',
      status: 0,
      details: { error: 'Network error' }
    };
  }

  return {
    message: error.message || 'Unknown error',
    status: 500,
    details: null
  };
}

export function isNetworkError(error) {
  return !error.response && error.request;
}

export function shouldRetry(error) {
  if (isNetworkError(error)) return true;
  const status = error.response?.status;
  return status >= 500 || status === 429;
}
