// Utility functions for text formatting and highlighting
import React from 'react';

// Function to convert markdown-style formatting to JSX
export const formatTextWithHighlights = (text: string): React.ReactNode[] => {
  if (!text) return [];

  console.log('🎨 TextFormatter: Input text:', text);
  console.log('🔍 TextFormatter: Contains ** patterns:', /\*{2}.*?\*{2}/.test(text));
  console.log('🔍 TextFormatter: Contains *** patterns:', /\*{3}.*?\*{3}/.test(text));
  
  // Updated approach: handle both ** and *** patterns
  // First split by *** patterns, then split by ** patterns
  const parts = text.split(/(\*\*\*.*?\*\*\*|\*\*.*?\*\*)/g);
  
  console.log('📄 TextFormatter: Split parts:', parts);
  
  return parts.map((part, index) => {
    // Check if this part is highlighted with *** (3 asterisks)
    if (part.startsWith('***') && part.endsWith('***')) {
      const highlightedText = part.slice(3, -3);
      console.log(`✨ TextFormatter: Highlighting (***): "${highlightedText}"`);
      return (
        <span 
          key={index} 
          className="font-bold italic text-primary bg-yellow-100 px-1 rounded"
          style={{ fontWeight: 'bold', fontStyle: 'italic', backgroundColor: '#fef3c7', padding: '2px 4px', borderRadius: '4px' }}
        >
          {highlightedText}
        </span>
      );
    }
    
    // Check if this part is highlighted with ** (2 asterisks)
    if (part.startsWith('**') && part.endsWith('**')) {
      const highlightedText = part.slice(2, -2);
      console.log(`✨ TextFormatter: Highlighting (**): "${highlightedText}"`);
      return (
        <span 
          key={index} 
          className="font-bold italic text-primary bg-yellow-100 px-1 rounded"
          style={{ fontWeight: 'bold', fontStyle: 'italic', backgroundColor: '#fef3c7', padding: '2px 4px', borderRadius: '4px' }}
        >
          {highlightedText}
        </span>
      );
    }
    
    // Regular text part
    return part || '';
  }).filter(part => part !== ''); // Remove empty parts
};

// Function to extract plain text from formatted text (for copy operations)
export const extractPlainText = (formattedText: string): string => {
  // Remove both *** and ** patterns
  return formattedText
    .replace(/\*{3}(.*?)\*{3}/g, '$1')  // Remove *** patterns
    .replace(/\*{2}(.*?)\*{2}/g, '$1'); // Remove ** patterns
};

// Function to check if text contains highlighted vocabularies
export const hasHighlights = (text: string): boolean => {
  // Check for both *** and ** patterns
  return /\*{3}.*?\*{3}/.test(text) || /\*{2}.*?\*{2}/.test(text);
};
