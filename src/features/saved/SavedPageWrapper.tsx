import React, { useState, useEffect, useCallback } from 'react';
import { SavedPage } from './SavedPage';
import { paragraphController } from '@/controllers/paragraphController';
import { mapApiGroupArrayToUI, type GroupedParagraphs } from '@/lib/dataMappers';
import { useToast } from '@/hooks/use-toast';

export const SavedPageWrapper: React.FC = () => {
  const [groupedParagraphs, setGroupedParagraphs] = useState<GroupedParagraphs[]>([]);
  const [isLoadingSavedParagraphs, setIsLoadingSavedParagraphs] = useState(false);
  const [savedParagraphsError, setSavedParagraphsError] = useState<string | null>(null);
  const { toast } = useToast();

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
    <div className="container mx-auto px-4 py-12">
      <SavedPage
        groupedParagraphs={groupedParagraphs}
        isLoadingSavedParagraphs={isLoadingSavedParagraphs}
        savedParagraphsError={savedParagraphsError}
        loadSavedParagraphs={loadSavedParagraphs}
        deleteSavedParagraph={deleteSavedParagraph}
      />
    </div>
  );
};