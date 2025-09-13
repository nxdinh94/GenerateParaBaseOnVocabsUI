import React from 'react';
import { Copy, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatTextWithHighlights, extractPlainText, hasHighlights } from '@/lib/textFormatter';

interface GeneratedParagraph {
  id: string;
  content: string;
  vocabularies: string[];
  settings: any;
  timestamp: Date;
  saved: boolean;
}

interface HistoryPageProps {
  history: GeneratedParagraph[];
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ history }) => {
  const handleCopy = (content: string) => {
    const plainText = hasHighlights(content) 
      ? extractPlainText(content) 
      : content;
    navigator.clipboard.writeText(plainText);
  };

  const handleSave = (_item: GeneratedParagraph) => {
    // TODO: Implement save to grouped paragraphs
    console.log('Save to grouped paragraphs not implemented yet');
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">History</h2>
      {history.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No history yet. Generate some paragraphs to see them here.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {history.map((item) => (
            <Card key={item.id} className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex flex-wrap gap-2">
                  {item.vocabularies.map((vocab, index) => (
                    <Badge key={index} variant="secondary">{vocab}</Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(item.content)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSave(item)}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {item.timestamp.toLocaleDateString()} • {item.settings.language} • {item.settings.level}
              </p>
              <div className="text-foreground">{formatTextWithHighlights(item.content)}</div>
            </Card>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};
