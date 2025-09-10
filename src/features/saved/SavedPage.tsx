import React from 'react';
import { Copy, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTextWithHighlights } from '@/lib/textFormatter';
import { highlightVocabularies } from '@/utits/hightlight_vocabs';
import { type GroupedParagraphs } from '@/lib/dataMappers';

interface SavedPageProps {
  groupedParagraphs: GroupedParagraphs[];
  isLoadingSavedParagraphs: boolean;
  savedParagraphsError: string | null;
  loadSavedParagraphs: () => void;
  deleteSavedParagraph: (id: string) => void;
}

export const SavedPage: React.FC<SavedPageProps> = ({
  groupedParagraphs,
  isLoadingSavedParagraphs,
  savedParagraphsError,
  loadSavedParagraphs,
  deleteSavedParagraph
}) => {
  const handleCopyAll = (paragraphs: string[]) => {
    const allText = paragraphs.join('\n\n');
    navigator.clipboard.writeText(allText);
  };

  const handleCopySingle = (paragraph: string) => {
    navigator.clipboard.writeText(paragraph);
  };

  const handleDelete = (id: string, totalParagraphs: number) => {
    if (window.confirm(`Are you sure you want to delete this group with ${totalParagraphs} paragraph(s)?`)) {
      deleteSavedParagraph(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Saved Paragraphs</h2>
        <Button
          variant="outline"
          onClick={loadSavedParagraphs}
          disabled={isLoadingSavedParagraphs}
        >
          {isLoadingSavedParagraphs ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {/* Error state */}
      {savedParagraphsError && (
        <Card className="p-4 border-destructive bg-destructive/10">
          <p className="text-destructive">
            Error loading saved paragraphs: {savedParagraphsError}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={loadSavedParagraphs}
            className="mt-2"
          >
            Try Again
          </Button>
        </Card>
      )}

      {/* Loading state */}
      {isLoadingSavedParagraphs && (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="space-y-3">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoadingSavedParagraphs && !savedParagraphsError && groupedParagraphs.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No saved paragraphs yet. Save some from your generated content.</p>
        </Card>
      )}

      {/* Grouped Content */}
      {!isLoadingSavedParagraphs && !savedParagraphsError && groupedParagraphs.length > 0 && (
        <div className="grid gap-6">
          {groupedParagraphs.map((group) => (
            <Card key={group.id} className="p-6 border-2">
              {/* Group Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {group.vocabularies.map((vocab, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">{vocab}</Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {group.totalParagraphs} paragraph{group.totalParagraphs > 1 ? 's' : ''} with these vocabularies
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyAll(group.paragraphs)}
                    title="Copy all paragraphs"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(group.id, group.totalParagraphs)}
                    title="Delete entire group"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Individual Paragraphs */}
              <div className="space-y-4">
                {group.paragraphs.map((paragraph, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Paragraph {index + 1}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopySingle(paragraph)}
                        title="Copy this paragraph"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      {formatTextWithHighlights(highlightVocabularies(paragraph, group.vocabularies))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
