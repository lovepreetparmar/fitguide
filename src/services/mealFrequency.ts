import type { LocalMealLogItem } from '@/types';
import type { MealItemInput } from './nutritionMeals';

export type FoodLogShortcut = MealItemInput & {
  food_id?: string | null;
  last_logged_at?: string;
  log_count?: number;
};

function groupKey(item: Pick<LocalMealLogItem, 'food_id' | 'name'>): string {
  return item.food_id ?? item.name.toLowerCase();
}

export function aggregateLocalFoodShortcuts(
  items: LocalMealLogItem[],
  userId: string,
  mode: 'recent' | 'frequent',
  limit: number
): FoodLogShortcut[] {
  const filtered = items.filter((i) => i.user_id === userId);
  const map = new Map<
    string,
    FoodLogShortcut & { log_count: number; last_logged_at: string }
  >();

  for (const item of filtered) {
    const key = groupKey(item);
    const existing = map.get(key);
    const loggedAt = item.client_item_id ?? item.id;
    if (!existing) {
      map.set(key, {
        food_id: item.food_id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        calories: item.calories,
        protein_g: item.protein_g,
        carbs_g: item.carbs_g,
        fat_g: item.fat_g,
        fiber_g: item.fiber_g,
        log_count: 1,
        last_logged_at: loggedAt,
      });
      continue;
    }
    existing.log_count += 1;
    if (loggedAt > existing.last_logged_at) {
      existing.last_logged_at = loggedAt;
      existing.quantity = item.quantity;
      existing.unit = item.unit;
      existing.calories = item.calories;
      existing.protein_g = item.protein_g;
      existing.carbs_g = item.carbs_g;
      existing.fat_g = item.fat_g;
      existing.fiber_g = item.fiber_g;
    }
  }

  const list = [...map.values()];
  if (mode === 'frequent') {
    list.sort((a, b) => b.log_count - a.log_count);
  } else {
    list.sort((a, b) => (a.last_logged_at < b.last_logged_at ? 1 : -1));
  }

  return list.slice(0, limit).map(({ log_count, last_logged_at, ...rest }) => ({
    ...rest,
    log_count,
    last_logged_at,
  }));
}
