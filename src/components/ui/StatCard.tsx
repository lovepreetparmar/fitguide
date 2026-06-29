import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '@/utils/cn';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  onPress?: () => void;
  className?: string;
}

export function StatCard({
  label,
  value,
  unit,
  icon,
  iconColor = '#6C63FF',
  trend,
  trendValue,
  onPress,
  className,
}: StatCardProps) {
  const content = (
    <View className={cn('rounded-card bg-card p-4', className)}>
      <View className="mb-3 flex-row items-center justify-between">
        {icon && (
          <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Ionicons name={icon} size={20} color={iconColor} />
          </View>
        )}
        {trend && trendValue && (
          <View className="flex-row items-center">
            <Ionicons
              name={trend === 'up' ? 'arrow-up' : trend === 'down' ? 'arrow-down' : 'remove'}
              size={14}
              color={trend === 'up' ? '#00D9A5' : trend === 'down' ? '#FF5252' : '#666666'}
            />
            <Text
              className={cn(
                'ml-1 text-xs font-medium',
                trend === 'up' ? 'text-secondary' : trend === 'down' ? 'text-error' : 'text-text-muted'
              )}
            >
              {trendValue}
            </Text>
          </View>
        )}
      </View>
      <Text className="text-2xl font-bold text-text">
        {value}
        {unit && <Text className="text-base font-normal text-text-secondary"> {unit}</Text>}
      </Text>
      <Text className="mt-1 text-sm text-text-secondary">{label}</Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}
