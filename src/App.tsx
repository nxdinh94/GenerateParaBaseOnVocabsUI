import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VocabularyLearningWebsite from './VocabularyLearningWebsite';
import { LoginPage, SignUpPage, ForgotPasswordPage, TermsPage, PrivacyPage } from './features/auth';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Main App Route - Default Homepage */}
        <Route path="/" element={<VocabularyLearningWebsite />} />
        
        {/* Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        
        {/* Legal Pages */}
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        
        {/* Catch all route - redirect to home */}
        <Route path="*" element={<VocabularyLearningWebsite />} />
      </Routes>
    </Router>
  );
};

export default App;
