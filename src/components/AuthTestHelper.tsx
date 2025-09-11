import React from 'react';
import { Button } from '@/components/ui/button';

interface AuthTestHelperProps {
  isAuthenticated: boolean;
  toggleAuth: () => void;
}

export const AuthTestHelper: React.FC<AuthTestHelperProps> = ({ isAuthenticated, toggleAuth }) => {
  return (
    <div className="fixed top-4 right-4 z-50 bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg border border-yellow-300 dark:border-yellow-700">
      <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
        Dev Helper - Auth Status: {isAuthenticated ? 'Logged In' : 'Logged Out'}
      </div>
      <Button 
        onClick={toggleAuth}
        size="sm"
        variant="outline"
        className="text-xs"
      >
        {isAuthenticated ? 'Logout' : 'Login'} (Test)
      </Button>
    </div>
  );
};
