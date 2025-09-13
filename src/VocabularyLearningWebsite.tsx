"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { paragraphController } from './controllers/paragraphController';
import { LocalStorageService, type UserSettings } from './services/localStorageService';
import { mapUIToApiRequest } from './lib/dataMappers';
import { useVocabSuggestions } from './hooks/useVocabSuggestions';
import { useAuth } from './hooks/useAuth';

// Feature components
import { HeroSection } from './features/landing/HeroSection';
import { FeaturesSection } from './features/landing/FeaturesSection';
import { FAQSection } from './features/landing/FAQSection';
import { ContactSection } from './features/landing/ContactSection';
import { SettingsPanel } from './features/settings/SettingsPanel';
import { MainWorkspace } from './features/workspace/MainWorkspace';
import { useToast } from './hooks/use-toast';

// Types
interface GeneratedParagraph {
  id: string;
  content: string;
  vocabularies: string[];
  settings: ParagraphSettings;
  timestamp: Date;
  saved: boolean;
}

interface ParagraphSettings {
  language: string;
  length: 'short' | 'medium' | 'long' | 'custom';
  customLength?: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  topic: string;
  customTopic?: string;
  customLanguage?: string;
  tone: 'none' | 'friendly' | 'formal' | 'humorous' | 'storytelling' | 'academic';
}

// Main Component
const VocabularyLearningWebsite: React.FC = () => {
  const { toast } = useToast();
  
  // Load settings from localStorage on component mount
  const [settings, setSettings] = useState<ParagraphSettings>(() => {
    const savedSettings = LocalStorageService.getUserSettingsOrDefaults();
    return {
      language: savedSettings.language,
      length: savedSettings.length as 'short' | 'medium' | 'long' | 'custom',
      level: (savedSettings.level === 'none' ? 'beginner' : savedSettings.level) as 'beginner' | 'intermediate' | 'advanced',
      topic: savedSettings.topic,
      tone: savedSettings.tone as 'none' | 'friendly' | 'formal' | 'humorous' | 'storytelling' | 'academic',
      customLength: savedSettings.customLength || 100
    };
  });

  // Initialize vocabularies as empty array (not persisted to localStorage)
  const [vocabularies, setVocabularies] = useState<string[]>([]);

  // State for saved custom length to display in dropdown
  const [savedCustomLength, setSavedCustomLength] = useState<number>(() => {
    const savedSettings = LocalStorageService.getUserSettingsOrDefaults();
    return savedSettings.customLength || 100;
  });

  // Other state variables
  const [currentParagraph, setCurrentParagraph] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Load saved data from localStorage for history, but saved paragraphs will come from API
  const [history, setHistory] = useState<GeneratedParagraph[]>(() => {
    const savedHistory = LocalStorageService.getParagraphHistory();
    return savedHistory.map(item => ({
      id: item.id,
      content: item.paragraph,
      vocabularies: item.vocabularies,
      settings: { language: 'english', length: 'short', level: 'beginner', topic: 'none', tone: 'none' } as ParagraphSettings,
      timestamp: new Date(item.createdAt),
      saved: false
    }));
  });

  // Saved paragraphs now come from API (grouped format) - moved to SavedPageWrapper
  // const [groupedParagraphs, setGroupedParagraphs] = useState<GroupedParagraphs[]>([]);
  // const [isLoadingSavedParagraphs, setIsLoadingSavedParagraphs] = useState(false);
  // const [savedParagraphsError, setSavedParagraphsError] = useState<string | null>(null);

  // Use vocabulary suggestions hook
  const { suggestions: vocabularySuggestions } = useVocabSuggestions();

  // Use authentication hook
  const { isAuthenticated } = useAuth();

  // State for custom languages loaded from localStorage
  const [customLanguages, setCustomLanguages] = useState<string[]>(() => {
    return LocalStorageService.getCustomLanguages();
  });

  // State for custom topics loaded from localStorage
  const [customTopics, setCustomTopics] = useState<string[]>(() => {
    return LocalStorageService.getCustomTopics();
  });

  const generateParagraph = useCallback(async () => {
    if (vocabularies.length === 0) return;

    setIsLoading(true);
    
    try {
      // Call the API through the controller
      const response = await paragraphController.generateParagraph(vocabularies, settings);
      
      console.log('API Response:', response);

      if (response.success && response.data) {
        const generatedContent = response.data.paragraph;
        
        const newParagraph: GeneratedParagraph = {
          id: Date.now().toString(),
          content: generatedContent,
          vocabularies: [...vocabularies],
          settings: { ...settings },
          timestamp: new Date(),
          saved: false
        };
        
        setCurrentParagraph(generatedContent);
        setHistory(prev => [newParagraph, ...prev]);
      } else {
        // Handle API error
        const errorMessage = response.error || 'Failed to generate paragraph';
        console.error('API Error:', errorMessage);
        
        // Show error toast
        toast({
          variant: "destructive",
          title: "Tạo thất bại",
          description: errorMessage,
        });
        
        // Show error in the paragraph field
        setCurrentParagraph(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Network Error:', error);
      
      // Show error toast
      toast({
        variant: "destructive",
        title: "Lỗi mạng",
        description: error instanceof Error ? error.message : 'Không thể kết nối đến server',
      });
      
      setCurrentParagraph(`Network Error: ${error instanceof Error ? error.message : 'Failed to connect to server'}`);
    } finally {
      setIsLoading(false);
    }
  }, [vocabularies, settings]);

  // Load saved paragraphs from API - moved to SavedPageWrapper
  // const loadSavedParagraphs = async () => { ... }

  // Save paragraph to API
  const saveParagraph = async () => {
    if (!currentParagraph) return;
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Cần đăng nhập",
        description: "Bạn cần đăng nhập để sử dụng tính năng này",
      });
      return;
    }
    
    try {
      const response = await paragraphController.saveParagraph(
        mapUIToApiRequest(currentParagraph, vocabularies)
      );
      
      if (response.success && response.data) {
        // Add to local state immediately
        const savedGroup = response.data[0];
        
        // Add to grouped paragraphs
        // Note: UI update will be handled by SavedPageWrapper when user navigates to saved page
        console.log('✅ Paragraph saved to API:', savedGroup.id);
        
        // Show success toast
        toast({
          variant: "success",
          title: "Lưu thành công!",
          description: "Đoạn văn đã được lưu vào danh sách yêu thích.",
        });
        
        // Also save to localStorage for backup (optional)
        LocalStorageService.saveParagraphToFavorites(currentParagraph, vocabularies);
      } else {
        console.error('❌ Failed to save paragraph:', response.error);
        toast({
          variant: "destructive",
          title: "Lưu thất bại",
          description: response.error || "Không thể lưu đoạn văn.",
        });
      }
    } catch (error) {
      console.error('❌ Error saving paragraph:', error);
      toast({
        variant: "destructive",
        title: "Lỗi mạng",
        description: error instanceof Error ? error.message : 'Không thể kết nối đến server.',
      });
    }
  };

  // Delete saved paragraph from API - moved to SavedPageWrapper  
  // const deleteSavedParagraph = async (id: string) => { ... }

  const getRandomFromHistory = () => {
    if (history.length === 0) return;
    const randomParagraph = history[Math.floor(Math.random() * history.length)];
    setCurrentParagraph(randomParagraph.content);
    setVocabularies(randomParagraph.vocabularies);
    setSettings(randomParagraph.settings);
  };

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      generateParagraph();
    }
  }, [generateParagraph]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Save settings to localStorage when they change (excluding vocabularies)
  useEffect(() => {
    const userSettings: UserSettings = {
      language: settings.language,
      length: settings.length,
      level: settings.level,
      topic: settings.topic,
      tone: settings.tone,
      vocabularies: [], // Always empty - vocabularies not persisted
      customLength: settings.customLength,
      customTopics: customTopics,
      customLanguages: customLanguages
    };
    LocalStorageService.saveUserSettings(userSettings);
  }, [settings, customTopics, customLanguages]); // Remove vocabularies from dependency array

  // Save to history when a new paragraph is generated
  useEffect(() => {
    if (currentParagraph && vocabularies.length > 0) {
      LocalStorageService.saveParagraphToHistory(currentParagraph, vocabularies);
    }
  }, [currentParagraph, vocabularies]);

  // localStorage management functions
  const resetSettings = () => {
    const defaultSettings = LocalStorageService.getDefaultSettings();
    setSettings({
      language: defaultSettings.language,
      length: defaultSettings.length as 'short' | 'medium' | 'long' | 'custom',
      level: (defaultSettings.level === 'none' ? 'beginner' : defaultSettings.level) as 'beginner' | 'intermediate' | 'advanced',
      topic: defaultSettings.topic,
      tone: defaultSettings.tone as 'none' | 'friendly' | 'formal' | 'humorous' | 'storytelling' | 'academic',
      customLength: defaultSettings.customLength
    });
    setVocabularies([]); // Reset to empty array instead of loading from localStorage
    setSavedCustomLength(defaultSettings.customLength || 100);
    setCustomTopics(defaultSettings.customTopics || []);
    setCustomLanguages(defaultSettings.customLanguages || []);
    console.log('⚡ Settings reset to defaults (vocabularies cleared)');
  };

  return (
    <>
      <HeroSection />
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <MainWorkspace
              vocabularies={vocabularies}
              setVocabularies={setVocabularies}
              vocabularySuggestions={vocabularySuggestions}
              generateParagraph={generateParagraph}
              isLoading={isLoading}
              getRandomFromHistory={getRandomFromHistory}
              historyLength={history.length}
              currentParagraph={currentParagraph}
              saveParagraph={saveParagraph}
            />
          </div>
          <div className="lg:col-span-1">
            <SettingsPanel
              settings={settings}
              setSettings={setSettings}
              savedCustomLength={savedCustomLength}
              setSavedCustomLength={setSavedCustomLength}
              customTopics={customTopics}
              setCustomTopics={setCustomTopics}
              customLanguages={customLanguages}
              setCustomLanguages={setCustomLanguages}
              resetSettings={resetSettings}
            />
          </div>
        </div>
      </div>
      
      <FeaturesSection />
      <FAQSection />
      <ContactSection />
    </>
  );
};

export default VocabularyLearningWebsite;
