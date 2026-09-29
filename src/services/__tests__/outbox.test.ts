import AsyncStorage from '@react-native-async-storage/async-storage';
import { outboxService } from '../sync/outbox';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('outboxService', () => {
  it('dedupes by idempotency_key', async () => {
    await outboxService.enqueue({
      user_id: 'u1',
      operation_type: 'nutrition.logged',
      idempotency_key: 'nutrition.logged:u1:2026-01-01',
      payload: { log: { calories: 100 } },
    });
    await outboxService.enqueue({
      user_id: 'u1',
      operation_type: 'nutrition.logged',
      idempotency_key: 'nutrition.logged:u1:2026-01-01',
      payload: { log: { calories: 200 } },
    });
    const items = await outboxService.list();
    expect(items).toHaveLength(1);
    expect((items[0].payload as { log: { calories: number } }).log.calories).toBe(200);
  });

  it('migrates legacy complete_workout items', async () => {
    await AsyncStorage.setItem(
      'fitguide-sync-outbox',
      JSON.stringify([
        {
          id: 'legacy-1',
          type: 'complete_workout',
          createdAt: '2026-01-01T00:00:00Z',
          attempts: 2,
          payload: {
            userId: 'user-uuid',
            muscleVolumes: {},
            session: { id: 'local_sess_1', user_id: 'user-uuid', name: 'W', sets: [] },
          },
        },
      ])
    );
    const items = await outboxService.list();
    expect(items[0].operation_type).toBe('workout.completed');
    expect(items[0].user_id).toBe('user-uuid');
    expect(items[0].idempotency_key).toBe('workout.completed:local_sess_1');
  });
});
