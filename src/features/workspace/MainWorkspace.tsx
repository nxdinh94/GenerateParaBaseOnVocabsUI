import React, { useState, useRef, useEffect } from 'react';
import { Shuffle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TagInput } from '@/features/vocabulary/TagInput';
import { ParagraphDisplay } from '@/features/paragraph/ParagraphDisplay';
import type { VocabExplanations, ExplanationInParagraph } from '@/types/api';
import type { VocabCollection } from '@/services/vocabCollectionService';

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
  onCollectionChange
}) => {
  // Default collections if API doesn't return any
  const defaultCollections: VocabCollection[] = [
    { id: 'personal', name: 'Personal', user_id: '', created_at: '', updated_at: '', status: true },
    { id: 'work', name: 'Work', user_id: '', created_at: '', updated_at: '', status: true },
    { id: 'academic', name: 'Academic', user_id: '', created_at: '', updated_at: '', status: true },
    { id: 'toefl', name: 'TOEFL Prep', user_id: '', created_at: '', updated_at: '', status: true },
    { id: 'ielts', name: 'IELTS Prep', user_id: '', created_at: '', updated_at: '', status: true },
    { id: 'business', name: 'Business English', user_id: '', created_at: '', updated_at: '', status: true },
    { id: 'conversation', name: 'Daily Conversation', user_id: '', created_at: '', updated_at: '', status: true }
  ];
  
  // Use API collections if available (filter only active ones), otherwise use default
  const collectionOptions = vocabCollections.length > 0 
    ? vocabCollections.filter(c => c.status === true)
    : defaultCollections;
  
  const [selectedCollection, setSelectedCollection] = useState('Personal');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debug logging
  useEffect(() => {
    console.log('🎯 MainWorkspace - Collections updated:', {
      apiCollections: vocabCollections,
      activeCollections: collectionOptions,
      usingAPI: vocabCollections.length > 0,
      selectedCollection
    });
  }, [vocabCollections, collectionOptions, selectedCollection]);

  // Update selected collection when collections change from API
  useEffect(() => {
    if (collectionOptions.length > 0 && !collectionOptions.some(c => c.name === selectedCollection)) {
      setSelectedCollection(collectionOptions[0].name);
    }
  }, [collectionOptions, selectedCollection]);

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

  const handleOptionSelect = (option: VocabCollection) => {
    setSelectedCollection(option.name);
    setIsDropdownOpen(false);
    
    // Trigger the collection change callback to refresh vocabulary suggestions
    if (onCollectionChange && option.id) {
      console.log('🔄 Collection changed to:', { id: option.id, name: option.name });
      onCollectionChange(option.id, option.name);
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
                className="flex items-center gap-2 px-3 py-2 text-sm border rounded-md bg-background hover:bg-accent transition-colors duration-200"
              >
                <span className="text-muted-foreground">{selectedCollection}</span>
                <ChevronDown 
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`} 
                />
              </button>
              
              {/* Animated Dropdown */}
              <div
                className={`absolute top-full left-0 mt-1 w-full bg-background border rounded-md shadow-lg z-50 transition-all duration-200 origin-top ${
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
                      className={`w-full px-3 py-2 text-sm text-left hover:bg-accent transition-colors duration-150 ${
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
