import React, { useState, useEffect, useCallback } from 'react';
import { paragraphController } from '@/controllers/paragraphController';
import { LocalStorageService, type UserSettings } from '@/services/localStorageService';
import { mapUIToApiRequest } from '@/lib/dataMappers';
import { useVocabSuggestions } from '@/hooks/useVocabSuggestions';
import { useAuth } from '@/hooks/useAuth';
import { learnedVocabService } from '@/services/learnedVocabService';
import { VocabCollectionService, type VocabCollection } from '@/services/vocabCollectionService';

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
  const [_history, setHistory] = useState<GeneratedParagraph[]>(() => {
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

  // State for current collection ID for vocab suggestions
  const [currentCollectionId, setCurrentCollectionId] = useState<string | undefined>(undefined);

  // Use vocabulary suggestions hook with current collection ID
  const { 
    suggestions: vocabularySuggestions, 
    suggestionData: vocabularySuggestionData,
    removeSuggestion,
    reload: reloadSuggestions
  } = useVocabSuggestions(currentCollectionId);

  // Use authentication hook
  const { isAuthenticated } = useAuth();

  // Load vocab collections when component mounts and user is authenticated
  useEffect(() => {
    const loadVocabCollections = async () => {
      if (isAuthenticated) {
        try {
          console.log('📚 Loading vocab collections...');
          const response = await VocabCollectionService.getVocabCollections();
          
          if (response.success && response.data) {
            console.log('✅ Raw API response:', response);
            console.log('✅ Collections data:', response.data);
            console.log('✅ Active collections:', response.data.filter(c => c.status === true));
            setVocabCollections(response.data);
            
            // Set initial collection ID for vocab suggestions
            const activeCollection = response.data.find(c => c.status === true);
            const initialCollectionId = activeCollection?.id || response.data[0]?.id;
            if (initialCollectionId && !currentCollectionId) {
              console.log('🎯 Setting initial collection ID for vocab suggestions:', initialCollectionId);
              setCurrentCollectionId(initialCollectionId);
            }
          } else {
            console.warn('⚠️ Failed to load vocab collections:', response.error);
            // Fallback to empty array - component will use default collections
            setVocabCollections([]);
          }
        } catch (error) {
          console.error('❌ Error loading vocab collections:', error);
          // Fallback to empty array - component will use default collections
          setVocabCollections([]);
        }
      } else {
        // If not authenticated, use empty array - component will use default collections
        setVocabCollections([]);
        setCurrentCollectionId(undefined);
      }
    };

    loadVocabCollections();
  }, [isAuthenticated]);

  // State for custom languages loaded from localStorage
  const [customLanguages, setCustomLanguages] = useState<string[]>(() => {
    return LocalStorageService.getCustomLanguages();
  });

  // State for custom topics loaded from localStorage
  const [customTopics, setCustomTopics] = useState<string[]>(() => {
    return LocalStorageService.getCustomTopics();
  });

  // State for vocab collections loaded from API
  const [vocabCollections, setVocabCollections] = useState<VocabCollection[]>([]);

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
            
            // Get collection ID - use first active collection or first available
            const activeCollection = vocabCollections.find(c => c.status === true);
            const collectionId = activeCollection?.id || vocabCollections[0]?.id;
            
            if (collectionId) {
              const learnedResponse = await learnedVocabService.markVocabulariesAsLearned(vocabularies, collectionId);
            
              if (learnedResponse.success) {
                console.log('✅ Successfully marked vocabularies as learned');
              } else {
                console.warn('⚠️ Failed to mark vocabularies as learned:', learnedResponse.error);
              }
            } else {
              console.warn('⚠️ No collection ID available for learned vocabs API');
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

  const getRandomFromHistory = useCallback(async () => {
    // Check if we have vocabulary suggestions available
    if (vocabularySuggestions.length === 0) {
      toast({
        variant: "destructive",
        title: "No suggestions available",
        description: "Please wait for vocabulary suggestions to load",
      });
      return;
    }

    // Randomly select up to 3 vocabularies from suggestions
    const maxVocabs = Math.min(3, vocabularySuggestions.length);
    const shuffled = [...vocabularySuggestions].sort(() => 0.5 - Math.random());
    const randomVocabs = shuffled.slice(0, maxVocabs);
    
    console.log(`🎲 Random vocabularies selected: ${randomVocabs.join(', ')} (${randomVocabs.length}/${vocabularySuggestions.length} available)`);
    
    // Don't update the vocabulary input field - call API directly
    setIsLoading(true);
    
    try {
      // Call the API directly with random vocabularies without updating UI
      const response = await paragraphController.generateParagraph(randomVocabs, settings);
      console.log('API Request:', { vocabularies: randomVocabs, settings });
      console.log('API Response:', response);

      if (response.success && response.data) {
        const generatedContent = response.data.paragraph;
        
        const newParagraph: GeneratedParagraph = {
          id: Date.now().toString(),
          content: generatedContent,
          vocabularies: [...randomVocabs],
          settings: { ...settings },
          timestamp: new Date(),
          saved: false
        };
        
        setCurrentParagraph(generatedContent);
        
        // Set explanations but without highlighting (no explanationInParagraph)
        setCurrentExplainVocabs(response.data.explainVocabs);
        setCurrentExplanationInParagraph(undefined); // Don't show highlights
        setHistory(prev => [newParagraph, ...prev]);
        setIsSaved(false); // Reset save state for new paragraph

        // Call learned-vocabs API after successful paragraph generation
        if (isAuthenticated && randomVocabs.length > 0) {
          try {
            console.log('📚 Calling learned-vocabs API for vocabularies:', randomVocabs);
            
            // Get collection ID - use first active collection or first available
            const activeCollection = vocabCollections.find(c => c.status === true);
            const collectionId = activeCollection?.id || vocabCollections[0]?.id;
            
            if (collectionId) {
              const learnedResponse = await learnedVocabService.markVocabulariesAsLearned(randomVocabs, collectionId);
            
              if (learnedResponse.success) {
                console.log('✅ Successfully marked vocabularies as learned');
              } else {
                console.warn('⚠️ Failed to mark vocabularies as learned:', learnedResponse.error);
              }
            } else {
              console.warn('⚠️ No collection ID available for learned vocabs API');
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
  }, [vocabularySuggestions, settings, toast, isAuthenticated]);

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

  // Handle collection change and refresh vocabulary suggestions
  const handleCollectionChange = useCallback(async (collectionId: string, collectionName: string) => {
    console.log('🔄 Collection changed, refreshing vocab suggestions:', { collectionId, collectionName });
    
    // Update the current collection ID
    setCurrentCollectionId(collectionId);
    
    // Reload vocabulary suggestions with new collection
    try {
      await reloadSuggestions();
      console.log('✅ Successfully refreshed vocabulary suggestions for new collection');
    } catch (error) {
      console.error('❌ Error refreshing vocabulary suggestions:', error);
      toast({
        variant: "destructive",
        title: "Error loading suggestions",
        description: "Failed to load vocabulary suggestions for the selected collection",
      });
    }
  }, [setCurrentCollectionId, reloadSuggestions, toast]);

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
            currentParagraph={currentParagraph}
            saveParagraph={saveParagraph}
            onEditSave={handleEditSave}
            isSaved={isSaved}
            isSaving={isSaving}
            explainVocabs={currentExplainVocabs}
            explanationInParagraph={currentExplanationInParagraph}
            onRemoveSuggestion={handleRemoveSuggestion}
            vocabCollections={vocabCollections}
            onCollectionChange={handleCollectionChange}
            onRefreshSuggestions={reloadSuggestions}
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