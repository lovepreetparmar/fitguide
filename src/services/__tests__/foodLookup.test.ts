import { barcodeResultToMealItem } from '../foodLookup';

describe('barcodeResultToMealItem', () => {
  it('scales packaged food servings', () => {
    const item = barcodeResultToMealItem(
      {
        barcode: '123',
        name: 'Test bar',
        serving_amount: 1,
        serving_unit: 'bar',
        calories: 200,
        protein_g: 10,
        carbs_g: 20,
        fat_g: 8,
        fiber_g: 2,
      },
      2
    );
    expect(item.calories).toBe(400);
    expect(item.quantity).toBe(2);
  });
});
