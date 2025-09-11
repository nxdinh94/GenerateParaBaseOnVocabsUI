import React, { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onBackToLogin,
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement forgot password logic
    console.log('Reset password for:', email);
    setIsSubmitted(true);
  };

  const handleClose = () => {
    setIsSubmitted(false);
    setEmail('');
    onClose();
  };

  const handleResend = () => {
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle>Email đã được gửi!</DialogTitle>
            <DialogDescription>
              Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>Kiểm tra hộp thư đến (và cả thư mục spam) để tìm email từ chúng tôi.</p>
              <p className="mt-2">Liên kết đặt lại mật khẩu sẽ hết hạn sau 24 giờ.</p>
            </div>
            <div className="flex flex-col space-y-2">
              <Button onClick={handleResend} variant="outline" className="w-full">
                Gửi lại email
              </Button>
              <Button onClick={onBackToLogin} variant="ghost" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay về đăng nhập
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Quên mật khẩu?</DialogTitle>
          <DialogDescription className="text-center">
            Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="modal-forgot-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="modal-forgot-email"
                  type="email"
                  placeholder="nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Gửi hướng dẫn đặt lại
            </Button>
          </form>
          <Button onClick={onBackToLogin} variant="ghost" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay về đăng nhập
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
