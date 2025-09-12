"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { paragraphController } from './controllers/paragraphController';
import { LocalStorageService, type UserSettings } from './services/localStorageService';
import { mapApiGroupArrayToUI, mapUIToApiRequest, type GroupedParagraphs } from './lib/dataMappers';
import { useVocabSuggestions } from './hooks/useVocabSuggestions';
import { useAuth } from './hooks/useAuth';

// Feature components
import { Navigation } from './features/navigation/Navigation';
import { HeroSection } from './features/landing/HeroSection';
import { FeaturesSection } from './features/landing/FeaturesSection';
import { FAQSection } from './features/landing/FAQSection';
import { ContactSection } from './features/landing/ContactSection';
import { Footer } from './features/layout/Footer';
import { SettingsPanel } from './features/settings/SettingsPanel';
import { MainWorkspace } from './features/workspace/MainWorkspace';
import { HistoryPage } from './features/history/HistoryPage';
import { SavedPage } from './features/saved/SavedPage';
import { Toaster } from './components/ui/toaster';
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
  const [darkMode, setDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
  const [currentPage, setCurrentPage] = useState<'home' | 'history' | 'saved'>('home');
  
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

  // Saved paragraphs now come from API (grouped format)
  const [groupedParagraphs, setGroupedParagraphs] = useState<GroupedParagraphs[]>([]);
  const [isLoadingSavedParagraphs, setIsLoadingSavedParagraphs] = useState(false);
  const [savedParagraphsError, setSavedParagraphsError] = useState<string | null>(null);

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

  // Load saved paragraphs from API
  const loadSavedParagraphs = async () => {
    setIsLoadingSavedParagraphs(true);
    setSavedParagraphsError(null);
    
    try {
      const response = await paragraphController.getSavedParagraphs();
      
      if (response.success && response.data) {
        // Convert API grouped paragraphs to UI format
        const convertedGroups = mapApiGroupArrayToUI(response.data);
        setGroupedParagraphs(convertedGroups);
        
        console.log('✅ Saved paragraphs loaded from API:', {
          groups: convertedGroups.length,
          totalParagraphs: response.data.reduce((sum, group) => sum + group.total_paragraphs, 0)
        });
      } else {
        setSavedParagraphsError(response.error || 'Failed to load saved paragraphs');
        console.error('❌ Failed to load saved paragraphs:', response.error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      setSavedParagraphsError(errorMessage);
      console.error('❌ Error loading saved paragraphs:', error);
    } finally {
      setIsLoadingSavedParagraphs(false);
    }
  };

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
        const newGroup: GroupedParagraphs = {
          id: savedGroup.id,
          vocabularies: savedGroup.vocabs,
          paragraphs: savedGroup.paragraphs,
          totalParagraphs: savedGroup.total_paragraphs,
          isGroup: savedGroup.is_group,
          timestamp: new Date(),
          saved: true
        };
        setGroupedParagraphs(prev => [newGroup, ...prev]);
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

  // Delete saved paragraph from API
  const deleteSavedParagraph = async (id: string) => {
    try {
      const response = await paragraphController.deleteSavedParagraph(id);
      
      if (response.success) {
        // Remove from local state immediately
        setGroupedParagraphs(prev => prev.filter(group => group.id !== id));
        console.log('✅ Paragraph deleted from API:', id);
        
        // Show success toast
        toast({
          variant: "success",
          title: "Xóa thành công!",
          description: "Đoạn văn đã được xóa khỏi danh sách yêu thích.",
        });
      } else {
        console.error('❌ Failed to delete paragraph:', response.error);
        toast({
          variant: "destructive",
          title: "Xóa thất bại",
          description: response.error || "Không thể xóa đoạn văn.",
        });
      }
    } catch (error) {
      console.error('❌ Error deleting paragraph:', error);
      toast({
        variant: "destructive",
        title: "Lỗi mạng",
        description: error instanceof Error ? error.message : 'Không thể kết nối đến server.',
      });
    }
  };

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

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

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

  // Load saved paragraphs when "Saved" tab is selected
  useEffect(() => {
    if (currentPage === 'saved') {
      loadSavedParagraphs();
    }
  }, [currentPage]);

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
    <div className={cn("min-h-screen bg-background", darkMode && "dark")}>
      <Navigation
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      
      {currentPage === 'home' && (
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
      )}
      
      {currentPage === 'history' && (
        <div className="container mx-auto px-4 py-12">
          <HistoryPage history={history} />
        </div>
      )}
      
      {currentPage === 'saved' && (
        <div className="container mx-auto px-4 py-12">
          <SavedPage
            groupedParagraphs={groupedParagraphs}
            isLoadingSavedParagraphs={isLoadingSavedParagraphs}
            savedParagraphsError={savedParagraphsError}
            loadSavedParagraphs={loadSavedParagraphs}
            deleteSavedParagraph={deleteSavedParagraph}
          />
        </div>
      )}
      
      <Footer />
      <Toaster />
    </div>
  );
};

export default VocabularyLearningWebsite;
