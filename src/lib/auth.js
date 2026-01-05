import { account } from "./appwrite";
import { ID } from "appwrite";

/**
 * Authentication utilities for RegimenIQ
 */

/**
 * Helper function to format authentication errors with helpful messages
 * @param {Error} error - The error object from Appwrite
 * @param {string} context - Context of the error (login, register, etc.)
 * @returns {string} User-friendly error message
 */
function formatAuthError(error, context = 'authentication') {
  // Log error details for debugging (sanitize sensitive data)
  if (process.env.NODE_ENV === 'development') {
    console.error(`${context} error details:`, {
      message: error.message,
      code: error.code,
      type: error.type
    });
  }
  
  let errorMessage = error.message || 'An unknown error occurred';
  
  // Network/fetch errors - likely CORS or platform configuration issues
  if (errorMessage === 'Failed to fetch' || error.type === 'network' || !error.code) {
    return 'Unable to connect to the server. Please check that your deployment domain is registered in Appwrite Console (Settings → Platforms). See PLATFORM-SETUP.md for help.';
  }
  
  // Appwrite-specific errors based on context
  if (context === 'login') {
    if (error.code === 401) {
      return 'Invalid email or password. Please try again.';
    } else if (error.code === 429) {
      return 'Too many login attempts. Please try again later.';
    }
  } else if (context === 'registration') {
    if (error.code === 409) {
      return 'An account with this email already exists. Please try logging in instead.';
    } else if (error.code === 400) {
      // Check if it's a password validation error
      if (errorMessage.toLowerCase().includes('password')) {
        return 'Password is too weak. Please use at least 8 characters.';
      }
    }
  }
  
  return errorMessage;
}

/**
 * Register a new user with email and password
 * @param {string} email
 * @param {string} password
 * @param {string} name
 * @returns {Promise<object>} User object
 */
export async function registerUser(email, password, name) {
  try {
    const user = await account.create(ID.unique(), email, password, name);
    console.log('User created successfully, attempting auto-login');
    // Auto-login after registration
    await account.createEmailPasswordSession(email, password);
    return { success: true, user };
  } catch (error) {
    return { success: false, error: formatAuthError(error, 'registration') };
  }
}

/**
 * Login user with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} Session object
 */
export async function loginUser(email, password) {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    return { success: true, session };
  } catch (error) {
    return { success: false, error: formatAuthError(error, 'login') };
  }
}

/**
 * Logout current user
 * @returns {Promise<object>}
 */
export async function logoutUser() {
  try {
    await account.deleteSession("current");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get current user session
 * @returns {Promise<object|null>} User object or null
 */
export async function getCurrentUser() {
  try {
    const user = await account.get();
    return user;
  } catch (error) {
    // Expected error when no user is logged in - silently return null
    // Error code 401 means unauthorized (no active session)
    if (error.code === 401) {
      return null;
    }
    // Log unexpected errors
    console.error("Unexpected error getting current user:", error);
    return null;
  }
}

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated() {
  try {
    await account.get();
    return true;
  } catch (error) {
    return false;
  }
}
