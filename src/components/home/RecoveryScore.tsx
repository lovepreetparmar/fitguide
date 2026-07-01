import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Card } from '@/components/ui/Card';
import { getRecoveryColor, getRecoveryLabel } from '@/utils/format';

interface RecoveryScoreProps {
  score: number;
  size?: number;
}

export function RecoveryScore({ score, size = 120 }: RecoveryScoreProps) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const status = score >= 80 ? 'recovered' : score >= 50 ? 'recovering' : 'needs_rest';
  const color = getRecoveryColor(status);

  return (
    <Card className="items-center py-6">
      <Text className="mb-4 text-sm font-medium text-text-secondary">Recovery Score</Text>
      <View className="items-center justify-center">
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#2A2A2A"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${progress} ${circumference}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View className="absolute items-center">
          <Text className="text-3xl font-bold text-text">{score}</Text>
          <Text className="text-xs text-text-secondary">{getRecoveryLabel(status)}</Text>
        </View>
      </View>
    </Card>
  );
}
