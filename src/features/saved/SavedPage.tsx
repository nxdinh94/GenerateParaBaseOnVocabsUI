import React from 'react';
import { Copy, Trash, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { formatTextWithHighlights } from '@/lib/textFormatter';
import { highlightVocabularies } from '@/utits/hightlight_vocabs';
import { type GroupedParagraphs } from '@/lib/dataMappers';

interface SavedPageProps {
  groupedParagraphs: GroupedParagraphs[];
  isLoadingSavedParagraphs: boolean;
  savedParagraphsError: string | null;
  loadSavedParagraphs: () => void;
  deleteSavedParagraph: (id: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchType: 'all' | 'vocabs' | 'content';
  setSearchType: (type: 'all' | 'vocabs' | 'content') => void;
  totalResults: number;
  filteredResults: number;
}

export const SavedPage: React.FC<SavedPageProps> = ({
  groupedParagraphs,
  isLoadingSavedParagraphs,
  savedParagraphsError,
  loadSavedParagraphs,
  deleteSavedParagraph,
  searchTerm,
  setSearchTerm,
  searchType,
  setSearchType,
  totalResults,
  filteredResults
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

  // Function to highlight search terms in text
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 text-yellow-900 rounded">$1</mark>');
  };

  return (
    <div className="container mx-auto px-4 py-12">
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

      {/* Search UI */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by vocabulary words or paragraph content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Search in:</span>
            <Select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as 'all' | 'vocabs' | 'content')}
              className="w-32"
            >
              <option value="all">All</option>
              <option value="vocabs">Vocabularies</option>
              <option value="content">Content</option>
            </Select>
          </div>
        </div>
        {searchTerm && (
          <div className="mt-3 text-sm text-muted-foreground">
            Showing {filteredResults} of {totalResults} paragraph groups
            {filteredResults !== totalResults && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm('')}
                className="ml-2 h-auto p-1 text-xs underline"
              >
                Clear search
              </Button>
            )}
          </div>
        )}
      </Card>

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
      {!isLoadingSavedParagraphs && !savedParagraphsError && totalResults === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No saved paragraphs yet. Save some from your generated content.</p>
        </Card>
      )}

      {/* No search results */}
      {!isLoadingSavedParagraphs && !savedParagraphsError && totalResults > 0 && filteredResults === 0 && searchTerm && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            No paragraphs found matching "{searchTerm}".
          </p>
          <Button
            variant="outline"
            onClick={() => setSearchTerm('')}
            className="mt-2"
          >
            Clear search
          </Button>
        </Card>
      )}

      {/* Grouped Content */}
      {!isLoadingSavedParagraphs && !savedParagraphsError && filteredResults > 0 && (
        <div className="grid gap-6">
          {groupedParagraphs.map((group) => (
            <Card key={group.id} className="p-6 border-2">
              {/* Group Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {group.vocabularies.map((vocab, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className={`text-sm ${
                          searchTerm && searchType !== 'content' && vocab.toLowerCase().includes(searchTerm.toLowerCase())
                            ? 'bg-yellow-200 text-yellow-900 border-yellow-400'
                            : ''
                        }`}
                      >
                        {vocab}
                      </Badge>
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
                      <div 
                        dangerouslySetInnerHTML={{
                          __html: formatTextWithHighlights(
                            highlightSearchTerm(
                              highlightVocabularies(paragraph, group.vocabularies),
                              searchTerm
                            )
                          )
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};
