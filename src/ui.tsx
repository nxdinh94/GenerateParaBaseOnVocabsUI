"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Menu, 
  X, 
  Settings, 
  History, 
  BookOpen, 
  User, 
  LogIn, 
  Moon, 
  Sun, 
  Copy, 
  Save, 
  Edit3, 
  Trash2, 
  Shuffle, 
  Globe,
  MessageCircle,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  Github,
  Twitter,
  Linkedin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { ParagraphController } from './controllers/paragraphController';

// Types
interface GeneratedParagraph {
  id: string;
  content: string;
  vocabularies: string[];
  settings: ParagraphSettings;
  timestamp: Date;
  saved: boolean;
}

interface ParagraphSettings {
  language: string;
  length: 'short' | 'medium' | 'long' | 'custom';
  customLength?: number;
  level: 'none' | 'beginner' | 'intermediate' | 'advanced';
  topic: string;
  customTopic?: string;
  tone: 'none' | 'friendly' | 'formal' | 'humorous' | 'storytelling' | 'academic';
}

// Tag Input Component
interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}

const TagInput: React.FC<TagInputProps> = ({ value, onChange, placeholder, suggestions = [] }) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (tag: string) => {
    if (tag.trim() && !value.includes(tag.trim())) {
      onChange([...value, tag.trim()]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const filteredSuggestions = suggestions.filter(
    s => s.toLowerCase().includes(inputValue.toLowerCase()) && !value.includes(s)
  );

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 p-3 border border-border rounded-md bg-background min-h-[42px] focus-within:ring-2 focus-within:ring-ring">
        {value.map((tag, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1">
            {tag}
            <button
              onClick={() => removeTag(index)}
              className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent outline-none placeholder:text-muted-foreground"
        />
      </div>
      
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-40 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => addTag(suggestion)}
              className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Main Component
const VocabularyLearningWebsite: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [vocabularies, setVocabularies] = useState<string[]>([]);
  const [currentParagraph, setCurrentParagraph] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [history, setHistory] = useState<GeneratedParagraph[]>([]);
  const [savedParagraphs, setSavedParagraphs] = useState<GeneratedParagraph[]>([]);
  const [currentPage, setCurrentPage] = useState<'home' | 'history' | 'saved'>('home');
  
  const [settings, setSettings] = useState<ParagraphSettings>({
    language: 'english',
    length: 'short',
    level: 'beginner',
    topic: 'none',
    tone: 'none'
  });

  const vocabularySuggestions = [
    'adventure', 'beautiful', 'challenge', 'discover', 'explore', 'fantastic',
    'journey', 'knowledge', 'learning', 'magnificent', 'opportunity', 'progress',
    'remarkable', 'success', 'wonderful', 'achievement', 'brilliant', 'creative'
  ];

  const languages = [
    { value: 'english', label: 'English' },
    { value: 'chinese', label: 'Chinese' },
    { value: 'japanese', label: 'Japanese' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'french', label: 'French' }
  ];

  const topics = [
    { value: 'none', label: 'None' },
    { value: 'daily-life', label: 'Daily Life' },
    { value: 'business', label: 'Business/Office' },
    { value: 'travel', label: 'Travel' },
    { value: 'academic', label: 'School/Academic' },
    { value: 'technology', label: 'Technology' },
    { value: 'custom', label: 'Custom' }
  ];

  const levels = [
    { value: 'none', label: 'None' },
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

  const generateParagraph = useCallback(async () => {
    if (vocabularies.length === 0) return;

    setIsLoading(true);
    
    try {
      // Call the API through the controller
      const response = await ParagraphController.generateParagraph(vocabularies, settings);
      
      console.log('API Response:', response);

      if (response.success && response.data) {
        const generatedContent = response.data.paragraph;
        
        const newParagraph: GeneratedParagraph = {
          id: Date.now().toString(),
          content: generatedContent,
          vocabularies: [...vocabularies],
          settings: { ...settings },
          timestamp: new Date(),
          saved: false
        };
        
        setCurrentParagraph(generatedContent);
        setHistory(prev => [newParagraph, ...prev]);
      } else {
        // Handle API error
        const errorMessage = response.error || 'Failed to generate paragraph';
        console.error('API Error:', errorMessage);
        
        // Show error in the paragraph field
        setCurrentParagraph(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Network Error:', error);
      setCurrentParagraph(`Network Error: ${error instanceof Error ? error.message : 'Failed to connect to server'}`);
    } finally {
      setIsLoading(false);
    }
  }, [vocabularies, settings]);

  const saveParagraph = () => {
    if (!currentParagraph) return;
    
    const paragraphToSave: GeneratedParagraph = {
      id: Date.now().toString(),
      content: currentParagraph,
      vocabularies: [...vocabularies],
      settings: { ...settings },
      timestamp: new Date(),
      saved: true
    };
    
    setSavedParagraphs(prev => [paragraphToSave, ...prev]);
  };

  const getRandomFromHistory = () => {
    if (history.length === 0) return;
    const randomParagraph = history[Math.floor(Math.random() * history.length)];
    setCurrentParagraph(randomParagraph.content);
    setVocabularies(randomParagraph.vocabularies);
    setSettings(randomParagraph.settings);
  };

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      generateParagraph();
    }
  }, [generateParagraph]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const renderNavigation = () => (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">VocabLearn</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => setCurrentPage('home')}
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                currentPage === 'home' ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              )}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentPage('history')}
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                currentPage === 'history' ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              )}
            >
              <History className="h-4 w-4 mr-2 inline" />
              History
            </button>
            <button
              onClick={() => setCurrentPage('saved')}
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                currentPage === 'saved' ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              )}
            >
              <Save className="h-4 w-4 mr-2 inline" />
              Saved
            </button>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm">
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile menu button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-4 mt-6">
                <Button
                  variant={currentPage === 'home' ? 'default' : 'ghost'}
                  onClick={() => {
                    setCurrentPage('home');
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  Home
                </Button>
                <Button
                  variant={currentPage === 'history' ? 'default' : 'ghost'}
                  onClick={() => {
                    setCurrentPage('history');
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  <History className="h-4 w-4 mr-2" />
                  History
                </Button>
                <Button
                  variant={currentPage === 'saved' ? 'default' : 'ghost'}
                  onClick={() => {
                    setCurrentPage('saved');
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Saved
                </Button>
                <Separator />
                <div className="flex items-center justify-between">
                  <span>Dark Mode</span>
                  <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                </div>
                <Button variant="outline" className="justify-start">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );

  const renderSettingsPanel = () => (
    <Card className="p-6 space-y-6">
      <h3 className="text-lg font-semibold">Settings</h3>
      
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
        </div>

        <div>
          <Label>Paragraph Length</Label>
          <div className="mt-2 space-y-2">
            {[
              { value: 'short', label: 'Short (<70 words)' },
              { value: 'medium', label: 'Medium (70-100 words)' },
              { value: 'long', label: 'Long (100-150 words)' },
              { value: 'custom', label: 'Custom' }
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
            <Input
              placeholder="Enter custom topic"
              value={settings.customTopic || ''}
              onChange={(e) => setSettings(prev => ({ ...prev, customTopic: e.target.value }))}
              className="mt-2"
            />
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

  const renderMainWorkspace = () => (
    <div className="space-y-6">
      {/* Vocabulary Input */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Enter Vocabularies</h2>
        <TagInput
          value={vocabularies}
          onChange={setVocabularies}
          placeholder="Type vocabularies and press Enter or comma..."
          suggestions={vocabularySuggestions}
        />
        <p className="text-sm text-muted-foreground mt-2">
          Press Ctrl+Enter to generate paragraph
        </p>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={generateParagraph}
          disabled={vocabularies.length === 0 || isLoading}
          className="flex-1 sm:flex-none"
        >
          {isLoading ? 'Generating...' : 'Generate Paragraph'}
        </Button>
        <Button
          variant="outline"
          onClick={getRandomFromHistory}
          disabled={history.length === 0}
        >
          <Shuffle className="h-4 w-4 mr-2" />
          Random from History
        </Button>
      </div>

      {/* Result Area */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Generated Paragraph</h3>
          {currentParagraph && !isLoading && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(!isEditing);
                  setEditContent(currentParagraph);
                }}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={saveParagraph}
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(currentParagraph)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          )}
        </div>

        <div className="min-h-[200px] border border-border rounded-md p-4 bg-muted/50">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[150px]"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setCurrentParagraph(editContent);
                    setIsEditing(false);
                  }}
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : currentParagraph ? (
            <p className="text-foreground leading-relaxed">{currentParagraph}</p>
          ) : (
            <p className="text-muted-foreground italic">
              Enter some vocabularies and click "Generate Paragraph" to get started.
            </p>
          )}
        </div>
      </Card>
    </div>
  );

  const renderHistoryPage = () => (
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
                    onClick={() => navigator.clipboard.writeText(item.content)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newSaved = { ...item, saved: true, id: Date.now().toString() };
                      setSavedParagraphs(prev => [newSaved, ...prev]);
                    }}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {item.timestamp.toLocaleDateString()} • {item.settings.language} • {item.settings.level}
              </p>
              <p className="text-foreground">{item.content}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderSavedPage = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Saved Paragraphs</h2>
      {savedParagraphs.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No saved paragraphs yet. Save some from your generated content.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {savedParagraphs.map((item) => (
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
                    onClick={() => navigator.clipboard.writeText(item.content)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSavedParagraphs(prev => prev.filter(p => p.id !== item.id));
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Saved on {item.timestamp.toLocaleDateString()} • {item.settings.language} • {item.settings.level}
              </p>
              <p className="text-foreground">{item.content}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderHeroSection = () => (
    <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Master Vocabulary with
            <span className="text-primary"> AI-Generated</span> Paragraphs
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Transform your vocabulary learning experience. Input words, get contextual paragraphs, 
            and accelerate your language mastery with intelligent content generation.
          </p>
          <Button size="lg" className="mr-4">
            Get Started Free
          </Button>
          <Button variant="outline" size="lg">
            Watch Demo
          </Button>
        </motion.div>
      </div>
    </section>
  );

  const renderFeaturesSection = () => (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-xl text-muted-foreground">Everything you need to enhance your vocabulary learning</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <Globe className="h-8 w-8 text-primary" />,
              title: "Multi-Language Support",
              description: "Generate paragraphs in English, Chinese, Japanese, Spanish, and French"
            },
            {
              icon: <Settings className="h-8 w-8 text-primary" />,
              title: "Customizable Settings",
              description: "Adjust length, difficulty level, topic, and tone to match your learning needs"
            },
            {
              icon: <History className="h-8 w-8 text-primary" />,
              title: "Learning History",
              description: "Track your progress and revisit previously generated content"
            },
            {
              icon: <Save className="h-8 w-8 text-primary" />,
              title: "Save & Organize",
              description: "Save your favorite paragraphs and organize them for future reference"
            },
            {
              icon: <MessageCircle className="h-8 w-8 text-primary" />,
              title: "Context-Aware",
              description: "AI generates meaningful paragraphs that use your vocabularies naturally"
            },
            {
              icon: <BookOpen className="h-8 w-8 text-primary" />,
              title: "Learning Levels",
              description: "Content adapted for beginner, intermediate, and advanced learners"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="p-6 h-full">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );

  const renderFAQSection = () => (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-muted-foreground">Get answers to common questions about VocabLearn</p>
        </div>
        
        <div className="max-w-3xl mx-auto space-y-4">
          {[
            {
              question: "How does the vocabulary paragraph generator work?",
              answer: "Simply input your target vocabularies, select your preferences for language, difficulty level, topic, and tone. Our AI will generate a coherent paragraph that naturally incorporates all your words in context."
            },
            {
              question: "What languages are supported?",
              answer: "Currently, we support English, Chinese, Japanese, Spanish, and French. We're continuously working to add more languages based on user demand."
            },
            {
              question: "Can I save and organize my generated content?",
              answer: "Yes! You can save your favorite paragraphs, view your generation history, and organize your content for future reference and study."
            },
            {
              question: "Is there a limit to how many vocabularies I can input?",
              answer: "While there's no strict limit, we recommend 5-15 vocabularies per paragraph for optimal coherence and readability."
            },
            {
              question: "How do the difficulty levels work?",
              answer: "Beginner level uses simpler sentence structures and common words, Intermediate adds complexity, and Advanced uses sophisticated vocabulary and complex grammatical structures."
            }
          ].map((faq, index) => (
            <Card key={index} className="p-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <HelpCircle className="h-5 w-5 mr-2 text-primary" />
                {faq.question}
              </h3>
              <p className="text-muted-foreground">{faq.answer}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );

  const renderContactSection = () => (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Get in Touch</h2>
          <p className="text-xl text-muted-foreground">Have questions or feedback? We'd love to hear from you</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Mail className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-muted-foreground">support@vocablearn.com</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Phone className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold">Phone</h3>
                <p className="text-muted-foreground">+1 (555) 123-4567</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <MapPin className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold">Address</h3>
                <p className="text-muted-foreground">123 Learning St, Education City, EC 12345</p>
              </div>
            </div>
            <div className="flex space-x-4 pt-4">
              <Button variant="outline" size="icon">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Github className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Linkedin className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Send us a message</h3>
            <form className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Your name" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="your@email.com" />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Your message..." rows={4} />
              </div>
              <Button className="w-full">Send Message</Button>
            </form>
          </Card>
        </div>
      </div>
    </section>
  );

  const renderFooter = () => (
    <footer className="bg-background border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">VocabLearn</span>
            </div>
            <p className="text-muted-foreground">
              Empowering language learners with AI-generated vocabulary content.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Features</a></li>
              <li><a href="#" className="hover:text-foreground">Pricing</a></li>
              <li><a href="#" className="hover:text-foreground">API</a></li>
              <li><a href="#" className="hover:text-foreground">Documentation</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">About</a></li>
              <li><a href="#" className="hover:text-foreground">Blog</a></li>
              <li><a href="#" className="hover:text-foreground">Careers</a></li>
              <li><a href="#" className="hover:text-foreground">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Help Center</a></li>
              <li><a href="#" className="hover:text-foreground">Community</a></li>
              <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <Separator className="my-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground">
            © 2024 VocabLearn. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Button variant="ghost" size="icon">
              <Twitter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Github className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Linkedin className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );

  return (
    <div className={cn("min-h-screen bg-background", darkMode && "dark")}>
      {renderNavigation()}
      
      {currentPage === 'home' && (
        <>
          {renderHeroSection()}
          
          <div className="container mx-auto px-4 py-12">
            <div className="grid lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                {renderMainWorkspace()}
              </div>
              <div className="lg:col-span-1">
                {renderSettingsPanel()}
              </div>
            </div>
          </div>
          
          {renderFeaturesSection()}
          {renderFAQSection()}
          {renderContactSection()}
        </>
      )}
      
      {currentPage === 'history' && (
        <div className="container mx-auto px-4 py-12">
          {renderHistoryPage()}
        </div>
      )}
      
      {currentPage === 'saved' && (
        <div className="container mx-auto px-4 py-12">
          {renderSavedPage()}
        </div>
      )}
      
      {renderFooter()}
    </div>
  );
};

export default VocabularyLearningWebsite;
