import React, { useState } from 'react';
import { View, TextInput, Text, Pressable, type TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '@/utils/cn';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
}

export function Input({
  label,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  className,
  secureTextEntry,
  ...props
}: InputProps) {
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="mb-4">
      {label && (
        <Text className="mb-2 text-sm font-medium text-text-secondary">{label}</Text>
      )}
      <View
        className={cn(
          'flex-row items-center rounded-button border bg-card px-4',
          isFocused ? 'border-primary' : 'border-border',
          error && 'border-error'
        )}
      >
        {icon && (
          <Ionicons name={icon} size={20} color="#666666" style={{ marginRight: 12 }} />
        )}
        <TextInput
          className={cn('flex-1 py-3.5 text-base text-text', className)}
          placeholderTextColor="#666666"
          secureTextEntry={isSecure}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {secureTextEntry && (
          <Pressable
            onPress={() => setIsSecure(!isSecure)}
            accessibilityRole="button"
            accessibilityLabel={isSecure ? 'Show password' : 'Hide password'}
            hitSlop={8}
          >
            <Ionicons
              name={isSecure ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#666666"
            />
          </Pressable>
        )}
        {rightIcon && !secureTextEntry && (
          <Pressable
            onPress={onRightIconPress}
            accessibilityRole="button"
            hitSlop={8}
          >
            <Ionicons name={rightIcon} size={20} color="#666666" />
          </Pressable>
        )}
      </View>
      {error && <Text className="mt-1 text-sm text-error">{error}</Text>}
    </View>
  );
}
