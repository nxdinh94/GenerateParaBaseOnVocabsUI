import React, { useState, useRef, useEffect } from 'react';
import { Shuffle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TagInput } from '@/features/vocabulary/TagInput';
import { ParagraphDisplay } from '@/features/paragraph/ParagraphDisplay';
import type { VocabExplanations, ExplanationInParagraph } from '@/types/api';
import type { VocabCollection } from '@/services/vocabCollectionService';
import { VocabCollectionController } from '@/controllers/vocabCollectionController';
import { useToast } from '@/hooks/use-toast';
import { UserApiService } from '@/services/userApiService';

interface MainWorkspaceProps {
  vocabularies: string[];
  setVocabularies: (vocabularies: string[]) => void;
  vocabularySuggestions: string[];
  vocabularySuggestionData?: { vocab: string; id?: string }[];
  generateParagraph: () => void;
  isLoading: boolean;
  getRandomFromHistory: () => void;
  currentParagraph: string;
  saveParagraph: () => void;
  onEditSave?: (editedContent: string) => void;
  isSaved?: boolean;
  isSaving?: boolean;
  explainVocabs?: VocabExplanations;
  explanationInParagraph?: ExplanationInParagraph;
  onRemoveSuggestion?: (suggestion: string, id?: string) => void;
  vocabCollections?: VocabCollection[];
  onCollectionChange?: (collectionId: string, collectionName: string) => void;
  onRefreshSuggestions?: () => void; // Callback to refresh vocabulary suggestions
  isLoadingCollections?: boolean; // Loading state for collections
}

export const MainWorkspace: React.FC<MainWorkspaceProps> = ({
  vocabularies,
  setVocabularies,
  vocabularySuggestions,
  vocabularySuggestionData,
  generateParagraph,
  isLoading,
  getRandomFromHistory,
  currentParagraph,
  saveParagraph,
  onEditSave,
  isSaved,
  isSaving,
  explainVocabs,
  explanationInParagraph,
  onRemoveSuggestion,
  vocabCollections = [],
  onCollectionChange,
  onRefreshSuggestions,
  isLoadingCollections = false
}) => {
  // Use API collections (filter only active ones)
  const collectionOptions = vocabCollections.filter(c => c.status === true);
  
  const [selectedCollection, setSelectedCollection] = useState('None');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | undefined>(undefined);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize selected collection from JWT token on mount
  useEffect(() => {
    const initializeSelectedCollection = () => {
      try {
        const jwtToken = UserApiService.getStoredJwtToken();
        if (jwtToken) {
          const payload = UserApiService.decodeJwtToken(jwtToken);
          if (payload && payload.selected_collection_id) {
            console.log('🎯 Found selected_collection_id in JWT:', payload.selected_collection_id);
            setSelectedCollectionId(payload.selected_collection_id);
            
            // Find the collection by ID and set its name
            const collection = collectionOptions.find(c => c.id === payload.selected_collection_id);
            if (collection) {
              console.log('✅ Setting initial collection to:', collection.name);
              setSelectedCollection(collection.name);
            }
          }
        }
      } catch (error) {
        console.error('❌ Error decoding JWT token:', error);
      }
    };

    initializeSelectedCollection();
  }, []); // Run only once on mount

  // Debug logging
  useEffect(() => {
    console.log('🎯 MainWorkspace - Collections updated:', {
      apiCollections: vocabCollections,
      activeCollections: collectionOptions,
      usingAPI: vocabCollections.length > 0,
      selectedCollection,
      selectedCollectionId
    });
  }, [vocabCollections, collectionOptions, selectedCollection, selectedCollectionId]);

  // Update selected collection when collections change from API or JWT selectedCollectionId is available
  useEffect(() => {
    if (collectionOptions.length > 0) {
      // If we have a selectedCollectionId from JWT, use it to set the collection
      if (selectedCollectionId) {
        const collection = collectionOptions.find(c => c.id === selectedCollectionId);
        if (collection && collection.name !== selectedCollection) {
          console.log('🔄 Updating collection from JWT selected_collection_id:', collection.name);
          setSelectedCollection(collection.name);
        }
      } else if (!collectionOptions.some(c => c.name === selectedCollection)) {
        // Fallback: if current selection is not in the list, select the first one
        setSelectedCollection(collectionOptions[0].name);
        setSelectedCollectionId(collectionOptions[0].id);
      }
    }
  }, [collectionOptions, selectedCollectionId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOptionSelect = async (option: VocabCollection) => {
    setSelectedCollection(option.name);
    setSelectedCollectionId(option.id);
    setIsDropdownOpen(false);
    
    // Call API to change selected collection
    if (option.id) {
      console.log('🔄 Changing selected collection to:', { id: option.id, name: option.name });
      
      const response = await VocabCollectionController.changeSelectedCollection(option.id);
      
      if (response.success) {
        console.log('✅ Collection changed successfully');
        // Trigger the collection change callback to refresh vocabulary suggestions
        if (onCollectionChange) {
          onCollectionChange(option.id, option.name);
        }
      } else {
        console.error('❌ Failed to change collection:', response.error);
      }
    }
  };
  return (
    <div className="space-y-6">
      {/* Vocabulary Input */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Enter Vocabularies</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Collection:</span>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                disabled={isLoadingCollections || collectionOptions.length === 0}
                className="flex items-center gap-2 px-3 py-2 text-sm border rounded-md bg-background hover:bg-accent transition-colors duration-200 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingCollections ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    <span className="text-muted-foreground">Loading...</span>
                  </>
                ) : collectionOptions.length === 0 ? (
                  <span className="text-muted-foreground">No collections</span>
                ) : (
                  <>
                    <span className="text-muted-foreground">{selectedCollection}</span>
                    <ChevronDown 
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isDropdownOpen ? 'rotate-180' : ''
                      }`} 
                    />
                  </>
                )}
              </button>
              
              {/* Animated Dropdown */}
              <div
                className={`absolute top-full left-0 mt-1 min-w-full w-max bg-background border rounded-md shadow-lg z-50 transition-all duration-200 origin-top ${
                  isDropdownOpen
                    ? 'opacity-100 scale-y-100 translate-y-0'
                    : 'opacity-0 scale-y-0 -translate-y-2 pointer-events-none'
                }`}
              >
                <div className="py-1">
                  {collectionOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleOptionSelect(option)}
                      className={`w-full px-3 py-2 text-sm text-left hover:bg-accent transition-colors duration-150 whitespace-nowrap ${
                        option.name === selectedCollection ? 'bg-accent' : ''
                      }`}
                    >
                      {option.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <TagInput
          value={vocabularies}
          onChange={setVocabularies}
          placeholder="Type vocabularies and press Enter or comma..."
          suggestions={vocabularySuggestions}
          suggestionData={vocabularySuggestionData}
          onRemoveSuggestion={onRemoveSuggestion}
          onRefresh={onRefreshSuggestions}
        />
        <p className="text-sm text-muted-foreground mt-2">
          Press Ctrl+Enter to generate paragraph
        </p>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-row gap-3">
        <Button
          onClick={generateParagraph}
          disabled={vocabularies.length === 0 || isLoading}
          className="flex-1"
        >
          {isLoading ? 'Generating...' : 'Generate Paragraph'}
        </Button>
        <Button
          variant="outline"
          onClick={getRandomFromHistory}
          disabled={vocabularySuggestions.length === 0 || isLoading}
          className="flex-1"
        >
          <Shuffle className="h-4 w-4 mr-2" />
          Random Vocabulary
        </Button>
      </div>

      {/* Result Area */}
      <ParagraphDisplay
        currentParagraph={currentParagraph}
        isLoading={isLoading}
        saveParagraph={saveParagraph}
        onEditSave={onEditSave}
        isSaved={isSaved}
        isSaving={isSaving}
        explainVocabs={explainVocabs}
        explanationInParagraph={explanationInParagraph}
      />
    </div>
  );
};
