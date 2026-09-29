import type { MealItemInput } from './nutritionMeals';

export type BarcodeFoodResult = {
  barcode: string;
  name: string;
  brand?: string;
  serving_amount: number;
  serving_unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
};

type OpenFoodFactsProduct = {
  product_name?: string;
  brands?: string;
  serving_size?: string;
  serving_quantity?: number;
  nutriments?: {
    'energy-kcal_100g'?: number;
    'energy-kcal_serving'?: number;
    proteins_100g?: number;
    proteins_serving?: number;
    carbohydrates_100g?: number;
    carbohydrates_serving?: number;
    fat_100g?: number;
    fat_serving?: number;
    fiber_100g?: number;
    fiber_serving?: number;
  };
};

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function macrosFromProduct(product: OpenFoodFactsProduct): Omit<BarcodeFoodResult, 'barcode' | 'name' | 'brand'> {
  const n = product.nutriments ?? {};
  const hasServing =
    n['energy-kcal_serving'] != null ||
    n.proteins_serving != null ||
    n.carbohydrates_serving != null ||
    n.fat_serving != null;

  if (hasServing) {
    return {
      serving_amount: product.serving_quantity && product.serving_quantity > 0 ? product.serving_quantity : 1,
      serving_unit: product.serving_size?.trim() || 'serving',
      calories: Math.round(n['energy-kcal_serving'] ?? 0),
      protein_g: round1(n.proteins_serving ?? 0),
      carbs_g: round1(n.carbohydrates_serving ?? 0),
      fat_g: round1(n.fat_serving ?? 0),
      fiber_g: round1(n.fiber_serving ?? 0),
    };
  }

  const amount = 100;
  return {
    serving_amount: amount,
    serving_unit: 'g',
    calories: Math.round(n['energy-kcal_100g'] ?? 0),
    protein_g: round1(n.proteins_100g ?? 0),
    carbs_g: round1(n.carbohydrates_100g ?? 0),
    fat_g: round1(n.fat_100g ?? 0),
    fiber_g: round1(n.fiber_100g ?? 0),
  };
}

export async function lookupBarcode(barcode: string): Promise<BarcodeFoodResult | null> {
  const code = barcode.replace(/\D/g, '');
  if (code.length < 8) return null;

  const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) return null;

  const json = (await response.json()) as { status?: number; product?: OpenFoodFactsProduct };
  if (json.status !== 1 || !json.product) return null;

  const product = json.product;
  const name = (product.product_name ?? '').trim() || 'Packaged food';
  const brand = product.brands?.split(',')[0]?.trim();

  return {
    barcode: code,
    name: brand ? `${name} (${brand})` : name,
    brand,
    ...macrosFromProduct(product),
  };
}

export function barcodeResultToMealItem(result: BarcodeFoodResult, quantity = 1): MealItemInput {
  const factor = quantity;
  return {
    name: result.name,
    quantity: result.serving_amount * factor,
    unit: result.serving_unit,
    calories: Math.round(result.calories * factor),
    protein_g: round1(result.protein_g * factor),
    carbs_g: round1(result.carbs_g * factor),
    fat_g: round1(result.fat_g * factor),
    fiber_g: round1(result.fiber_g * factor),
  };
}
