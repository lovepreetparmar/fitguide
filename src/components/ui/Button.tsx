import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(e);
  };

  return (
    <TouchableOpacity
      className={cn(
        'overflow-hidden rounded-button',
        variant !== 'primary' && 'flex-row items-center justify-center',
        variant !== 'primary' && variantStyles[variant],
        variant !== 'primary' && sizeStyles[size],
        fullWidth && 'w-full',
        (disabled || loading) && 'opacity-50',
        className
      )}
      disabled={disabled || loading}
      onPress={handlePress}
      activeOpacity={0.8}
      {...props}
    >
      {variant === 'primary' ? (
        <LinearGradient
          colors={['#4AA3FF', '#0076FC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingHorizontal: size === 'sm' ? 16 : size === 'md' ? 24 : 32,
            paddingVertical: size === 'sm' ? 10 : size === 'md' ? 15 : 18,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            shadowColor: '#0076FC',
            shadowOpacity: 0.24,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 10 },
          }}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              {icon}
              <Text
                className={cn(
                  'font-semibold text-white',
                  sizeTextStyles[size],
                  icon && 'ml-2'
                )}
              >
                {title}
              </Text>
            </>
          )}
        </LinearGradient>
      ) : (
        <View className="flex-row items-center justify-center">
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
        </View>
      )}
    </TouchableOpacity>
  );
}
