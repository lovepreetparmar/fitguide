import { nutritionService } from '../nutrition';

describe('nutritionService.calculateMacros', () => {
  it('uses Mifflin-St Jeor with profile fields', () => {
    const targets = nutritionService.calculateMacros({
      weight_kg: 80,
      height_cm: 180,
      age: 25,
      gender: 'male',
      goal: 'general_fitness',
    });
    expect(targets.calories).toBeGreaterThan(2000);
    expect(targets.protein).toBe(160);
  });

  it('applies deficit for lose_weight goal', () => {
    const maintain = nutritionService.calculateMacros({
      weight_kg: 70,
      height_cm: 170,
      age: 30,
      gender: 'female',
      goal: 'general_fitness',
    });
    const cut = nutritionService.calculateMacros({
      weight_kg: 70,
      height_cm: 170,
      age: 30,
      gender: 'female',
      goal: 'lose_weight',
    });
    expect(cut.calories).toBeLessThan(maintain.calories);
  });
});
