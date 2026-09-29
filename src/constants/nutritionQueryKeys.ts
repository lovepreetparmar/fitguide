export const nutritionQueryKeys = {
  log: (userId: string, date: string) => ['nutrition', userId, date] as const,
  mealItems: (userId: string, date: string) => ['meal-items', userId, date] as const,
  recentFoods: (userId: string) => ['recent-foods', userId] as const,
  frequentFoods: (userId: string) => ['frequent-foods', userId] as const,
};
