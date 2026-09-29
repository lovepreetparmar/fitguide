import { stripBase64Prefix } from '../mealImageScan';

describe('stripBase64Prefix', () => {
  it('removes data url prefix', () => {
    expect(stripBase64Prefix('data:image/jpeg;base64,abc123')).toBe('abc123');
  });

  it('leaves raw base64 unchanged', () => {
    expect(stripBase64Prefix('abc123')).toBe('abc123');
  });
});
