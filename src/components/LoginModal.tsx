import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useGoogleLogin } from '@react-oauth/google';
import { UserApiService } from '@/services/userApiService';
import { useToast } from '@/hooks/use-toast';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
  onForgotPassword: () => void;
  onLoginSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSwitchToSignup,
  onForgotPassword,
  onLoginSuccess,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // TODO: Implement actual email/password login API call
      // For now, simulate successful login for demonstration
      console.log('Login attempt:', formData);
      
      // When actual API is implemented, uncomment this:
      // const result = await UserApiService.emailLogin({
      //   email: formData.email,
      //   password: formData.password,
      //   rememberMe: formData.rememberMe
      // });
      // 
      // UserApiService.storeAuthTokens(result);
      // 
      // const currentUser = UserApiService.getCurrentUserFromToken();
      // const userName = currentUser?.name || 'bạn';
      // 
      // toast({
      //   title: "Đăng nhập thành công",
      //   description: `Chào mừng ${userName}!`,
      // });
      
      // Call success callback to refresh auth state and redirect
      onLoginSuccess?.();
      
      onClose();
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Lỗi đăng nhập",
        description: "Email hoặc mật khẩu không đúng. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      setIsLoading(true);
      try {
        console.log('Google OAuth Code Response:', codeResponse);
        
        // Call your API with the authorization code
        const result = await UserApiService.googleLogin({
          authorization_code: codeResponse.code
        });

        // Store all tokens from the response
        UserApiService.storeAuthTokens(result);
        
        // Get user info from JWT token for a personalized message
        const currentUser = UserApiService.getCurrentUserFromToken();
        const userName = currentUser?.name || 'bạn';
        
        toast({
          title: "Đăng nhập thành công",
          description: `Chào mừng ${userName}!`,
        });
        
        // Call success callback to refresh auth state
        onLoginSuccess?.();
        
        onClose();
      } catch (error) {
        console.error('Google login error:', error);
        toast({
          title: "Lỗi đăng nhập",
          description: "Không thể đăng nhập với Google. Vui lòng thử lại.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google login failed:', error);
      toast({
        title: "Lỗi xác thực",
        description: "Không thể kết nối với Google. Vui lòng thử lại.",
        variant: "destructive",
      });
    },
    flow: 'auth-code',
    redirect_uri: import.meta.env.GOOGLE_REDIRECT_URI
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Đăng nhập</DialogTitle>
          <DialogDescription className="text-center">
            Nhập thông tin để truy cập tài khoản của bạn
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="modal-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="modal-email"
                  name="email"
                  type="email"
                  placeholder="nhập email của bạn"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                  autoFocus={false}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="modal-password">Mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="modal-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="nhập mật khẩu"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10"
                  required
                  autoFocus={false}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  id="modal-remember"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="modal-remember" className="text-sm">
                  Ghi nhớ đăng nhập
                </Label>
              </div>
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm text-primary hover:text-primary/80 hover:underline"
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Login Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Hoặc tiếp tục với
              </span>
            </div>
          </div>

          {/* Google Login Button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => handleGoogleLogin()}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            {isLoading ? 'Đang xử lý...' : 'Đăng nhập với Google'}
          </Button>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-muted-foreground">
            Chưa có tài khoản?{' '}
            <button
              onClick={onSwitchToSignup}
              className="text-primary hover:text-primary/80 hover:underline font-medium"
            >
              Đăng ký ngay
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
