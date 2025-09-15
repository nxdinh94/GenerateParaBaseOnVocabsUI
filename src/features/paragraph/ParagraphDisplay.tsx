import React, { useState, useEffect } from 'react';
import { Copy, Save, Edit3, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatTextWithHighlights, extractPlainText, hasHighlights } from '@/lib/textFormatter';
import { LocalStorageService } from '@/services/localStorageService';
import type { VocabExplanations, ExplanationInParagraph } from '@/types/api';

interface ParagraphDisplayProps {
  currentParagraph: string;
  isLoading: boolean;
  saveParagraph: () => void;
  onEditSave?: (editedContent: string) => void;
  isSaved?: boolean;
  isSaving?: boolean;
  explainVocabs?: VocabExplanations;
  explanationInParagraph?: ExplanationInParagraph;
}

export const ParagraphDisplay: React.FC<ParagraphDisplayProps> = ({
  currentParagraph,
  isLoading,
  saveParagraph,
  onEditSave,
  isSaved = false,
  isSaving = false,
  explainVocabs,
  explanationInParagraph
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [isVocabDictionaryCollapsed, setIsVocabDictionaryCollapsed] = useState(() => 
    LocalStorageService.getVocabDictionaryCollapsed()
  );

  // Save vocabulary dictionary collapsed state to localStorage
  useEffect(() => {
    LocalStorageService.saveVocabDictionaryCollapsed(isVocabDictionaryCollapsed);
  }, [isVocabDictionaryCollapsed]);

  const toggleVocabDictionary = () => {
    setIsVocabDictionaryCollapsed(!isVocabDictionaryCollapsed);
  };

  // Debug logging
  console.log('🐛 ParagraphDisplay render:', {
    currentParagraph: currentParagraph?.substring(0, 100) + '...',
    explainVocabs,
    explanationInParagraph,
    hasExplainVocabs: explainVocabs && Object.keys(explainVocabs).length > 0,
    hasExplanationInParagraph: explanationInParagraph && Object.keys(explanationInParagraph).length > 0
  });

  const handleEdit = () => {
    setIsEditing(!isEditing);
    setEditContent(currentParagraph);
  };

  const handleSaveEdit = () => {
    // Save the edited content if callback is provided
    if (onEditSave && editContent.trim()) {
      onEditSave(editContent);
    }
    setIsEditing(false);
  };

  const handleCopy = () => {
    const plainText = hasHighlights(currentParagraph) 
      ? extractPlainText(currentParagraph) 
      : currentParagraph;
    navigator.clipboard.writeText(plainText);
  };

  return (
    <div className="space-y-6">
      {/* Section 1: Generated Paragraph */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Generated Paragraph</h3>
          {currentParagraph && !isLoading && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={saveParagraph}
                disabled={isSaved || isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          )}
        </div>

        <div className="min-h-[200px] border border-border rounded-md p-4 bg-muted/50">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[150px]"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : currentParagraph ? (
            <div className="text-foreground leading-relaxed">
              {formatTextWithHighlights(currentParagraph)}
            </div>
          ) : (
            <p className="text-muted-foreground italic">
              Enter some vocabularies and click "Generate Paragraph" to get started.
            </p>
          )}
        </div>
      </Card>

      {/* Section 2: Context Explanations */}
      {explanationInParagraph && Object.keys(explanationInParagraph).length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">📖 Context Explanations</h3>
          <div className="space-y-4">
            {Object.entries(explanationInParagraph).map(([vocab, explanation]) => {
              // Ensure explanation is a string
              const explanationText = typeof explanation === 'string' ? explanation : JSON.stringify(explanation);
              
              return (
                <div key={vocab} className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-md">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="font-semibold">
                      {vocab}
                    </Badge>
                  </div>
                  <p className="text-blue-800 text-sm" dangerouslySetInnerHTML={{
                    __html: explanationText.replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-900 font-bold">$1</strong>')
                  }} />
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Section 3: General Vocabulary Meanings */}
      {explainVocabs && Object.keys(explainVocabs).length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">📚 Vocabulary Dictionary</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleVocabDictionary}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
            >
              {isVocabDictionaryCollapsed ? (
                <>
                  <span>Expand</span>
                  <ChevronDown className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span>Collapse</span>
                  <ChevronUp className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
          
          {!isVocabDictionaryCollapsed && (
            <div className="space-y-6">
              {Object.entries(explainVocabs).map(([vocab, meanings], index) => {
                // Ensure meanings is an array
                const meaningsArray = Array.isArray(meanings) ? meanings : [meanings];
                
                return (
                  <div key={vocab} className="space-y-3">
                    {index > 0 && <Separator className="my-4" />}
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-base font-bold px-3 py-1">
                        {vocab}
                      </Badge>
                    </div>

                    <div className="space-y-3 ml-4">
                      {meaningsArray.map((meaningObj, meaningIndex) => {
                        // Ensure meaningObj has the expected structure
                        const meaning = typeof meaningObj === 'object' && meaningObj.meaning 
                          ? meaningObj.meaning 
                          : String(meaningObj);
                        const example = typeof meaningObj === 'object' && meaningObj.example 
                          ? meaningObj.example 
                          : '';
                          
                        return (
                          <div key={meaningIndex} className="border-l-2 border-gray-200 pl-4">
                            <p className="text-gray-800 mb-2">
                              <span className="font-semibold text-gray-600">{meaningIndex + 1}.</span> {meaning}
                            </p>
                            {example && (
                              <div className="bg-gray-50 p-3 rounded border-l-2 border-green-300">
                                <p className="text-xs text-gray-600 mb-1 font-medium">Example:</p>
                                <p className="text-sm text-gray-700" dangerouslySetInnerHTML={{ 
                                  __html: example.replace(/\*\*(.*?)\*\*/g, '<strong class="text-green-600">$1</strong>')
                                }} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
