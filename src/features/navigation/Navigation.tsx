import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  BookOpen, 
  Moon, 
  Sun, 
  LogIn,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { LoginModal } from '@/components/LoginModal';
import { SignUpModal } from '@/components/SignUpModal';
import { ForgotPasswordModal } from '@/components/ForgotPasswordModal';
import { UserDropdown } from '@/components/UserDropdown';
import { useAuth } from '@/hooks/useAuth';

interface NavigationProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (value: boolean) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  darkMode,
  setDarkMode,
  isMobileMenuOpen,
  setIsMobileMenuOpen
}) => {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [signUpModalOpen, setSignUpModalOpen] = useState(false);
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, refreshAuth } = useAuth();

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

  const handleLoginSuccess = () => {
    refreshAuth();
  };

  const handleLogout = () => {
    logout();
    // Note: Page will be refreshed by logout function, but navigate to home as fallback
    navigate('/');
  };

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button 
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">VocabLearn</span>
          </button>

          {/* Right side */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            
            {isAuthenticated && user ? (
              <UserDropdown user={user} onLogout={handleLogout} />
            ) : (
              <Button variant="ghost" size="sm" onClick={handleLoginClick}>
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            )}
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
                <div className="flex items-center justify-between">
                  <span>Dark Mode</span>
                  <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                </div>
                
                {isAuthenticated && user ? (
                  <>
                    <Separator />
                    <div className="flex items-center space-x-3 px-3 py-2">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                          {user.name?.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase() || 'U'}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="justify-start text-red-600"
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Đăng xuất
                    </Button>
                  </>
                ) : (
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
                )}
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
        onLoginSuccess={handleLoginSuccess}
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
