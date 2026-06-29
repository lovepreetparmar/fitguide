import React from 'react';
import { View, type ViewProps } from 'react-native';
import { cn } from '@/utils/cn';
import { usePlatform, BREAKPOINTS } from '@/hooks/usePlatform';

interface WebContainerProps extends ViewProps {
  maxWidth?: 'content' | 'wide' | 'full';
}

const maxWidthClasses = {
  content: 'max-w-5xl',
  wide: 'max-w-7xl',
  full: 'max-w-full',
};

export function WebContainer({
  children,
  maxWidth = 'wide',
  className,
  ...props
}: WebContainerProps) {
  const { isWeb } = usePlatform();

  return (
    <View
      className={cn(
        'w-full',
        isWeb && 'mx-auto px-4 md:px-6 lg:px-8',
        isWeb && maxWidthClasses[maxWidth],
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
}

export function ScreenContent({
  children,
  className,
  ...props
}: ViewProps) {
  const { isWeb } = usePlatform();

  return (
    <View
      className={cn('flex-1', isWeb && 'min-h-0', className)}
      {...props}
    >
      {children}
    </View>
  );
}
