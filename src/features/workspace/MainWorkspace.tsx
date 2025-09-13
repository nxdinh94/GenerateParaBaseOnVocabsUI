import React from 'react';
import { Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TagInput } from '@/features/vocabulary/TagInput';
import { ParagraphDisplay } from '@/features/paragraph/ParagraphDisplay';

interface MainWorkspaceProps {
  vocabularies: string[];
  setVocabularies: (vocabularies: string[]) => void;
  vocabularySuggestions: string[];
  generateParagraph: () => void;
  isLoading: boolean;
  getRandomFromHistory: () => void;
  historyLength: number;
  currentParagraph: string;
  saveParagraph: () => void;
  onEditSave?: (editedContent: string) => void;
}

export const MainWorkspace: React.FC<MainWorkspaceProps> = ({
  vocabularies,
  setVocabularies,
  vocabularySuggestions,
  generateParagraph,
  isLoading,
  getRandomFromHistory,
  historyLength,
  currentParagraph,
  saveParagraph,
  onEditSave
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
          disabled={historyLength === 0}
          className="flex-1"
        >
          <Shuffle className="h-4 w-4 mr-2" />
          Random from History
        </Button>
      </div>

      {/* Result Area */}
      <ParagraphDisplay
        currentParagraph={currentParagraph}
        isLoading={isLoading}
        saveParagraph={saveParagraph}
        onEditSave={onEditSave}
      />
    </div>
  );
};
