import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { AIRecommendation } from '@/types';

interface AIRecommendationCardProps {
  recommendations: AIRecommendation[];
}

export function AIRecommendationCard({ recommendations }: AIRecommendationCardProps) {
  const router = useRouter();

  if (!recommendations.length) return null;

  const top = recommendations[0];

  const handleAction = (route?: string) => {
    if (route) {
      router.push(route as never);
    }
  };

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
          {top.action_label && top.action_route && (
            <Button
              title={top.action_label}
              variant="outline"
              size="sm"
              onPress={() => handleAction(top.action_route)}
              className="mt-3 self-start"
            />
          )}
        </View>
      </View>
      {recommendations.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
          {recommendations.slice(1, 4).map((rec) => (
            <TouchableOpacity
              key={rec.id}
              onPress={() => handleAction(rec.action_route)}
              className="mr-3 rounded-button border border-border bg-background px-3 py-2"
              disabled={!rec.action_route}
            >
              <Text className="text-xs font-medium text-text-secondary">{rec.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </Card>
  );
}
