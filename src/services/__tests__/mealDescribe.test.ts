import { parseMealDescription } from '../mealDescribe';

describe('parseMealDescription', () => {
  it('parses multiple Indian foods from natural language', () => {
    const items = parseMealDescription('2 rotis and 1 bowl dal');
    expect(items.length).toBe(2);
    expect(items[0].name).toBe('Roti (whole wheat)');
    expect(items[0].quantity).toBe(2);
    expect(items[0].calories).toBe(240);
    expect(items[1].name).toBe('Dal (cooked)');
  });

  it('returns low-confidence estimate for unknown foods', () => {
    const items = parseMealDescription('mystery smoothie');
    expect(items.length).toBe(1);
    expect(items[0].confidence).toBe('low');
  });
});
