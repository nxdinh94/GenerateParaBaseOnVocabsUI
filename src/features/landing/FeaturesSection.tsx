import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Settings, History, Save, MessageCircle, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';

export const FeaturesSection: React.FC = () => {
  const features = [
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
  ];

  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-xl text-muted-foreground">Everything you need to enhance your vocabulary learning</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
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
};
