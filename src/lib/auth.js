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
        console.log('Attempting registration with:', { email, password: '***', name });
    // Auto-login after registration
    await account.createEmailPasswordSession(email, password);
    return { success: true, user };
  } catch (error) {
        console.error('Registration error:', error);
    return { success: false, error: error.message };
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
    return { success: false, error: error.message };
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
