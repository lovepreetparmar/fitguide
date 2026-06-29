import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '@/utils/cn';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
  size?: 'sm' | 'md';
}

export function Chip({
  label,
  selected = false,
  onPress,
  icon,
  color,
  size = 'md',
}: ChipProps) {
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      onPress={onPress}
      activeOpacity={0.7}
      className={cn(
        'flex-row items-center rounded-full border',
        size === 'sm' ? 'px-3 py-1.5' : 'px-4 py-2',
        selected ? 'border-primary bg-primary/20' : 'border-border bg-card'
      )}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={size === 'sm' ? 14 : 16}
          color={selected ? '#6C63FF' : color ?? '#A0A0A0'}
          style={{ marginRight: 6 }}
        />
      )}
      <Text
        className={cn(
          'font-medium',
          size === 'sm' ? 'text-xs' : 'text-sm',
          selected ? 'text-primary' : 'text-text-secondary'
        )}
      >
        {label}
      </Text>
    </Component>
  );
}
