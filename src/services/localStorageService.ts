// Local Storage Service for saving user settings
export interface UserSettings {
  language: string;
  length: string;
  level: string;
  topic: string;
  tone: string;
  vocabularies: string[];
  customLength?: number; // Add custom length value
  customTopics?: string[]; // Add custom topics array
  customLanguages?: string[]; // Add custom languages array
}

const STORAGE_KEYS = {
  USER_SETTINGS: 'english-ui-user-settings',
  SAVED_PARAGRAPHS: 'english-ui-saved-paragraphs',
  PARAGRAPH_HISTORY: 'english-ui-paragraph-history'
} as const;

export class LocalStorageService {
  // Save user settings
  static saveUserSettings(settings: UserSettings): void {
    try {
      const settingsJson = JSON.stringify(settings);
      localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, settingsJson);
      console.log('✅ User settings saved to localStorage:', settings);
    } catch (error) {
      console.error('❌ Failed to save user settings:', error);
    }
  }

  // Load user settings
  static loadUserSettings(): UserSettings | null {
    try {
      const settingsJson = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
      if (settingsJson) {
        const settings = JSON.parse(settingsJson) as UserSettings;
        console.log('📖 User settings loaded from localStorage:', settings);
        return settings;
      }
      return null;
    } catch (error) {
      console.error('❌ Failed to load user settings:', error);
      return null;
    }
  }

  // Get default settings
  static getDefaultSettings(): UserSettings {
    return {
      language: 'English',
      length: 'short',
      level: 'beginner',
      topic: 'none',
      tone: 'none',
      vocabularies: [],
      customLength: 100, // Default custom length
      customTopics: [], // Default empty custom topics
      customLanguages: [] // Default empty custom languages
    };
  }

  // Get user settings with fallback to defaults
  static getUserSettingsOrDefaults(): UserSettings {
    const saved = this.loadUserSettings();
    return saved || this.getDefaultSettings();
  }

  // Update specific setting
  static updateSetting<K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ): void {
    const currentSettings = this.getUserSettingsOrDefaults();
    const updatedSettings = {
      ...currentSettings,
      [key]: value
    };
    this.saveUserSettings(updatedSettings);
  }

  // Add custom topic to saved topics
  static addCustomTopic(topic: string): void {
    const currentSettings = this.getUserSettingsOrDefaults();
    const customTopics = currentSettings.customTopics || [];
    
    // Capitalize first letter and trim
    const formattedTopic = topic.trim().charAt(0).toUpperCase() + topic.trim().slice(1).toLowerCase();
    
    // Check if topic already exists (case insensitive)
    const exists = customTopics.some(t => t.toLowerCase() === formattedTopic.toLowerCase());
    if (!exists && formattedTopic.trim()) {
      const updatedTopics = [...customTopics, formattedTopic];
      this.updateSetting('customTopics', updatedTopics);
      console.log('✅ Custom topic added:', formattedTopic);
    }
  }

  // Get all custom topics
  static getCustomTopics(): string[] {
    const settings = this.getUserSettingsOrDefaults();
    return settings.customTopics || [];
  }

  // Add custom language to saved languages
  static addCustomLanguage(language: string): void {
    const currentSettings = this.getUserSettingsOrDefaults();
    const customLanguages = currentSettings.customLanguages || [];
    
    // Capitalize first letter and trim
    const formattedLanguage = language.trim().charAt(0).toUpperCase() + language.trim().slice(1).toLowerCase();
    
    // Check if language already exists (case insensitive)
    const exists = customLanguages.some(l => l.toLowerCase() === formattedLanguage.toLowerCase());
    if (!exists && formattedLanguage.trim()) {
      const updatedLanguages = [...customLanguages, formattedLanguage];
      this.updateSetting('customLanguages', updatedLanguages);
      console.log('✅ Custom language added:', formattedLanguage);
    }
  }

  // Get all custom languages
  static getCustomLanguages(): string[] {
    const settings = this.getUserSettingsOrDefaults();
    return settings.customLanguages || [];
  }

  // Save paragraph to history
  static saveParagraphToHistory(paragraph: string, vocabularies: string[]): void {
    try {
      const historyItem = {
        id: Date.now().toString(),
        paragraph,
        vocabularies,
        createdAt: new Date().toISOString()
      };

      const existingHistory = this.getParagraphHistory();
      const updatedHistory = [historyItem, ...existingHistory].slice(0, 50); // Keep last 50 items

      localStorage.setItem(STORAGE_KEYS.PARAGRAPH_HISTORY, JSON.stringify(updatedHistory));
      console.log('✅ Paragraph saved to history');
    } catch (error) {
      console.error('❌ Failed to save paragraph to history:', error);
    }
  }

  // Get paragraph history
  static getParagraphHistory(): Array<{
    id: string;
    paragraph: string;
    vocabularies: string[];
    createdAt: string;
  }> {
    try {
      const historyJson = localStorage.getItem(STORAGE_KEYS.PARAGRAPH_HISTORY);
      if (historyJson) {
        return JSON.parse(historyJson);
      }
      return [];
    } catch (error) {
      console.error('❌ Failed to load paragraph history:', error);
      return [];
    }
  }

  // Save paragraph to favorites
  static saveParagraphToFavorites(paragraph: string, vocabularies: string[]): void {
    try {
      const favoriteItem = {
        id: Date.now().toString(),
        paragraph,
        vocabularies,
        savedAt: new Date().toISOString()
      };

      const existingFavorites = this.getSavedParagraphs();
      const updatedFavorites = [favoriteItem, ...existingFavorites];

      localStorage.setItem(STORAGE_KEYS.SAVED_PARAGRAPHS, JSON.stringify(updatedFavorites));
      console.log('✅ Paragraph saved to favorites');
    } catch (error) {
      console.error('❌ Failed to save paragraph to favorites:', error);
    }
  }

  // Get saved paragraphs
  static getSavedParagraphs(): Array<{
    id: string;
    paragraph: string;
    vocabularies: string[];
    savedAt: string;
  }> {
    try {
      const savedJson = localStorage.getItem(STORAGE_KEYS.SAVED_PARAGRAPHS);
      if (savedJson) {
        return JSON.parse(savedJson);
      }
      return [];
    } catch (error) {
      console.error('❌ Failed to load saved paragraphs:', error);
      return [];
    }
  }

  // Remove from favorites
  static removeParagraphFromFavorites(id: string): void {
    try {
      const existingFavorites = this.getSavedParagraphs();
      const updatedFavorites = existingFavorites.filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEYS.SAVED_PARAGRAPHS, JSON.stringify(updatedFavorites));
      console.log('✅ Paragraph removed from favorites');
    } catch (error) {
      console.error('❌ Failed to remove paragraph from favorites:', error);
    }
  }

  // Clear all data
  static clearAllData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER_SETTINGS);
      localStorage.removeItem(STORAGE_KEYS.SAVED_PARAGRAPHS);
      localStorage.removeItem(STORAGE_KEYS.PARAGRAPH_HISTORY);
      console.log('✅ All localStorage data cleared');
    } catch (error) {
      console.error('❌ Failed to clear localStorage data:', error);
    }
  }

  // Export data for backup
  static exportUserData(): string {
    try {
      const data = {
        settings: this.loadUserSettings(),
        savedParagraphs: this.getSavedParagraphs(),
        history: this.getParagraphHistory(),
        exportedAt: new Date().toISOString()
      };
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('❌ Failed to export user data:', error);
      return '';
    }
  }

  // Import data from backup
  static importUserData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.settings) {
        this.saveUserSettings(data.settings);
      }
      
      if (data.savedParagraphs) {
        localStorage.setItem(STORAGE_KEYS.SAVED_PARAGRAPHS, JSON.stringify(data.savedParagraphs));
      }
      
      if (data.history) {
        localStorage.setItem(STORAGE_KEYS.PARAGRAPH_HISTORY, JSON.stringify(data.history));
      }
      
      console.log('✅ User data imported successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to import user data:', error);
      return false;
    }
  }
}
