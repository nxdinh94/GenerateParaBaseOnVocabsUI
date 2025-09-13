import React, { useState, useEffect } from 'react';
import { HistoryPage } from './HistoryPage';
import { LocalStorageService } from '@/services/localStorageService';

interface GeneratedParagraph {
  id: string;
  content: string;
  vocabularies: string[];
  settings: any;
  timestamp: Date;
  saved: boolean;
}

export const HistoryPageWrapper: React.FC = () => {
  const [history, setHistory] = useState<GeneratedParagraph[]>([]);

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = LocalStorageService.getParagraphHistory();
    const formattedHistory = savedHistory.map(item => ({
      id: item.id,
      content: item.paragraph,
      vocabularies: item.vocabularies,
      settings: { language: 'english', length: 'short', level: 'beginner', topic: 'none', tone: 'none' },
      timestamp: new Date(item.createdAt),
      saved: false
    }));
    setHistory(formattedHistory);
  }, []);

  return (
    <HistoryPage history={history} />
  );
};