import React from 'react';
import { VocabCollectionsPage } from '@/features/vocab-collections';

export const VocabCollectionsTest: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Vocab Collections Test</h2>
      <VocabCollectionsPage />
    </div>
  );
};