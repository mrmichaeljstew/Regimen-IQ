import { account } from "./appwrite";
import { ID } from "appwrite";

/**
 * Authentication utilities for RegimenIQ
 */

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
    console.error('Registration error details:', {
      message: error.message,
      code: error.code,
      type: error.type,
      response: error.response
    });
    
    // Handle different types of errors with helpful messages
    let errorMessage = error.message || 'An unknown error occurred';
    
    // Network/fetch errors - likely CORS or platform configuration issues
    if (errorMessage === 'Failed to fetch' || error.type === 'network' || !error.code) {
      errorMessage = 'Unable to connect to the authentication server. Please ensure your deployment domain is registered in the Appwrite Console under Settings → Platforms. See PLATFORM-SETUP.md for details.';
    }
    // Appwrite-specific errors
    else if (error.code === 409) {
      errorMessage = 'An account with this email already exists. Please try logging in instead.';
    } else if (error.code === 400 && errorMessage.includes('password')) {
      errorMessage = 'Password is too weak. Please use at least 8 characters.';
    }
    
    return { success: false, error: errorMessage };
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
    console.error('Login error details:', {
      message: error.message,
      code: error.code,
      type: error.type,
      response: error.response
    });
    
    // Handle different types of errors with helpful messages
    let errorMessage = error.message || 'An unknown error occurred';
    
    // Network/fetch errors - likely CORS or platform configuration issues
    if (errorMessage === 'Failed to fetch' || error.type === 'network' || !error.code) {
      errorMessage = 'Unable to connect to the authentication server. Please ensure your deployment domain is registered in the Appwrite Console under Settings → Platforms. See PLATFORM-SETUP.md for details.';
    }
    // Appwrite-specific errors (these have error codes)
    else if (error.code === 401) {
      errorMessage = 'Invalid email or password. Please try again.';
    } else if (error.code === 429) {
      errorMessage = 'Too many login attempts. Please try again later.';
    }
    
    return { success: false, error: errorMessage };
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
