import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '@/utils/cn';

interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function ProgressBar({
  progress,
  color = '#6C63FF',
  height = 8,
  showLabel = false,
  label,
  className,
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View className={cn('w-full', className)}>
      {(showLabel || label) && (
        <View className="mb-2 flex-row items-center justify-between">
          {label && <Text className="text-sm text-text-secondary">{label}</Text>}
          {showLabel && (
            <Text className="text-sm font-semibold text-text">{Math.round(clampedProgress)}%</Text>
          )}
        </View>
      )}
      <View
        className="w-full overflow-hidden rounded-full bg-border"
        style={{ height }}
      >
        <View
          className="h-full rounded-full"
          style={{
            width: `${clampedProgress}%`,
            backgroundColor: color,
          }}
        />
      </View>
    </View>
  );
}
