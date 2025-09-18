import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LoginModal } from '@/components/LoginModal';
import { SignUpModal } from '@/components/SignUpModal';
import { ForgotPasswordModal } from '@/components/ForgotPasswordModal';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, refreshAuth } = useAuth();
  
  // Modal states
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [signUpModalOpen, setSignUpModalOpen] = useState(false);
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      // User is logged in, navigate to paragraph page
      navigate('/paragraph');
    } else {
      // User is not logged in, show login modal
      setLoginModalOpen(true);
    }
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
    // After successful login, navigate to paragraph page
    navigate('/paragraph');
  };

  return (
    <>
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
    </>
  );
};
