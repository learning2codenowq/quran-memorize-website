// StorageService - Manages user progress data in browser localStorage
class StorageService {
  static STORAGE_KEY = 'quran_hifdh_web_v1';

  // Get the entire app state
  static getState() {
    try {
      const stateJson = localStorage.getItem(this.STORAGE_KEY);
      if (!stateJson) {
        return null;
      }
      return JSON.parse(stateJson);
    } catch (error) {
      console.error('Error getting state from localStorage:', error);
      return null;
    }
  }

  // Save the entire app state
  static saveState(state) {
    try {
      const stateJson = JSON.stringify(state);
      localStorage.setItem(this.STORAGE_KEY, stateJson);
      return true;
    } catch (error) {
      console.error('Error saving state to localStorage:', error);
      return false;
    }
  }

  // Initialize state for new users
  static initializeState(userSettings = {}) {
    const initialState = {
      // Ayah-level memorization tracking
      ayahProgress: {},
      
      // Daily progress tracking
      progress: {},
      
      // Revision tracking
      revisionProgress: {},
      
      // Last memorized position
      lastMemorizedPosition: null,
      
      // Achievements
      earnedAchievements: [],
      
      // User settings
      settings: {
        dailyGoal: userSettings.dailyGoal || 10,
        userName: userSettings.userName || 'User',
        darkMode: userSettings.darkMode || false,
        showTranslations: userSettings.showTranslations !== false,
        arabicFontSize: userSettings.arabicFontSize || 'Medium',
        translationFontSize: userSettings.translationFontSize || 'Medium',
        autoPlayNext: userSettings.autoPlayNext !== false,
        selectedReciter: userSettings.selectedReciter || null,
        scriptType: userSettings.scriptType || 'uthmani'
      },
      
      // Confetti tracking
      lastConfettiDate: null
    };

    this.saveState(initialState);
    return initialState;
  }

  // Mark an ayah as memorized
  static markAyahMemorized(surahId, ayahNumber, difficulty = 2) {
    try {
      const state = this.getState() || this.initializeState();
      
      // Initialize surah progress if needed
      if (!state.ayahProgress[surahId]) {
        state.ayahProgress[surahId] = {};
      }
      
      const today = new Date().toISOString().split('T')[0];
      
      // Mark ayah as memorized
      state.ayahProgress[surahId][ayahNumber] = {
        memorized: true,
        dateMemorized: today,
        difficulty: difficulty
      };
      
      // Update daily progress
      state.progress[today] = (state.progress[today] || 0) + 1;
      
      // Update last memorized position
      state.lastMemorizedPosition = {
        surahId: surahId,
        ayahNumber: ayahNumber,
        timestamp: new Date().toISOString()
      };
      
      this.saveState(state);
      return state;
    } catch (error) {
      console.error('Error marking ayah as memorized:', error);
      return false;
    }
  }

  // Unmark an ayah as memorized
  static unmarkAyahMemorized(surahId, ayahNumber) {
    try {
      const state = this.getState() || this.initializeState();
      
      if (state.ayahProgress[surahId] && state.ayahProgress[surahId][ayahNumber]) {
        const dateMemorized = state.ayahProgress[surahId][ayahNumber].dateMemorized;
        
        // Remove from ayah progress
        delete state.ayahProgress[surahId][ayahNumber];
        
        // Decrease daily progress count
        if (state.progress[dateMemorized]) {
          state.progress[dateMemorized] = Math.max(0, state.progress[dateMemorized] - 1);
        }
        
        this.saveState(state);
        return state;
      }
      
      return state;
    } catch (error) {
      console.error('Error unmarking ayah:', error);
      return false;
    }
  }

  // Check if an ayah is memorized
  static isAyahMemorized(surahId, ayahNumber) {
    try {
      const state = this.getState();
      if (!state || !state.ayahProgress[surahId]) {
        return false;
      }
      return state.ayahProgress[surahId][ayahNumber]?.memorized || false;
    } catch (error) {
      console.error('Error checking ayah memorization:', error);
      return false;
    }
  }

  // Get statistics
  static getStatistics() {
    try {
      const state = this.getState();
      if (!state) {
        return {
          totalMemorized: 0,
          todayProgress: 0,
          currentStreak: 0,
          dailyGoal: 10
        };
      }

      // Calculate total memorized ayahs
      let totalMemorized = 0;
      Object.values(state.ayahProgress).forEach(surah => {
        Object.values(surah).forEach(ayah => {
          if (ayah.memorized) totalMemorized++;
        });
      });

      // Get today's progress
      const today = new Date().toISOString().split('T')[0];
      const todayProgress = state.progress[today] || 0;

      // Calculate current streak
      let currentStreak = 0;
      const dates = Object.keys(state.progress).sort().reverse();
      let checkDate = new Date();
      
      for (const dateStr of dates) {
        const progressDate = new Date(dateStr);
        const diffDays = Math.floor((checkDate - progressDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0 || diffDays === 1) {
          if (state.progress[dateStr] > 0) {
            currentStreak++;
            checkDate = progressDate;
          }
        } else {
          break;
        }
      }

      return {
        totalMemorized,
        todayProgress,
        currentStreak,
        dailyGoal: state.settings.dailyGoal
      };
    } catch (error) {
      console.error('Error calculating statistics:', error);
      return {
        totalMemorized: 0,
        todayProgress: 0,
        currentStreak: 0,
        dailyGoal: 10
      };
    }
  }

  // Clear all data
  static clearState() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing state:', error);
      return false;
    }
  }
}

export default StorageService;