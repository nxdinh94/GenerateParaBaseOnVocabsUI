import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { VocabCollection } from '@/services/vocabCollectionService';

interface VocabCollectionCardProps {
  collection: VocabCollection & { vocabCount?: number };
  onClick?: (collection: VocabCollection) => void;
}

export const VocabCollectionCard: React.FC<VocabCollectionCardProps> = ({ 
  collection, 
  onClick 
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(collection);
    }
  };

  const formatCreatedAt = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <Card 
      className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${
        collection.status ? 'border-primary/20 hover:border-primary/40' : 'border-muted opacity-75'
      }`}
      onClick={handleClick}
    >
      <div className="space-y-3">
        {/* Collection Name */}
        <div className="flex items-start justify-between">
          <h3 className="font-medium text-foreground line-clamp-2 text-sm">
            {collection.name}
          </h3>
          {!collection.status && (
            <Badge variant="secondary" className="ml-2 text-xs">
              Inactive
            </Badge>
          )}
        </div>
        
        {/* Vocab Count */}
        <div className="text-muted-foreground text-xs">
          <span className="font-medium">
            {collection.vocabCount !== undefined 
              ? `${collection.vocabCount} vocabularies`
              : 'Loading...'
            }
          </span>
        </div>
        
        {/* Created Date */}
        <div className="text-muted-foreground text-xs">
          Created: {formatCreatedAt(collection.created_at)}
        </div>
      </div>
    </Card>
  );
};