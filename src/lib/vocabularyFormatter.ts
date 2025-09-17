import type { VocabExplanations, ExplanationInParagraph } from '@/types/api';

/**
 * Formats vocabulary explanations into readable text format
 */
export function formatVocabularyExplanations(
  paragraph: string,
  explainVocabs?: VocabExplanations,
  explanationInParagraph?: ExplanationInParagraph
): string {
  if (!explainVocabs || Object.keys(explainVocabs).length === 0) {
    return paragraph;
  }

  let formattedText = paragraph + '\n\n';
  formattedText += '═══════════════════════════════════════════════════════════════\n';
  formattedText += '                    VOCABULARY EXPLANATIONS\n';
  formattedText += '═══════════════════════════════════════════════════════════════\n\n';

  Object.entries(explainVocabs).forEach(([vocab, meanings], index) => {
    // Add separator between vocabulary entries
    if (index > 0) {
      formattedText += '\n───────────────────────────────────────────────────────────────\n\n';
    }

    // Vocabulary term
    formattedText += `📚 ${vocab.toUpperCase()}\n`;
    formattedText += '═'.repeat(vocab.length + 4) + '\n\n';

    // Context explanation from paragraph
    if (explanationInParagraph?.[vocab]) {
      formattedText += '🔍 IN THIS PARAGRAPH:\n';
      formattedText += `   ${explanationInParagraph[vocab]}\n\n`;
    }

    // General meanings and examples
    formattedText += '📖 GENERAL MEANINGS:\n\n';
    meanings.forEach((meaningObj, meaningIndex) => {
      formattedText += `   ${meaningIndex + 1}. ${meaningObj.meaning}\n\n`;
      
      // Clean up the example by removing markdown formatting
      if (meaningObj.example) {
        const cleanExample = meaningObj.example.replace(/\*\*(.*?)\*\*/g, '$1');
        formattedText += `      💡 Example: ${cleanExample}\n\n`;
      }
    });
  });

  return formattedText;
}

/**
 * Strips markdown formatting from text for plain text display
 */
export function stripMarkdownFormatting(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove bold markdown
    .replace(/\*(.*?)\*/g, '$1')      // Remove italic markdown
    .replace(/__(.*?)__/g, '$1')      // Remove underline markdown
    .replace(/_(.*?)_/g, '$1');       // Remove italic underscore markdown
}