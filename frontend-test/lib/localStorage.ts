/**
 * Safe localStorage utilities that work with SSR/SSG
 * Prevents "localStorage is not defined" errors during build
 */

export const safeLocalStorage = {
  /**
   * Safely get item from localStorage
   * @param key - The key to retrieve
   * @returns The value or null if not found or not in browser
   */
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null
    
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return null
    }
  },

  /**
   * Safely set item in localStorage
   * @param key - The key to set
   * @param value - The value to store
   * @returns true if successful, false otherwise
   */
  setItem: (key: string, value: string): boolean => {
    if (typeof window === 'undefined') return false
    
    try {
      localStorage.setItem(key, value)
      return true
    } catch (error) {
      console.error('Error writing to localStorage:', error)
      return false
    }
  },

  /**
   * Safely remove item from localStorage
   * @param key - The key to remove
   * @returns true if successful, false otherwise
   */
  removeItem: (key: string): boolean => {
    if (typeof window === 'undefined') return false
    
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('Error removing from localStorage:', error)
      return false
    }
  },

  /**
   * Safely clear all localStorage
   * @returns true if successful, false otherwise
   */
  clear: (): boolean => {
    if (typeof window === 'undefined') return false
    
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error('Error clearing localStorage:', error)
      return false
    }
  },

  /**
   * Check if localStorage is available
   * @returns true if localStorage is available
   */
  isAvailable: (): boolean => {
    if (typeof window === 'undefined') return false
    
    try {
      const testKey = '__localStorage_test__'
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
      return true
    } catch {
      return false
    }
  }
}

/**
 * Get and parse JSON from localStorage
 * @param key - The key to retrieve
 * @returns Parsed JSON object or null
 */
export function getJSON<T = any>(key: string): T | null {
  const value = safeLocalStorage.getItem(key)
  if (!value) return null
  
  try {
    return JSON.parse(value) as T
  } catch (error) {
    console.error('Error parsing JSON from localStorage:', error)
    return null
  }
}

/**
 * Set JSON object in localStorage
 * @param key - The key to set
 * @param value - The object to store
 * @returns true if successful, false otherwise
 */
export function setJSON(key: string, value: any): boolean {
  try {
    const jsonString = JSON.stringify(value)
    return safeLocalStorage.setItem(key, jsonString)
  } catch (error) {
    console.error('Error stringifying JSON for localStorage:', error)
    return false
  }
}
