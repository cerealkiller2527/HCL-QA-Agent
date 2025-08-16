/**
 * Shared formatting utilities
 * Eliminates code duplication across components
 */

/**
 * Format file size from bytes to human readable string
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.4 GB", "156 MB")
 */
export function formatFileSize(bytes: number): string {
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  
  if (bytes === 0 || !bytes) {
    return "Size unavailable";
  }
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const formattedSize = Math.round((bytes / Math.pow(1024, i)) * 100) / 100;
  
  return `${formattedSize} ${sizes[i]}`;
}

/**
 * Format duration from seconds to human readable string
 * @param seconds - Duration in seconds
 * @returns Formatted string (e.g., "1:23:45", "23:45", "0:05")
 */
export function formatDuration(seconds: number): string {
  if (seconds < 0) return "0:00";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format time for recording displays (includes milliseconds)
 * @param seconds - Time in seconds
 * @returns Formatted string (e.g., "1:23:45.678")
 */
export function formatTime(seconds: number): string {
  if (seconds < 0) return "0:00.000";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;
  }
  
  return `${minutes}:${secs.toString().padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;
}

/**
 * Format date to readable string
 * @param date - Date string or Date object
 * @returns Formatted date string
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date with time to readable string
 * @param date - Date string or Date object
 * @returns Formatted date and time string
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format number with commas as thousands separators
 * @param num - Number to format
 * @returns Formatted number string (e.g., "1,234,567")
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Format percentage with optional decimal places
 * @param value - Number between 0-100
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string (e.g., "85.5%")
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}
