import { supabase, isSupabaseConfigured } from './supabase';
import type { MealItemInput } from './nutritionMeals';

export type DescribedMealItem = MealItemInput & {
  confidence: 'high' | 'medium' | 'low';
  note?: string;
};

type FoodTemplate = {
  pattern: RegExp;
  name: string;
  unit: string;
  perUnit: { calories: number; protein_g: number; carbs_g: number; fat_g: number; fiber_g: number };
};

const FOOD_TEMPLATES: FoodTemplate[] = [
  {
    pattern: /\b(rotis?|chapatis?|phulkas?)\b/i,
    name: 'Roti (whole wheat)',
    unit: 'piece',
    perUnit: { calories: 120, protein_g: 4, carbs_g: 22, fat_g: 2, fiber_g: 3 },
  },
  {
    pattern: /\b(dal|daal|lentil soup)\b/i,
    name: 'Dal (cooked)',
    unit: 'bowl',
    perUnit: { calories: 180, protein_g: 9, carbs_g: 28, fat_g: 3, fiber_g: 8 },
  },
  {
    pattern: /\b(rice|chawal|basmati)\b/i,
    name: 'Basmati rice (cooked)',
    unit: 'cup',
    perUnit: { calories: 210, protein_g: 4, carbs_g: 45, fat_g: 0, fiber_g: 1 },
  },
  {
    pattern: /\b(paneer)\b/i,
    name: 'Paneer (100g)',
    unit: 'g',
    perUnit: { calories: 265, protein_g: 18, carbs_g: 4, fat_g: 20, fiber_g: 0 },
  },
  {
    pattern: /\b(yogurt|curd|dahi|greek yogurt)\b/i,
    name: 'Greek yogurt',
    unit: 'cup',
    perUnit: { calories: 130, protein_g: 15, carbs_g: 8, fat_g: 4, fiber_g: 0 },
  },
  {
    pattern: /\b(egg|eggs|omelette|omelet)\b/i,
    name: 'Egg',
    unit: 'piece',
    perUnit: { calories: 78, protein_g: 6, carbs_g: 0.6, fat_g: 5, fiber_g: 0 },
  },
  {
    pattern: /\b(chicken)\b/i,
    name: 'Chicken breast (cooked)',
    unit: 'g',
    perUnit: { calories: 165, protein_g: 31, carbs_g: 0, fat_g: 3.6, fiber_g: 0 },
  },
  {
    pattern: /\b(salad)\b/i,
    name: 'Mixed salad',
    unit: 'bowl',
    perUnit: { calories: 80, protein_g: 3, carbs_g: 12, fat_g: 2, fiber_g: 4 },
  },
];

function extractQuantity(segment: string): { quantity: number; unitHint: string } {
  const match = segment.match(
    /\b(\d+(?:\.\d+)?)\s*(bowls?|cups?|pieces?|rotis?|chapatis?|eggs?|g|grams?|ml|servings?)?/i
  );
  if (!match) return { quantity: 1, unitHint: '' };
  return {
    quantity: parseFloat(match[1]) || 1,
    unitHint: (match[2] ?? '').toLowerCase(),
  };
}

function buildFromTemplate(template: FoodTemplate, quantity: number, unitHint: string): MealItemInput {
  if (template.unit === 'g') {
    const grams = /^(g|gram|grams)$/.test(unitHint) ? quantity : quantity * 100;
    const factor = grams / 100;
    return {
      name: template.name,
      quantity: grams,
      unit: 'g',
      calories: Math.round(template.perUnit.calories * factor),
      protein_g: Math.round(template.perUnit.protein_g * factor * 10) / 10,
      carbs_g: Math.round(template.perUnit.carbs_g * factor * 10) / 10,
      fat_g: Math.round(template.perUnit.fat_g * factor * 10) / 10,
      fiber_g: Math.round(template.perUnit.fiber_g * factor * 10) / 10,
    };
  }

  return {
    name: template.name,
    quantity,
    unit: template.unit,
    calories: Math.round(template.perUnit.calories * quantity),
    protein_g: Math.round(template.perUnit.protein_g * quantity * 10) / 10,
    carbs_g: Math.round(template.perUnit.carbs_g * quantity * 10) / 10,
    fat_g: Math.round(template.perUnit.fat_g * quantity * 10) / 10,
    fiber_g: Math.round(template.perUnit.fiber_g * quantity * 10) / 10,
  };
}

function parseSegment(segment: string): DescribedMealItem | null {
  const text = segment.trim();
  if (!text) return null;

  const template = FOOD_TEMPLATES.find((t) => t.pattern.test(text));
  if (!template) return null;

  const { quantity, unitHint } = extractQuantity(text);
  const item = buildFromTemplate(template, quantity, unitHint);
  return {
    ...item,
    confidence: 'high',
    note: 'Matched Fit Guide food catalog',
  };
}

export function parseMealDescription(text: string): DescribedMealItem[] {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return [];

  const segments = normalized
    .split(/\s*(?:,|\+|&|\band\b|\bwith\b)\s*/i)
    .map((s) => s.trim())
    .filter(Boolean);

  const items: DescribedMealItem[] = [];
  for (const segment of segments) {
    const parsed = parseSegment(segment);
    if (parsed) items.push(parsed);
  }

  if (items.length === 0 && segments.length === 1) {
    return [
      {
        name: normalized.charAt(0).toUpperCase() + normalized.slice(1),
        quantity: 1,
        unit: 'serving',
        calories: 250,
        protein_g: 12,
        carbs_g: 28,
        fat_g: 8,
        fiber_g: 3,
        confidence: 'low',
        note: 'Rough estimate — edit before logging',
      },
    ];
  }

  return items;
}

export type AiDescribeItem = {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
};

export async function describeMealWithAi(text: string): Promise<DescribedMealItem[]> {
  if (!isSupabaseConfigured) {
    throw new Error('Sign in with cloud sync to use AI meal describe.');
  }

  const { data, error } = await supabase.functions.invoke('describe-meal', {
    body: { text },
  });

  if (error) throw error;
  const items = (data as { items?: AiDescribeItem[] })?.items;
  if (!items?.length) {
    throw new Error('No foods recognized. Try simpler wording.');
  }

  return items.map((item) => ({
    ...item,
    confidence: 'medium' as const,
    note: 'AI estimate — verify portions',
  }));
}

export async function describeMeal(text: string, options?: { useAi?: boolean }): Promise<DescribedMealItem[]> {
  const ruleItems = parseMealDescription(text);
  const onlyLowConfidence = ruleItems.length === 1 && ruleItems[0].confidence === 'low';

  if (options?.useAi && (onlyLowConfidence || ruleItems.length === 0)) {
    try {
      return await describeMealWithAi(text);
    } catch {
      return ruleItems;
    }
  }

  return ruleItems;
}

export function describedItemToMealInput(item: DescribedMealItem): MealItemInput {
  return {
    food_id: item.food_id,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    calories: item.calories,
    protein_g: item.protein_g,
    carbs_g: item.carbs_g,
    fat_g: item.fat_g,
    fiber_g: item.fiber_g,
  };
}
