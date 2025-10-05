import React from 'react';
import { useNavigate } from 'react-router-dom';
import { VocabCollectionCard } from '@/features/vocab-collections';
import type { VocabCollection } from '@/services/vocabCollectionService';

const mockCollection: VocabCollection & { vocabCount: number } = {
  id: 'demo-collection-123',
  name: 'Business English',
  user_id: 'user-123',
  created_at: '2024-01-15T10:30:00Z',
  updated_at: '2024-01-15T10:30:00Z',
  status: true,
  vocabCount: 45
};

export const CollectionCardDemo: React.FC = () => {
  const navigate = useNavigate();

  const handleCollectionClick = (collection: VocabCollection) => {
    console.log('Navigating to collection:', collection.id);
    navigate(`/vocab-collections/${collection.id}/vocabs-list`);
  };

  return (
    <div className="p-4 max-w-md">
      <h3 className="text-lg font-bold mb-4">Collection Card Demo</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Click the card to navigate to vocabs list
      </p>
      <VocabCollectionCard 
        collection={mockCollection} 
        onClick={handleCollectionClick}
      />
      <p className="text-xs text-muted-foreground mt-2">
        Will navigate to: /vocab-collections/{mockCollection.id}/vocabs-list
      </p>
    </div>
  );
};