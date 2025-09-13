import React, { useState } from 'react';
import { Navigation } from '@/features/navigation/Navigation';
import { Footer } from '@/features/layout/Footer';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className={cn("min-h-screen bg-background", darkMode && "dark")}>
      <Navigation
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      
      <main className="flex-1">
        {children}
      </main>
      
      <Footer />
      <Toaster />
    </div>
  );
};