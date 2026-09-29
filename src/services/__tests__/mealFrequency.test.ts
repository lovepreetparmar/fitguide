import { aggregateLocalFoodShortcuts } from '../mealFrequency';
import type { LocalMealLogItem } from '@/types';

function item(partial: Partial<LocalMealLogItem> & Pick<LocalMealLogItem, 'name'>): LocalMealLogItem {
  return {
    id: partial.id ?? 'local_item_1',
    meal_log_id: 'm1',
    food_id: partial.food_id ?? null,
    name: partial.name,
    quantity: partial.quantity ?? 1,
    unit: partial.unit ?? 'serving',
    calories: partial.calories ?? 100,
    protein_g: partial.protein_g ?? 10,
    carbs_g: partial.carbs_g ?? 10,
    fat_g: partial.fat_g ?? 2,
    fiber_g: partial.fiber_g ?? 1,
    user_id: partial.user_id ?? 'u1',
    date: partial.date ?? '2026-01-01',
    meal_type: partial.meal_type ?? 'lunch',
    client_item_id: partial.client_item_id,
  };
}

describe('aggregateLocalFoodShortcuts', () => {
  it('groups frequent foods by name', () => {
    const items = [
      item({ name: 'Dal', id: 'a', client_item_id: 'a' }),
      item({ name: 'Dal', id: 'b', client_item_id: 'b' }),
      item({ name: 'Roti', id: 'c', client_item_id: 'c' }),
    ];
    const frequent = aggregateLocalFoodShortcuts(items, 'u1', 'frequent', 5);
    expect(frequent[0].name).toBe('Dal');
    expect(frequent[0].log_count).toBe(2);
  });
});
