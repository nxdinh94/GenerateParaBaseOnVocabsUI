import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navigation } from '@/features/navigation/Navigation';
import { Footer } from '@/features/layout/Footer';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { StreakService } from '@/services/streakService';
import { useAuth } from '@/hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [isStreakQualified, setIsStreakQualified] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Fetch streak status when entering /paragraph route
  useEffect(() => {
    const fetchStreakStatus = async () => {
      // Only fetch if user is authenticated and on paragraph route
      if (isAuthenticated && location.pathname === '/paragraph') {
        try {
          const streakData = await StreakService.getTodayStreakStatus();
          console.log('✅ Streak data fetched:', streakData);
          setStreakCount(streakData.count);
          setIsStreakQualified(streakData.is_qualify);
        } catch (error) {
          console.error('❌ Failed to fetch streak status:', error);
          // On error, reset to defaults
          setStreakCount(0);
          setIsStreakQualified(false);
        }
      }
    };

    fetchStreakStatus();
  }, [location.pathname, isAuthenticated]);

  return (
    <div className={cn("min-h-screen bg-background", darkMode && "dark")}>
      <Navigation
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        streakCount={streakCount}
        isStreakQualified={isStreakQualified}
      />
      
      <main className="flex-1">
        {children}
      </main>
      
      <Footer />
      <Toaster />
    </div>
  );
};