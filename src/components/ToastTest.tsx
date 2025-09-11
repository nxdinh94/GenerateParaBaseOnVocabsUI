// Test Toast Component
import React from 'react';
import { useToast } from '../hooks/use-toast';

export const ToastTest: React.FC = () => {
  const { toast } = useToast();

  const showSuccessToast = () => {
    toast({
      variant: "success",
      title: "Test Success!",
      description: "This is a success toast message.",
    });
  };

  const showErrorToast = () => {
    toast({
      variant: "destructive",
      title: "Test Error!",
      description: "This is an error toast message.",
    });
  };

  const showDefaultToast = () => {
    toast({
      title: "Test Default!",
      description: "This is a default toast message.",
    });
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">Toast Test</h2>
      <div className="space-x-2">
        <button
          onClick={showSuccessToast}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Success Toast
        </button>
        <button
          onClick={showErrorToast}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Error Toast
        </button>
        <button
          onClick={showDefaultToast}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Default Toast
        </button>
      </div>
    </div>
  );
};
