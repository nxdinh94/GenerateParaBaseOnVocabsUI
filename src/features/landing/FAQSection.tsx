import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

export const FAQSection: React.FC = () => {
  const faqs = [
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
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-muted-foreground">Get answers to common questions about VocabLearn</p>
        </div>
        
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
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
};
