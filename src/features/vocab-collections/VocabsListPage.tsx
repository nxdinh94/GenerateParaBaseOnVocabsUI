import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { VocabSuggestionsService } from '@/services/vocabSuggestionsService';
import { VocabCollectionService } from '@/services/vocabCollectionService';
import { learnedVocabService } from '@/services/learnedVocabService';
import { AddVocabModal } from './AddVocabModal';
import { useToast } from '@/hooks/use-toast';
import type { VocabFrequency } from '@/types/api';
import type { VocabCollection } from '@/services/vocabCollectionService';

export const VocabsListPage: React.FC = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [vocabs, setVocabs] = useState<VocabFrequency[]>([]);
  const [collection, setCollection] = useState<VocabCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVocabs, setFilteredVocabs] = useState<VocabFrequency[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    if (collectionId) {
      fetchVocabsAndCollection();
    }
  }, [collectionId]);

  useEffect(() => {
    // Filter vocabs based on search term
    if (searchTerm.trim()) {
      const filtered = vocabs.filter(vocabItem =>
        vocabItem.vocab.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredVocabs(filtered);
    } else {
      setFilteredVocabs(vocabs);
    }
  }, [vocabs, searchTerm]);

  const fetchVocabsAndCollection = async () => {
    if (!collectionId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch vocabs and collection info in parallel
      const [vocabsResponse, collectionsResponse] = await Promise.all([
        VocabSuggestionsService.getVocabsByCollection(collectionId),
        VocabCollectionService.getVocabCollections()
      ]);

      // Handle vocabs response
      if (vocabsResponse.success && vocabsResponse.data) {
        setVocabs(vocabsResponse.data.frequencyData);
      } else {
        setError('Failed to fetch vocabularies');
      }

      // Handle collection info
      if (collectionsResponse.success && collectionsResponse.data) {
        const foundCollection = collectionsResponse.data.find(c => c.id === collectionId);
        setCollection(foundCollection || null);
      }
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching vocabs and collection:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/vocab-collections');
  };

  const handleAddVocabs = async (newVocabs: string[]) => {
    if (!collectionId) return;

    try {
      console.log('📚 Calling /learned-vocabs API with:', { vocabs: newVocabs, collection_id: collectionId });
      
      const response = await learnedVocabService.markVocabulariesAsLearned(
        newVocabs,
        collectionId
      );

      if (response.success) {
        toast({
          title: "Success",
          description: `Added ${newVocabs.length} ${newVocabs.length === 1 ? 'vocabulary' : 'vocabularies'} successfully`,
        });
        
        // Refresh the vocabs list
        await fetchVocabsAndCollection();
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to add vocabularies",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('❌ Error calling /learned-vocabs API:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={handleBack} className="mb-4 px-0">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Collections
          </Button>
          <div className="h-8 bg-muted rounded w-64 animate-pulse mb-2"></div>
          <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
        </div>

        <div className="mb-6">
          <div className="h-10 bg-muted rounded animate-pulse"></div>
        </div>

        <div className="space-y-3">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="h-12 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={handleBack} className="mb-6 px-0">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Collections
        </Button>
        
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Error Loading Vocabularies</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={fetchVocabsAndCollection}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={handleBack} className="mb-4 px-0">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Collections
        </Button>
        
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-foreground">
            {collection?.name || 'Collection Vocabularies'}
          </h1>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Vocabulary
          </Button>
        </div>
        <p className="text-muted-foreground">
          {filteredVocabs.length} vocabularies
          {searchTerm && ` (filtered from ${vocabs.length} total)`}
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          {/* hide search if no vocabularies are present */}
          {filteredVocabs.length > 0 && (
            <>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search vocabularies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </>
          )}
        </div>
      </div>

      {/* Vocabularies List */}
      {filteredVocabs.length === 0 ? (
        <div className="text-center py-12">
          {searchTerm ? (
            <>
              <div className="text-muted-foreground mb-4">
                <Search className="mx-auto h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No Results Found</h3>
              <p className="text-muted-foreground mb-4">
                No vocabularies match your search "{searchTerm}"
              </p>
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                Clear Search
              </Button>
            </>
          ) : (
            <>
              <div className="text-muted-foreground mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No Vocabularies Found</h3>
              <p className="text-muted-foreground">
                This collection doesn't have any vocabularies yet.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredVocabs.map((vocabItem, index) => (
            <div
              key={`${vocabItem.id}-${index}`}
              className="flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="font-medium text-foreground">{vocabItem.vocab}</span>
                {vocabItem.frequency > 1 && (
                  <Badge variant="secondary" className="text-xs">
                    {vocabItem.frequency}x
                  </Badge>
                )}
              </div>
              
              {/* Optional: Add actions like edit, delete, or view details */}
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="text-xs">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Vocabulary Modal */}
      <AddVocabModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onAddVocabs={handleAddVocabs}
        collectionName={collection?.name}
      />
    </div>
  );
};