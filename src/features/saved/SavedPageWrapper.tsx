import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SavedPage } from './SavedPage';
import { paragraphController } from '@/controllers/paragraphController';
import { mapApiGroupArrayToUI, type GroupedParagraphs } from '@/lib/dataMappers';
import { useToast } from '@/hooks/use-toast';

export const SavedPageWrapper: React.FC = () => {
  const [groupedParagraphs, setGroupedParagraphs] = useState<GroupedParagraphs[]>([]);
  const [isLoadingSavedParagraphs, setIsLoadingSavedParagraphs] = useState(false);
  const [savedParagraphsError, setSavedParagraphsError] = useState<string | null>(null);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchType, setSearchType] = useState<'all' | 'vocabs' | 'content'>('all');
  
  const { toast } = useToast();

  // Search filtering logic
  const filteredGroupedParagraphs = useMemo(() => {
    if (!searchTerm.trim()) {
      return groupedParagraphs;
    }

    const lowercaseSearchTerm = searchTerm.toLowerCase();

    return groupedParagraphs.filter((group) => {
      switch (searchType) {
        case 'vocabs':
          return group.vocabularies.some(vocab => 
            vocab.toLowerCase().includes(lowercaseSearchTerm)
          );
        case 'content':
          return group.paragraphs.some(paragraph => 
            paragraph.toLowerCase().includes(lowercaseSearchTerm)
          );
        case 'all':
        default:
          return (
            group.vocabularies.some(vocab => 
              vocab.toLowerCase().includes(lowercaseSearchTerm)
            ) ||
            group.paragraphs.some(paragraph => 
              paragraph.toLowerCase().includes(lowercaseSearchTerm)
            )
          );
      }
    });
  }, [groupedParagraphs, searchTerm, searchType]);

  const loadSavedParagraphs = useCallback(async () => {
    setIsLoadingSavedParagraphs(true);
    setSavedParagraphsError(null);
    
    try {
      const response = await paragraphController.getSavedParagraphs();
      if (response.success && response.data) {
        const mappedData = mapApiGroupArrayToUI(response.data);
        setGroupedParagraphs(mappedData);
      } else {
        setSavedParagraphsError(response.error || 'Failed to load saved paragraphs');
      }
    } catch (error) {
      console.error('Error loading saved paragraphs:', error);
      setSavedParagraphsError('Failed to load saved paragraphs');
    } finally {
      setIsLoadingSavedParagraphs(false);
    }
  }, []);

  const deleteSavedParagraph = useCallback(async (id: string) => {
    try {
      const response = await paragraphController.deleteSavedParagraph(id);
      if (response.success) {
        setGroupedParagraphs(prev => prev.filter(group => group.id !== id));
        toast({
          title: "Success",
          description: "Saved paragraph group deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to delete saved paragraph group",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting saved paragraph:', error);
      toast({
        title: "Error",
        description: "Failed to delete saved paragraph group",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    loadSavedParagraphs();
  }, [loadSavedParagraphs]);

  return (
    <SavedPage
      groupedParagraphs={filteredGroupedParagraphs}
      isLoadingSavedParagraphs={isLoadingSavedParagraphs}
      savedParagraphsError={savedParagraphsError}
      loadSavedParagraphs={loadSavedParagraphs}
      deleteSavedParagraph={deleteSavedParagraph}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      searchType={searchType}
      setSearchType={setSearchType}
      totalResults={groupedParagraphs.length}
      filteredResults={filteredGroupedParagraphs.length}
    />
  );
};