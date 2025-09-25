import React from 'react';
import { Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TagInput } from '@/features/vocabulary/TagInput';
import { ParagraphDisplay } from '@/features/paragraph/ParagraphDisplay';
import type { VocabExplanations, ExplanationInParagraph } from '@/types/api';

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
  onRemoveVocabulary?: (vocabulary: string) => void;
  onRemoveSuggestion?: (suggestion: string, id?: string) => void;
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
  onRemoveVocabulary,
  onRemoveSuggestion
}) => {
  return (
    <div className="space-y-6">
      {/* Vocabulary Input */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Enter Vocabularies</h2>
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
        onRemoveVocabulary={onRemoveVocabulary}
      />
    </div>
  );
};
