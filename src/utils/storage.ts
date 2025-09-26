/**
 * Utility functions for handling localStorage operations
 */
export const storage = {
    /**
     * Save data to localStorage
     * @param {string} key - The key under which the value is stored
     * @param {any} value - The data to store (automatically converted to JSON)
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    set: (key: string, value: any) => {
        localStorage.setItem(key, JSON.stringify(value));
    },

    /**
     * Retrieve data from localStorage
     * @param {string} key - The key of the stored data
     * @returns {any | null} - The parsed JSON data or null if not found
     */
    get: (key: string) => {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    },

    /**
     * Remove a specific item from localStorage
     * @param {string} key - The key of the item to remove
     */
    remove: (key: string) => {
        localStorage.removeItem(key);
    },

    /**
     * Clear all data from localStorage
     */
    clear: () => {
        localStorage.clear();
    },
};
