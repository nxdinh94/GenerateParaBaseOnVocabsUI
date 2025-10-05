import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { VocabsListPage } from '@/features/vocab-collections';

export const VocabsListTest: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="p-4">
        <h2 className="text-lg font-bold mb-4">Vocabs List Test</h2>
        <p className="text-sm text-muted-foreground mb-4">
          This component tests the VocabsListPage with a mock collection ID.
        </p>
        <VocabsListPage />
      </div>
    </BrowserRouter>
  );
};