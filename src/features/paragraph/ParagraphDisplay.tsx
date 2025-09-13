import React, { useState } from 'react';
import { Copy, Save, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTextWithHighlights, extractPlainText, hasHighlights } from '@/lib/textFormatter';

interface ParagraphDisplayProps {
  currentParagraph: string;
  isLoading: boolean;
  saveParagraph: () => void;
  onEditSave?: (editedContent: string) => void;
}

export const ParagraphDisplay: React.FC<ParagraphDisplayProps> = ({
  currentParagraph,
  isLoading,
  saveParagraph,
  onEditSave
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

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
            >
              <Save className="h-4 w-4 mr-2" />
              Save
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
  );
};
