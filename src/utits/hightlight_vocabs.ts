// Token-based vocabulary highlighting - completely different approach
export interface Token {
  text: string;
  isVocab: boolean;
  originalVocab?: string;
}

export function highlightVocabularies(text: string, vocabularies: string[]): string {
  console.log('🚀 Starting token-based highlighting');
  console.log('📝 Input text:', text);
  console.log('📋 Vocabularies:', vocabularies);
  
  // Clean vocabularies
  const cleanVocabs = vocabularies
    .filter(v => v && v.trim())
    .map(v => v.trim().toLowerCase())
    .filter((v, i, arr) => arr.indexOf(v) === i); // Remove duplicates
  
  if (cleanVocabs.length === 0) {
    console.log('⚠️ No valid vocabularies to highlight');
    return text;
  }
  
  // Step 1: Tokenize the text (split by spaces and punctuation but keep delimiters)
  const tokens = tokenizeText(text);
  console.log('🔤 Tokens:', tokens.slice(0, 10), '...');
  
  // Step 2: Mark vocabulary tokens
  const markedTokens = markVocabularyTokens(tokens, cleanVocabs);
  console.log('✅ Marked tokens count:', markedTokens.filter(t => t.isVocab).length);
  
  // Step 3: Rebuild text with highlighting
  const result = rebuildTextWithHighlights(markedTokens);
  console.log('✨ Final result:', result);
  
  return result;
}

function tokenizeText(text: string): Token[] {
  // First, remove ALL existing markdown formatting
  const cleanText = text.replace(/\*+/g, '');
  
  // Split by word boundaries while keeping spaces and punctuation
  const regex = /(\w+|[^\w\s]|\s+)/g;
  const matches = cleanText.match(regex) || [];
  
  return matches.map(match => ({
    text: match,
    isVocab: false
  }));
}

function markVocabularyTokens(tokens: Token[], vocabularies: string[]): Token[] {
  return tokens.map(token => {
    // Only check word tokens (not spaces or punctuation)
    if (!/^\w+$/.test(token.text)) {
      return token;
    }
    
    // Token is already clean from tokenizeText step
    const lowerText = token.text.toLowerCase();
    
    // Check if this token matches any vocabulary
    for (const vocab of vocabularies) {
      if (lowerText === vocab) {
        console.log(`🎯 Found vocab match: "${token.text}" matches "${vocab}"`);
        return {
          text: token.text, // Preserve original case
          isVocab: true,
          originalVocab: vocab
        };
      }
    }
    
    return token;
  });
}

function rebuildTextWithHighlights(tokens: Token[]): string {
  return tokens.map(token => {
    if (token.isVocab) {
      return `***${token.text}***`;
    }
    return token.text;
  }).join('');
}