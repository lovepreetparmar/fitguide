import React from 'react';
import { View, type ViewProps } from 'react-native';
import { cn } from '@/utils/cn';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  className,
  ...props
}: CardProps) {
  return (
    <View
      className={cn(
        'overflow-hidden rounded-card bg-card',
        (variant === 'default' || variant === 'outlined' || variant === 'elevated') && 'border border-border',
        variant === 'elevated' && 'shadow-lg',
        paddingStyles[padding],
        className
      )}
      style={
        variant === 'elevated'
          ? {
              shadowColor: '#0076FC',
              shadowOpacity: 0.16,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 10 },
              elevation: 8,
            }
          : undefined
      }
      {...props}
    >
      {children}
    </View>
  );
}
