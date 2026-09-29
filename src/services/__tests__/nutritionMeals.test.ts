import { scaleFoodMacros } from '../nutritionMeals';

describe('scaleFoodMacros', () => {
  it('scales macros by serving quantity', () => {
    const result = scaleFoodMacros(
      {
        calories: 100,
        protein_g: 10,
        carbs_g: 12,
        fat_g: 3,
        fiber_g: 2,
        serving_amount: 1,
      },
      2,
      'serving'
    );
    expect(result.calories).toBe(200);
    expect(result.protein_g).toBe(20);
  });
});
