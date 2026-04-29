import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_SEARCH_KEY = 'umass_marketplace_recent_searches';

export const SearchHistoryManager = {
  // 1. Retrieve the list
  // whenever a user clicks on the search bar make this call and display it
  getHistory: async (): Promise<string[]> => {
    try {
      const jsonValue = await AsyncStorage.getItem(RECENT_SEARCH_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      return [];
    }
  },

  // 2. Add a new search
  // when a user searches for something make this call
  addSearch: async (query: string) => {
    const term = query.trim().toLowerCase();
    if (!term) return;

    try {
      const history = await SearchHistoryManager.getHistory();
      
      // Filter out the term if it exists (no duplicates)
      // Add it to the front (index 0)
      // Keep only the most recent 5
      const newHistory = [term, ...history.filter(h => h !== term)].slice(0, 5);
      
      await AsyncStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(newHistory));
    } catch (e) {
      console.error('Failed to save search history', e);
    }
  },

  // 3. Clear all
  // if a user wants to delete search history, make this call
  clearHistory: async () => {
    await AsyncStorage.removeItem(RECENT_SEARCH_KEY);
  }
};