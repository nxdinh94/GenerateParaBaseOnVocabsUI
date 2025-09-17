import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { VocabExplanations, ExplanationInParagraph } from '@/types/api';

interface VocabularyExplanationsProps {
  explainVocabs?: VocabExplanations;
  explanationInParagraph?: ExplanationInParagraph;
}

export const VocabularyExplanations: React.FC<VocabularyExplanationsProps> = ({
  explainVocabs,
  explanationInParagraph
}) => {
  if (!explainVocabs || Object.keys(explainVocabs).length === 0) {
    return null;
  }

  return (
    <Card className="p-6 mt-4">
      <h3 className="text-lg font-semibold mb-4">Vocabulary Explanations</h3>
      
      <div className="space-y-6">
        {Object.entries(explainVocabs).map(([vocab, meanings], index) => (
          <div key={vocab} className="space-y-3">
            {index > 0 && <Separator className="mb-4" />}
            
            {/* Vocabulary term */}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm font-semibold">
                {vocab}
              </Badge>
            </div>

            {/* Context explanation from paragraph */}
            {explanationInParagraph?.[vocab] && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-md">
                <p className="text-sm font-medium text-blue-800 mb-1">In this paragraph:</p>
                <p className="text-sm text-blue-700 italic">
                  {explanationInParagraph[vocab]}
                </p>
              </div>
            )}

            {/* General meanings and examples */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">General meanings:</p>
              {meanings.map((meaningObj, meaningIndex) => (
                <div key={meaningIndex} className="bg-gray-50 p-3 rounded-md border-l-2 border-gray-300">
                  <p className="text-sm text-gray-800 mb-2">
                    <span className="font-medium">{meaningIndex + 1}.</span> {meaningObj.meaning}
                  </p>
                  {meaningObj.example && (
                    <div className="bg-white p-2 rounded border">
                      <p className="text-xs text-gray-600 mb-1 font-medium">Example:</p>
                      <p className="text-sm text-gray-700" dangerouslySetInnerHTML={{ 
                        __html: meaningObj.example.replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-600">$1</strong>')
                      }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};