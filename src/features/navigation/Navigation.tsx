import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  BookOpen, 
  History, 
  Save, 
  Moon, 
  Sun, 
  LogIn, 
  User 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { LoginModal } from '@/components/LoginModal';
import { SignUpModal } from '@/components/SignUpModal';
import { ForgotPasswordModal } from '@/components/ForgotPasswordModal';
import { cn } from '@/lib/utils';

interface NavigationProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  currentPage: 'home' | 'history' | 'saved';
  setCurrentPage: (page: 'home' | 'history' | 'saved') => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (value: boolean) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  darkMode,
  setDarkMode,
  currentPage,
  setCurrentPage,
  isMobileMenuOpen,
  setIsMobileMenuOpen
}) => {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [signUpModalOpen, setSignUpModalOpen] = useState(false);
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLoginClick = () => {
    setLoginModalOpen(true);
  };

  const handleSwitchToSignup = () => {
    setLoginModalOpen(false);
    setSignUpModalOpen(true);
  };

  const handleSwitchToLogin = () => {
    setSignUpModalOpen(false);
    setLoginModalOpen(true);
  };

  const handleForgotPassword = () => {
    setLoginModalOpen(false);
    setForgotPasswordModalOpen(true);
  };

  const handleBackToLogin = () => {
    setForgotPasswordModalOpen(false);
    setLoginModalOpen(true);
  };

  const handleTermsClick = () => {
    setSignUpModalOpen(false);
    navigate('/terms');
  };

  const handlePrivacyClick = () => {
    setSignUpModalOpen(false);
    navigate('/privacy');
  };
  return (
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
            <Button variant="ghost" size="sm" onClick={handleLoginClick}>
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
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => {
                    handleLoginClick();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Authentication Modals */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSwitchToSignup={handleSwitchToSignup}
        onForgotPassword={handleForgotPassword}
      />
      
      <SignUpModal
        isOpen={signUpModalOpen}
        onClose={() => setSignUpModalOpen(false)}
        onSwitchToLogin={handleSwitchToLogin}
        onTermsClick={handleTermsClick}
        onPrivacyClick={handlePrivacyClick}
      />
      
      <ForgotPasswordModal
        isOpen={forgotPasswordModalOpen}
        onClose={() => setForgotPasswordModalOpen(false)}
        onBackToLogin={handleBackToLogin}
      />
    </nav>
  );
};
