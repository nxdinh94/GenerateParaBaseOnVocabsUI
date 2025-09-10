// Utility functions for text formatting and highlighting
import React from 'react';

// Function to convert markdown-style formatting to JSX
export const formatTextWithHighlights = (text: string): React.ReactNode[] => {
  if (!text) return [];

  console.log('🎨 Formatting text:', text);
  
  // Simple approach: split by *** patterns only (since our API only produces ***)
  const parts = text.split(/(\*\*\*.*?\*\*\*)/g);
  
  console.log('📄 Split parts:', parts);
  
  return parts.map((part, index) => {
    // Check if this part is highlighted with ***
    if (part.startsWith('***') && part.endsWith('***')) {
      const highlightedText = part.slice(3, -3);
      console.log(`✨ Highlighting: "${highlightedText}"`);
      return (
        <span 
          key={index} 
          className="font-bold italic text-primary"
          style={{ fontWeight: 'bold', fontStyle: 'italic' }}
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
  return formattedText.replace(/\*{3}(.*?)\*{3}/g, '$1');
};

// Function to check if text contains highlighted vocabularies
export const hasHighlights = (text: string): boolean => {
  return /\*{3}.*?\*{3}/.test(text);
};
