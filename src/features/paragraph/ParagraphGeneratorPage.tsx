import React, { useState, useEffect, useCallback } from 'react';
import { paragraphController } from '@/controllers/paragraphController';
import { LocalStorageService, type UserSettings } from '@/services/localStorageService';
import { mapUIToApiRequest } from '@/lib/dataMappers';
import { useVocabSuggestions } from '@/hooks/useVocabSuggestions';
import { useAuth } from '@/hooks/useAuth';
import { learnedVocabService } from '@/services/learnedVocabService';

// Feature components
import { SettingsPanel } from '@/features/settings/SettingsPanel';
import { MainWorkspace } from '@/features/workspace/MainWorkspace';
import { useToast } from '@/hooks/use-toast';

// Types
import type { VocabExplanations, ExplanationInParagraph } from '@/types/api';

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
  length: 'short' | 'medium' | 'long' | 'sentence' | 'custom';
  customLength?: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  topic: string;
  customTopic?: string;
  customLanguage?: string;
  tone: 'none' | 'friendly' | 'formal' | 'humorous' | 'storytelling' | 'academic';
  prompt?: string;
}

export const ParagraphGeneratorPage: React.FC = () => {
  const { toast } = useToast();
  
  // Load settings from localStorage on component mount (excluding prompt)
  const [settings, setSettings] = useState<ParagraphSettings>(() => {
    const savedSettings = LocalStorageService.getUserSettingsOrDefaults();
    console.log('🔧 Loading settings from localStorage:', savedSettings);
    const initialSettings = {
      language: savedSettings.language,
      length: savedSettings.length as 'short' | 'medium' | 'long' | 'custom',
      level: (savedSettings.level === 'none' ? 'beginner' : savedSettings.level) as 'beginner' | 'intermediate' | 'advanced',
      topic: savedSettings.topic,
      tone: savedSettings.tone as 'none' | 'friendly' | 'formal' | 'humorous' | 'storytelling' | 'academic',
      customLength: savedSettings.customLength || 100,
      prompt: '' // Always start with empty prompt, don't load from localStorage
    };
    console.log('🔧 Initial settings state:', initialSettings);
    return initialSettings;
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
  const [currentExplainVocabs, setCurrentExplainVocabs] = useState<VocabExplanations | undefined>();
  const [currentExplanationInParagraph, setCurrentExplanationInParagraph] = useState<ExplanationInParagraph | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
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

  // Use vocabulary suggestions hook
  const { 
    suggestions: vocabularySuggestions, 
    suggestionData: vocabularySuggestionData,
    removeSuggestion 
  } = useVocabSuggestions();

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
      // log settings
      console.log('API Request:', { vocabularies, settings });
      console.log('Settings prompt value:', settings.prompt);
      console.log('Settings object keys:', Object.keys(settings));
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
        
        // Debug logging for vocabulary explanations
        console.log('🐛 Debug - explainVocabs:', response.data.explainVocabs);
        console.log('🐛 Debug - explanationInParagraph:', response.data.explanationInParagraph);
        console.log('🐛 Debug - explanationInParagraph type:', typeof response.data.explanationInParagraph);
        if (response.data.explanationInParagraph) {
          Object.entries(response.data.explanationInParagraph).forEach(([key, value]) => {
            console.log(`🐛 Debug - explanationInParagraph[${key}]:`, value, 'type:', typeof value);
          });
        }
        
        setCurrentExplainVocabs(response.data.explainVocabs);
        setCurrentExplanationInParagraph(response.data.explanationInParagraph);
        setHistory(prev => [newParagraph, ...prev]);
        setIsSaved(false); // Reset save state for new paragraph

        // Call learned-vocabs API after successful paragraph generation
        if (isAuthenticated && vocabularies.length > 0) {
          try {
            console.log('📚 Calling learned-vocabs API for vocabularies:', vocabularies);
            const learnedResponse = await learnedVocabService.markVocabulariesAsLearned(vocabularies);
            
            if (learnedResponse.success) {
              console.log('✅ Successfully marked vocabularies as learned');
            } else {
              console.warn('⚠️ Failed to mark vocabularies as learned:', learnedResponse.error);
            }
          } catch (learnedError) {
            console.error('❌ Error calling learned-vocabs API:', learnedError);
          }
        } else {
          console.log('ℹ️ Skipping learned-vocabs API call - user not authenticated or no vocabularies');
        }
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
        setCurrentExplainVocabs(undefined);
        setCurrentExplanationInParagraph(undefined);
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
      setCurrentExplainVocabs(undefined);
      setCurrentExplanationInParagraph(undefined);
    } finally {
      setIsLoading(false);
    }
  }, [vocabularies, settings]);

  // Save paragraph to API
  const saveParagraph = async () => {
    if (!currentParagraph || isSaved || isSaving) return;
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Cần đăng nhập",
        description: "Bạn cần đăng nhập để sử dụng tính năng này",
      });
      return;
    }
    
    setIsSaving(true);
    
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
        
        // Mark as saved
        setIsSaved(true);
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
    } finally {
      setIsSaving(false);
    }
  };

  const getRandomFromHistory = () => {
    if (history.length === 0) return;
    const randomParagraph = history[Math.floor(Math.random() * history.length)];
    setCurrentParagraph(randomParagraph.content);
    setVocabularies(randomParagraph.vocabularies);
    setSettings(randomParagraph.settings);
    setIsSaved(false); // Reset save state when loading from history
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

  // Save settings to localStorage when they change (excluding vocabularies and prompt)
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
      customLanguages: customLanguages,
      prompt: '' // Don't save prompt to localStorage
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
      customLength: defaultSettings.customLength,
      prompt: '' // Always reset prompt to empty, don't use from localStorage
    });
    setVocabularies([]); // Reset to empty array instead of loading from localStorage
    setSavedCustomLength(defaultSettings.customLength || 100);
    setCustomTopics(defaultSettings.customTopics || []);
    setCustomLanguages(defaultSettings.customLanguages || []);
    console.log('⚡ Settings reset to defaults (vocabularies cleared)');
  };

  const handleEditSave = useCallback((editedContent: string) => {
    setCurrentParagraph(editedContent);
    setIsSaved(false); // Reset save state when content is edited
    console.log('📝 Paragraph content updated from edit');
  }, []);

  const handleRemoveVocabulary = useCallback(async (vocabulary: string) => {
    console.log('🗑️ Removing vocabulary from learned list:', vocabulary);
    
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
      const response = await learnedVocabService.removeLearnedVocabulary(vocabulary);
      
      if (response.success) {
        console.log('✅ Successfully removed vocabulary from learned list');
        toast({
          variant: "default",
          title: "Đã xóa thành công",
          description: `Đã xóa "${vocabulary}" khỏi danh sách từ vựng đã học`,
        });
      } else {
        console.error('❌ Failed to remove vocabulary:', response.error);
        toast({
          variant: "destructive",
          title: "Xóa thất bại",
          description: response.error || "Không thể xóa từ vựng",
        });
      }
    } catch (error) {
      console.error('❌ Error removing vocabulary:', error);
      toast({
        variant: "destructive",
        title: "Lỗi mạng",
        description: error instanceof Error ? error.message : 'Không thể kết nối đến server',
      });
    }
  }, [isAuthenticated, toast]);

  const handleRemoveSuggestion = useCallback(async (suggestion: string, id?: string) => {
    console.log('🗑️ Removing suggestion from learned vocabs:', { suggestion, id });
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Cần đăng nhập",
        description: "Bạn cần đăng nhập để sử dụng tính năng này",
      });
      return;
    }

    // Use the optimistic UI function from the hook
    await removeSuggestion(suggestion, id);
  }, [isAuthenticated, toast, removeSuggestion]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <MainWorkspace
            vocabularies={vocabularies}
            setVocabularies={setVocabularies}
            vocabularySuggestions={vocabularySuggestions}
            vocabularySuggestionData={vocabularySuggestionData}
            generateParagraph={generateParagraph}
            isLoading={isLoading}
            getRandomFromHistory={getRandomFromHistory}
            historyLength={history.length}
            currentParagraph={currentParagraph}
            saveParagraph={saveParagraph}
            onEditSave={handleEditSave}
            isSaved={isSaved}
            isSaving={isSaving}
            explainVocabs={currentExplainVocabs}
            explanationInParagraph={currentExplanationInParagraph}
            onRemoveVocabulary={handleRemoveVocabulary}
            onRemoveSuggestion={handleRemoveSuggestion}
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
            prompt={settings.prompt || ''}
            setPrompt={(prompt: string) => {
              console.log('📝 Setting prompt to:', prompt);
              setSettings(prev => {
                const newSettings = { ...prev, prompt };
                console.log('📝 New settings after prompt update:', newSettings);
                return newSettings;
              });
            }}
          />
        </div>
      </div>
    </div>
  );
};