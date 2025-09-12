import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { LocalStorageService } from '@/services/localStorageService';

interface ParagraphSettings {
  language: string;
  length: 'short' | 'medium' | 'long' | 'custom';
  customLength?: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  topic: string;
  customTopic?: string;
  customLanguage?: string;
  tone: 'none' | 'friendly' | 'formal' | 'humorous' | 'storytelling' | 'academic';
}

interface SettingsPanelProps {
  settings: ParagraphSettings;
  setSettings: React.Dispatch<React.SetStateAction<ParagraphSettings>>;
  savedCustomLength: number;
  setSavedCustomLength: (value: number) => void;
  customTopics: string[];
  setCustomTopics: React.Dispatch<React.SetStateAction<string[]>>;
  customLanguages: string[];
  setCustomLanguages: React.Dispatch<React.SetStateAction<string[]>>;
  resetSettings: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  setSettings,
  savedCustomLength,
  setSavedCustomLength,
  customTopics,
  setCustomTopics,
  customLanguages,
  setCustomLanguages,
  resetSettings
}) => {
  // Dynamic languages list including default + custom languages
  const languages = [
    { value: 'english', label: 'English' },
    { value: 'chinese', label: 'Chinese' },
    { value: 'japanese', label: 'Japanese' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'french', label: 'French' },
    ...customLanguages.map(lang => ({ value: lang.toLowerCase(), label: lang })),
    { value: 'custom', label: 'Custom' }
  ];

  // Dynamic topics list including default + custom topics
  const topics = [
    { value: 'none', label: 'None' },
    { value: 'daily-life', label: 'Daily Life' },
    { value: 'business', label: 'Business/Office' },
    { value: 'travel', label: 'Travel' },
    { value: 'academic', label: 'School/Academic' },
    { value: 'technology', label: 'Technology' },
    ...customTopics.map(topic => ({ value: topic, label: topic })),
    { value: 'custom', label: 'Custom' }
  ];

  const levels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const tones = [
    { value: 'none', label: 'None' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'formal', label: 'Formal' },
    { value: 'humorous', label: 'Humorous' },
    { value: 'storytelling', label: 'Storytelling' },
    { value: 'academic', label: 'Academic' }
  ];

  return (
    <Card className="p-6 space-y-6">
      
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Settings</h3>
        <Button
            variant="outline"
            size="sm"
            onClick={resetSettings}
            className="text-xs p-2"
            title="Reset to Defaults"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
          </Button>
      </div>
      <div className="space-y-4">
        <div>
          <Label htmlFor="language">Language</Label>
          <select
            id="language"
            value={settings.language}
            onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
            className="w-full mt-1 p-2 border border-border rounded-md bg-background"
          >
            {languages.map(lang => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
          {settings.language === 'custom' && (
            <div>
              <Input
                placeholder="Enter custom language"
                value={settings.customLanguage || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, customLanguage: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && settings.customLanguage && settings.customLanguage.trim()) {
                    const newLanguage = settings.customLanguage.trim();
                    // Capitalize first letter
                    const formattedLanguage = newLanguage.charAt(0).toUpperCase() + newLanguage.slice(1).toLowerCase();
                    
                    // Save to localStorage
                    LocalStorageService.addCustomLanguage(newLanguage);
                    // Update local state to reflect in dropdown immediately
                    setCustomLanguages(prev => {
                      const exists = prev.some(l => l.toLowerCase() === formattedLanguage.toLowerCase());
                      if (!exists) {
                        return [...prev, formattedLanguage];
                      }
                      return prev;
                    });
                    // Set the new language as selected and clear custom input
                    setSettings(prev => ({ 
                      ...prev, 
                      language: formattedLanguage.toLowerCase(), 
                      customLanguage: '' 
                    }));
                    console.log(`💾 Custom language saved and selected: ${formattedLanguage}`);
                  }
                }}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Press Enter to save custom language to dropdown
              </p>
            </div>
          )}
        </div>

        <div>
          <Label>Paragraph Length</Label>
          <div className="mt-2 space-y-2">
            {[
              { value: 'short', label: 'Short (<70 words)' },
              { value: 'medium', label: 'Medium (70-100 words)' },
              { value: 'long', label: 'Long (100-150 words)' },
              { value: 'custom', label: `Custom (${savedCustomLength})` }
            ].map(option => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  value={option.value}
                  checked={settings.length === option.value}
                  onChange={(e) => setSettings(prev => ({ ...prev, length: e.target.value as any }))}
                  className="text-primary"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
          {settings.length === 'custom' && (
            <Input
              type="number"
              placeholder="Number of words"
              value={settings.customLength || ''}
              onChange={(e) => setSettings(prev => ({ ...prev, customLength: parseInt(e.target.value) }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && settings.customLength) {
                  // Save the custom length to localStorage and update display
                  setSavedCustomLength(settings.customLength);
                  LocalStorageService.updateSetting('customLength', settings.customLength);
                  console.log(`💾 Custom length saved: ${settings.customLength}`);
                }
              }}
              className="mt-2"
            />
          )}
        </div>

        <div>
          <Label htmlFor="level">Level</Label>
          <select
            id="level"
            value={settings.level}
            onChange={(e) => setSettings(prev => ({ ...prev, level: e.target.value as any }))}
            className="w-full mt-1 p-2 border border-border rounded-md bg-background"
          >
            {levels.map(level => (
              <option key={level.value} value={level.value}>{level.label}</option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="topic">Topic</Label>
          <select
            id="topic"
            value={settings.topic}
            onChange={(e) => setSettings(prev => ({ ...prev, topic: e.target.value }))}
            className="w-full mt-1 p-2 border border-border rounded-md bg-background"
          >
            {topics.map(topic => (
              <option key={topic.value} value={topic.value}>{topic.label}</option>
            ))}
          </select>
          {settings.topic === 'custom' && (
            <div>
              <Input
                placeholder="Enter custom topic"
                value={settings.customTopic || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, customTopic: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && settings.customTopic && settings.customTopic.trim()) {
                    const newTopic = settings.customTopic.trim();
                    // Capitalize first letter
                    const formattedTopic = newTopic.charAt(0).toUpperCase() + newTopic.slice(1).toLowerCase();
                    
                    // Save to localStorage
                    LocalStorageService.addCustomTopic(newTopic);
                    // Update local state to reflect in dropdown immediately
                    setCustomTopics(prev => {
                      const exists = prev.some(t => t.toLowerCase() === formattedTopic.toLowerCase());
                      if (!exists) {
                        return [...prev, formattedTopic];
                      }
                      return prev;
                    });
                    // Set the new topic as selected and clear custom input
                    setSettings(prev => ({ 
                      ...prev, 
                      topic: formattedTopic, 
                      customTopic: '' 
                    }));
                    console.log(`💾 Custom topic saved and selected: ${formattedTopic}`);
                  }
                }}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Press Enter to save custom topic to dropdown
              </p>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="tone">Tone</Label>
          <select
            id="tone"
            value={settings.tone}
            onChange={(e) => setSettings(prev => ({ ...prev, tone: e.target.value as any }))}
            className="w-full mt-1 p-2 border border-border rounded-md bg-background"
          >
            {tones.map(tone => (
              <option key={tone.value} value={tone.value}>{tone.label}</option>
            ))}
          </select>
        </div>
      </div>
    </Card>
  );
};
