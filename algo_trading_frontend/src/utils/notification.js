/**
 * Simple notification utility for handling user alerts
 */
export function showNotification(message, type = 'info') {
  // For now, just log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${type.toUpperCase()}] ${message}`);
  }
  // TODO: Replace with proper notification system
  return message;
}
