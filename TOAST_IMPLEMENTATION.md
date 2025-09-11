# Toast Notification System

## Overview
The application now includes a modern toast notification system using Radix UI for providing user feedback on actions like saving and deleting paragraphs.

## Features
- ✅ Success notifications with green styling and checkmark icon
- ❌ Error notifications with red styling and X icon  
- ℹ️ Info notifications with blue styling and info icon
- 🚀 Auto-dismiss after 5 seconds
- 📱 Responsive design that works on mobile and desktop
- 🌙 Dark mode support
- 🎨 Beautiful animations and transitions

## Usage

### Basic Toast
```typescript
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

// Success toast
toast({
  variant: "success",
  title: "Success!",
  description: "Operation completed successfully.",
});

// Error toast  
toast({
  variant: "destructive",
  title: "Error!",
  description: "Something went wrong.",
});

// Default/Info toast
toast({
  title: "Info",
  description: "Here's some information.",
});
```

## Implementation Details

### Components
- `Toast` - Base toast component with variants
- `ToastProvider` - Context provider for toast state
- `ToastViewport` - Container for positioning toasts
- `Toaster` - Main component that renders all toasts

### Hook
- `useToast()` - Hook for triggering toasts and managing state

### Files Added
- `src/components/ui/toast.tsx` - Toast UI components
- `src/components/ui/toaster.tsx` - Toast container and renderer
- `src/hooks/use-toast.ts` - Toast state management hook

## Current Usage in App

### Save Paragraph Success
```typescript
toast({
  variant: "success", 
  title: "Lưu thành công!",
  description: "Đoạn văn đã được lưu vào danh sách yêu thích.",
});
```

### Delete Paragraph Success
```typescript
toast({
  variant: "success",
  title: "Xóa thành công!", 
  description: "Đoạn văn đã được xóa khỏi danh sách yêu thích.",
});
```

### Generate Paragraph Success  
```typescript
toast({
  variant: "success",
  title: "Tạo thành công!",
  description: "Đoạn văn đã được tạo với từ vựng của bạn.",
});
```

### Error Handling
```typescript
toast({
  variant: "destructive", 
  title: "Lỗi mạng",
  description: "Không thể kết nối đến server.",
});
```

## Configuration

### Timeout
- Default: 5 seconds auto-dismiss
- Can be customized in `use-toast.ts`

### Position
- Default: Top-right on desktop, bottom on mobile
- Configured in `ToastViewport` component

### Styling
- Uses Tailwind CSS classes
- Supports light/dark mode
- Includes smooth animations via `tailwindcss-animate`

## Benefits
- 🎯 Better UX than browser alerts
- 🎨 Consistent with app design
- 📱 Mobile-friendly  
- ♿ Accessible (Radix UI)
- 🔧 Highly customizable
- 🚀 Performant and lightweight
