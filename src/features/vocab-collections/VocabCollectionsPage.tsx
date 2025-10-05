import React, { useState, useEffect } from 'react';
import { VocabCollectionCard } from './VocabCollectionCard';
import { VocabCollectionService } from '@/services/vocabCollectionService';
import type { VocabCollection } from '@/services/vocabCollectionService';

interface VocabCollectionWithCount extends VocabCollection {
  vocabCount: number;
}

export const VocabCollectionsPage: React.FC = () => {
  const [collections, setCollections] = useState<VocabCollectionWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await VocabCollectionService.getVocabCollectionsWithCounts();
      
      if (response.success && response.data) {
        setCollections(response.data);
      } else {
        setError(response.error || 'Failed to fetch collections');
      }
    } catch (err) {
      setError('Failed to fetch collections');
      console.error('Error fetching collections:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCollectionClick = (collection: VocabCollection) => {
    // TODO: Navigate to collection detail page or perform other actions
    console.log('Clicked collection:', collection);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Vocabulary Collections</h1>
          <p className="text-muted-foreground">Manage your vocabulary collections</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Loading skeletons */}
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-32 bg-muted rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Vocabulary Collections</h1>
          <p className="text-muted-foreground">Manage your vocabulary collections</p>
        </div>
        
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Error Loading Collections</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={fetchCollections}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Vocabulary Collections</h1>
          <p className="text-muted-foreground">Manage your vocabulary collections</p>
        </div>
        
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No Collections Found</h3>
          <p className="text-muted-foreground mb-4">
            You don't have any vocabulary collections yet.
          </p>
          <button
            onClick={() => {
              // TODO: Navigate to create collection page
              console.log('Create new collection');
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Create Your First Collection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Vocabulary Collections</h1>
        <p className="text-muted-foreground">
          You have {collections.length} collection{collections.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      {/* Collections Grid - Max 4 items per row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {collections.map((collection) => (
          <VocabCollectionCard
            key={collection.id}
            collection={collection}
            onClick={handleCollectionClick}
          />
        ))}
      </div>

      {/* Add New Collection Button */}
      <div className="mt-8 text-center">
        <button
          onClick={() => {
            // TODO: Navigate to create collection page
            console.log('Create new collection');
          }}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Collection
        </button>
      </div>
    </div>
  );
};