import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical, Trash2 } from 'lucide-react';
import type { VocabCollection } from '@/services/vocabCollectionService';

interface VocabCollectionCardProps {
  collection: VocabCollection & { vocabCount?: number };
  onClick?: (collection: VocabCollection) => void;
  onDelete?: (collectionId: string) => void;
}

export const VocabCollectionCard: React.FC<VocabCollectionCardProps> = ({ 
  collection, 
  onClick,
  onDelete
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleClick = () => {
    if (onClick && !showMenu) {
      onClick(collection);
    }
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onDelete) {
      onDelete(collection.id);
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
      className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] relative ${
        collection.status ? 'border-primary/20 hover:border-primary/40' : 'border-muted opacity-75'
      }`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowMenu(false);
      }}
    >
      {/* 3-dots menu button */}
      {isHovered && (
        <div className="absolute top-2 right-2 z-10">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-muted"
            onClick={handleMenuClick}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
          
          {/* Dropdown menu */}
          {showMenu && (
            <div className="absolute right-0 mt-1 w-32 bg-background border rounded-md shadow-lg">
              <button
                onClick={handleDeleteClick}
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        {/* Collection Name */}
        <div className="flex items-start justify-between">
          <h3 className="font-medium text-foreground line-clamp-2 text-sm pr-8">
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