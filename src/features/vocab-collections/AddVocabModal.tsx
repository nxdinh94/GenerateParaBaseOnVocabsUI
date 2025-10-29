import React, { useState, useRef, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AddVocabModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddVocabs: (vocabs: string[]) => Promise<void>;
  collectionName?: string;
}

export const AddVocabModal: React.FC<AddVocabModalProps> = ({
  open,
  onOpenChange,
  onAddVocabs,
  collectionName,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [vocabs, setVocabs] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setInputValue('');
      setVocabs([]);
      setIsSubmitting(false);
    }
  }, [open]);

  const addVocab = (vocab: string) => {
    const trimmedVocab = vocab.trim().toLowerCase();
    if (trimmedVocab && !vocabs.includes(trimmedVocab)) {
      setVocabs([...vocabs, trimmedVocab]);
    }
    setInputValue('');
  };

  const removeVocab = (index: number) => {
    setVocabs(vocabs.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addVocab(inputValue);
    } else if (e.key === ',' || e.key === ' ') {
      e.preventDefault();
      addVocab(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && vocabs.length > 0) {
      removeVocab(vocabs.length - 1);
    }
  };

  const handleSubmit = async () => {
    // Add current input value if exists
    if (inputValue.trim()) {
      addVocab(inputValue);
    }

    const finalVocabs = inputValue.trim() 
      ? [...vocabs, inputValue.trim().toLowerCase()] 
      : vocabs;

    if (finalVocabs.length === 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddVocabs(finalVocabs);
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding vocabularies:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Vocabularies</DialogTitle>
          <DialogDescription>
            {collectionName 
              ? `Add new vocabularies to "${collectionName}" collection`
              : 'Add new vocabularies to this collection'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-4">
            {/* Vocabulary Input */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Vocabularies
              </label>
              <div className="flex flex-wrap gap-2 p-2 border border-border rounded-md bg-background focus-within:ring-2 focus-within:ring-ring">
                {vocabs.map((vocab, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 h-7"
                  >
                    {vocab}
                    <button
                      onClick={() => removeVocab(index)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                      disabled={isSubmitting}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={vocabs.length === 0 ? "Type vocabulary and press Enter, Space, or Comma..." : ""}
                  className="flex-1 min-w-[120px] bg-transparent outline-none placeholder:text-muted-foreground text-sm text-left align-top"
                  disabled={isSubmitting}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Press Enter, Space, or Comma to add multiple vocabularies
              </p>
            </div>

            {/* Vocabulary Count */}
            {vocabs.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {vocabs.length} {vocabs.length === 1 ? 'vocabulary' : 'vocabularies'} ready to add
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={vocabs.length === 0 && !inputValue.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                Add 
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
