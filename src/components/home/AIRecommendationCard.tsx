import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import type { AIRecommendation } from '@/types';

interface AIRecommendationCardProps {
  recommendations: AIRecommendation[];
}

export function AIRecommendationCard({ recommendations }: AIRecommendationCardProps) {
  if (!recommendations.length) return null;

  const top = recommendations[0];

  return (
    <Card className="mb-4 overflow-hidden">
      <View className="flex-row items-start">
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-primary/20">
          <Ionicons name="sparkles" size={20} color="#6C63FF" />
        </View>
        <View className="flex-1">
          <Text className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">
            AI Coach
          </Text>
          <Text className="mb-1 text-base font-semibold text-text">{top.title}</Text>
          <Text className="text-sm leading-5 text-text-secondary">{top.message}</Text>
        </View>
      </View>
      {recommendations.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
          {recommendations.slice(1, 4).map((rec) => (
            <View
              key={rec.id}
              className="mr-3 rounded-button border border-border bg-background px-3 py-2"
            >
              <Text className="text-xs font-medium text-text-secondary">{rec.title}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </Card>
  );
}
