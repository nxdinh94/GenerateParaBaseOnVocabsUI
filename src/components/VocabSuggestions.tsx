import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, TrendingUp, Plus } from 'lucide-react';
import { VocabSuggestionsService } from '../services/vocabSuggestionsService';
import { vocabRefreshEventEmitter } from '../utils/vocabRefreshEvents';
import type { VocabFrequency } from '../types/api';
import { UserApiService } from '@/services/userApiService';

interface VocabSuggestionsProps {
  onAddVocab: (vocab: string) => void;
  selectedVocabs: string[];
}

export const VocabSuggestions: React.FC<VocabSuggestionsProps> = ({
  onAddVocab,
  selectedVocabs
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vocabData, setVocabData] = useState<{
    totalDocuments: number;
    frequencyData: VocabFrequency[];
    message: string;
  } | null>(null);
  const [showAll, setShowAll] = useState(false);

  const fetchVocabSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      
      const response = await VocabSuggestionsService.getUniqueVocabs();
      
      if (response.success && response.data) {
        setVocabData(response.data);
        console.log('✅ Vocab suggestions loaded:', response.data);
      } else {
        setError(response.error || 'Failed to load vocabulary suggestions');
        console.error('❌ Failed to load vocab suggestions:', response.error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      console.error('❌ Error loading vocab suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // check if authenticated before fetching
    if (UserApiService.isAuthenticated()) {
      fetchVocabSuggestions();
      return;
    }
  }, []);

  // Listen for vocab refresh events
  useEffect(() => {
    const unsubscribe = vocabRefreshEventEmitter.subscribe(() => {
      console.log('🔄 VocabSuggestions: Received refresh event, checking authentication');
      // Only refresh if user is authenticated
      if (UserApiService.isAuthenticated()) {
        console.log('🔄 VocabSuggestions: User authenticated, reloading data');
        fetchVocabSuggestions();
      } else {
        console.log('⚠️ VocabSuggestions: User not authenticated, skipping refresh');
      }
    });

    return unsubscribe;
  }, []);

  const handleAddVocab = (vocab: string) => {
    if (!selectedVocabs.includes(vocab)) {
      onAddVocab(vocab);
    }
  };

  const displayLimit = showAll ? vocabData?.frequencyData.length : 20;
  const displayedVocabs = vocabData?.frequencyData.slice(0, displayLimit) || [];

  const getFrequencyColor = (frequency: number, maxFrequency: number) => {
    const ratio = frequency / maxFrequency;
    if (ratio >= 0.8) return 'bg-red-100 text-red-800 border-red-200';
    if (ratio >= 0.6) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (ratio >= 0.4) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (ratio >= 0.2) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const maxFrequency = vocabData?.frequencyData[0]?.frequency || 1;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Vocabulary Suggestions</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchVocabSuggestions}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      {vocabData && !isLoading && (
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">{vocabData.totalDocuments}</span> unique vocabularies found
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {vocabData.message}
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchVocabSuggestions}
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20" />
            ))}
          </div>
        </div>
      )}

      {/* Vocabulary List */}
      {!isLoading && vocabData && displayedVocabs.length > 0 && (
        <div className="space-y-4">
          {/* Frequency Legend */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Frequency:</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
              <span>High</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-100 border border-orange-200 rounded"></div>
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
              <span>Low</span>
            </div>
          </div>

          {/* Vocabulary Grid */}
          <div className="flex flex-wrap gap-2">
            {displayedVocabs.map((item) => {
              const isSelected = selectedVocabs.includes(item.vocab);
              const frequencyColorClass = getFrequencyColor(item.frequency, maxFrequency);
              
              return (
                <div
                  key={item.vocab}
                  className="flex items-center gap-1"
                >
                  <Badge
                    variant={isSelected ? "default" : "secondary"}
                    className={`cursor-pointer transition-all hover:scale-105 ${
                      !isSelected ? frequencyColorClass : ''
                    } ${isSelected ? 'bg-primary text-primary-foreground' : ''}`}
                    onClick={() => handleAddVocab(item.vocab)}
                  >
                    <span>{item.vocab}</span>
                    <span className="ml-1 text-xs opacity-70">({item.frequency})</span>
                    {!isSelected && (
                      <Plus className="h-3 w-3 ml-1 opacity-70" />
                    )}
                  </Badge>
                </div>
              );
            })}
          </div>

          {/* Show More/Less Button */}
          {vocabData.frequencyData.length > 20 && (
            <div className="text-center">
              <Separator className="my-4" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll 
                  ? `Show Less (${vocabData.frequencyData.length - 20} hidden)` 
                  : `Show All ${vocabData.frequencyData.length} Vocabularies`
                }
              </Button>
            </div>
          )}

          {/* Usage Tip */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <span className="font-medium">Tip:</span> Click on any vocabulary to add it to your list. 
              Higher frequency numbers indicate more commonly used words in generated paragraphs.
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && vocabData && displayedVocabs.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No vocabulary suggestions available</p>
        </div>
      )}

      {/* Unauthenticated State */}
      {!isLoading && !error && !vocabData && !UserApiService.isAuthenticated() && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Please log in to view vocabulary suggestions</p>
        </div>
      )}
    </Card>
  );
};
