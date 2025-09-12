import React, { useState, useRef, useEffect } from 'react';
import { LogOut, User } from 'lucide-react';

interface UserDropdownProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  onLogout: () => void;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getUserDisplayName = () => {
    if (!user?.name) return 'User';
    
    // If name is too long, truncate it
    if (user.name.length > 15) {
      return user.name.substring(0, 15) + '...';
    }
    return user.name;
  };

  const getInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Avatar/Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-accent transition-colors"
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
            {getInitials()}
          </div>
        )}
        <span className="hidden sm:block text-sm font-medium">
          {getUserDisplayName()}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-md shadow-lg z-50">
          <div className="py-1">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            
            {/* Profile Option */}
            <button
              className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
              onClick={() => {
                setIsOpen(false);
                // TODO: Navigate to profile page
              }}
            >
              <User className="w-4 h-4 mr-3" />
              Hồ sơ cá nhân
            </button>
            
            {/* Logout Option */}
            <button
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
};