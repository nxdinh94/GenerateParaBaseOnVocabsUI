import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/paragraph');
  };

  return (
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
          <Button size="lg" className="mr-4" onClick={handleGetStarted}>
            Get Started Free
          </Button>
          <Button variant="outline" size="lg">
            Watch Demo
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
