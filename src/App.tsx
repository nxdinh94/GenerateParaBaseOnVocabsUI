import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import VocabularyLearningWebsite from './VocabularyLearningWebsite';
import { LoginPage, SignUpPage, ForgotPasswordPage, TermsPage, PrivacyPage } from './features/auth';
import { HistoryPageWrapper } from './features/history';
import { SavedPageWrapper } from './features/saved';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Main App Route - Default Homepage with Layout */}
        <Route path="/" element={<Layout><VocabularyLearningWebsite /></Layout>} />
        
        {/* Authentication Routes - No Layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        
        {/* Legal Pages with Layout */}
        <Route path="/terms" element={<Layout><TermsPage /></Layout>} />
        <Route path="/privacy" element={<Layout><PrivacyPage /></Layout>} />
        
        {/* User Feature Pages with Layout */}
        <Route path="/history" element={<Layout><HistoryPageWrapper /></Layout>} />
        <Route path="/saved" element={<Layout><SavedPageWrapper /></Layout>} />
        
        {/* Catch all route - redirect to home with Layout */}
        <Route path="*" element={<Layout><VocabularyLearningWebsite /></Layout>} />
      </Routes>
    </Router>
  );
};

export default App;
