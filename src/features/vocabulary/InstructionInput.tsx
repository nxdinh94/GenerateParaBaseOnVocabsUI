import React, { useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';

interface InstructionInputProps {
  value: string;
  onChange: (instruction: string) => void;
  placeholder?: string;
}

export const InstructionInput: React.FC<InstructionInputProps> = ({ 
  value, 
  onChange, 
  placeholder = "Example: This vocabs means..."
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Allow Ctrl+Enter to trigger paragraph generation (handled by parent)
    if (e.ctrlKey && e.key === 'Enter') {
      // Let the event bubble up to be handled by the global handler
      return;
    }
  };

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="min-h-[80px] resize-vertical focus-visible:ring-2 focus-visible:ring-ring"
        rows={3}
      />
    </div>
  );
};