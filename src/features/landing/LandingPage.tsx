import React from 'react';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { FAQSection } from './FAQSection';
import { ContactSection } from './ContactSection';

export const LandingPage: React.FC = () => {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <FAQSection />
      <ContactSection />
    </>
  );
};