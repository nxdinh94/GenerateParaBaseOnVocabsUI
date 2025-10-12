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
import fireIcon from '@/assets/noto_fire.svg';
import deactivatedFireIcon from '@/assets/noto_deactivate_fire.svg';
import coinIcon from '@/assets/coin.svg';

interface NavigationProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (value: boolean) => void;
  streakCount?: number;
  isStreakQualified?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  darkMode,
  setDarkMode,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  streakCount = 0,
  isStreakQualified = false
}) => {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [signUpModalOpen, setSignUpModalOpen] = useState(false);
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const [isStreakAnimating, setIsStreakAnimating] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, refreshAuth } = useAuth();

  // Trigger animation when streak count changes
  React.useEffect(() => {
    if (streakCount > 0) {
      setIsStreakAnimating(true);
      const timer = setTimeout(() => setIsStreakAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [streakCount, isStreakQualified]);

  // Determine fire icon based on streak status
  const currentFireIcon = (streakCount >= 5 && isStreakQualified) ? fireIcon : deactivatedFireIcon;

  // Generate dynamic border gradient based on streak count
  const getStreakBorderGradient = () => {
    const activeColor = '#FF9800'; // Orange color for active streaks
    const inactiveColor = 'rgb(209, 213, 219)'; // Gray-300 for inactive
    
    // If all 4 parts should be highlighted (count >= 5 and qualified)
    if (streakCount >= 5 && isStreakQualified) {
      return `
        linear-gradient(white, white) padding-box,
        conic-gradient(
          from 0deg,
          ${activeColor} 0deg 85deg,
          transparent 85deg 95deg,
          ${activeColor} 95deg 175deg,
          transparent 175deg 185deg,
          ${activeColor} 185deg 265deg,
          transparent 265deg 275deg,
          ${activeColor} 275deg 355deg,
          transparent 355deg 360deg
        ) border-box
      `;
    }
    
    // Calculate which parts should be active based on count (1-4)
    const activeParts = Math.min(Math.max(streakCount, 0), 4);
    
    // Each part represents approximately 90 degrees (360/4)
    // Part 1: 0-85deg, Part 2: 95-175deg, Part 3: 185-265deg, Part 4: 275-355deg
    const parts = [
      { start: 0, end: 85 },
      { start: 95, end: 175 },
      { start: 185, end: 265 },
      { start: 275, end: 355 }
    ];
    
    let gradientStops = 'from 0deg,';
    
    parts.forEach((part, index) => {
      const color = index < activeParts ? activeColor : inactiveColor;
      gradientStops += `
        ${color} ${part.start}deg ${part.end}deg,
        transparent ${part.end}deg ${part.end + 10}deg${index < parts.length - 1 ? ',' : ''}
      `;
    });
    
    return `
      linear-gradient(white, white) padding-box,
      conic-gradient(${gradientStops}) border-box
    `;
  };

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
    // Redirect to paragraph page after login
    navigate('/paragraph');
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Note: Page will be refreshed by logout function, but navigate to home as fallback
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate to home if logout fails
      navigate('/');
    }
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
            {/* Streak and Coins Container */}
            <div className="flex items-center border border-border rounded-full overflow-visible group hover:bg-accent transition-colors">
              {/* Fire Icon Button */}
              <button 
                className={`p-2 transition-all duration-500 border-r border-border relative ${
                  isStreakAnimating ? 'animate-pulse scale-110' : ''
                }`}
                style={{
                  borderRightStyle: 'dashed',
                  borderRadius: '50%',
                  background: getStreakBorderGradient(),
                  border: '3px solid transparent',
                  transition: 'transform 0.5s ease-in-out, background 0.8s ease-in-out'
                }}
              >
                <img 
                  src={currentFireIcon} 
                  alt="Streak" 
                  className={`h-5 w-5 transition-all duration-500 ${
                    isStreakAnimating ? 'scale-125' : ''
                  }`}
                />
              </button>
              
              {/* Coin Button */}
              <button className="flex items-center gap-2 px-3 py-2 transition-colors rounded-r-full">
                <img src={coinIcon} alt="Coins" className="h-5 w-5" />
                <span className="text-sm font-medium">100 coins</span>
              </button>
            </div>

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
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => {
                    navigate('/paragraph');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Generate Paragraph
                </Button>
                
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
                      onClick={async () => {
                        await handleLogout();
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
