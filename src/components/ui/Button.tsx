import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { cn } from '@/utils/cn';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  outline: 'bg-transparent border border-primary',
  ghost: 'bg-transparent',
  danger: 'bg-error',
};

const variantTextStyles = {
  primary: 'text-white',
  secondary: 'text-background',
  outline: 'text-primary',
  ghost: 'text-text-secondary',
  danger: 'text-white',
};

const sizeStyles = {
  sm: 'px-4 py-2',
  md: 'px-6 py-3.5',
  lg: 'px-8 py-4',
};

const sizeTextStyles = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  disabled,
  onPress,
  className,
  ...props
}: ButtonProps) {
  const handlePress = (e: Parameters<NonNullable<TouchableOpacityProps['onPress']>>[0]) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.(e);
  };

  return (
    <TouchableOpacity
      className={cn(
        'flex-row items-center justify-center rounded-button',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        (disabled || loading) && 'opacity-50',
        className
      )}
      disabled={disabled || loading}
      onPress={handlePress}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? '#090909' : '#FFFFFF'} />
      ) : (
        <>
          {icon}
          <Text
            className={cn(
              'font-semibold',
              variantTextStyles[variant],
              sizeTextStyles[size],
              icon && 'ml-2'
            )}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
