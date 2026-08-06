/**
 * Application Configuration Constants
 *
 * This file centralizes all environment-specific configuration.
 * Import from here instead of accessing import.meta.env directly.
 */

/**
 * Get the API base URL
 * Switches between development and production URLs automatically
 */
export const getApiBaseUrl = (): string => {
  // Priority: Environment variable > Development default > Production default
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  if (import.meta.env.DEV) {
    return "http://127.0.0.1:8000";
  }

  return "https://api.production.com";
};

/**
 * Check if running in development mode
 */
export const isDevelopment = import.meta.env.DEV;

/**
 * Check if running in production mode
 */
export const isProduction = import.meta.env.PROD;

/**
 * Application environment
 */
export const environment = import.meta.env.MODE as "development" | "production";

/**
 * API Configuration Object
 * Use this for consistent API configuration across the app
 */
export const API_CONFIG = {
  baseURL: getApiBaseUrl(),
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
} as const;

// Log configuration in development
if (isDevelopment) {
  console.debug("[Config]", {
    environment,
    apiBaseUrl: API_CONFIG.baseURL,
  });
}
