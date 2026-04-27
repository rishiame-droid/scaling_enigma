import { mergeNotifications, filterByService, countUnread } from '../src/services/aggregator';
import { Notification } from '../src/types';

function makeNotification(overrides: Partial<Notification>): Notification {
  return {
    id: 'test_1',
    service: 'github',
    title: 'Test notification',
    body: 'Test body',
    timestamp: new Date('2024-01-01T12:00:00Z'),
    read: false,
    ...overrides,
  };
}

describe('mergeNotifications', () => {
  it('sorts merged notifications by timestamp descending', () => {
    const older = makeNotification({
      id: 'a',
      timestamp: new Date('2024-01-01T10:00:00Z'),
    });
    const newer = makeNotification({
      id: 'b',
      timestamp: new Date('2024-01-01T12:00:00Z'),
    });

    const result = mergeNotifications([older], [newer]);
    expect(result[0].id).toBe('b');
    expect(result[1].id).toBe('a');
  });

  it('deduplicates by id, preferring incoming data', () => {
    const existing = makeNotification({ id: 'x', read: false });
    const incoming = makeNotification({ id: 'x', read: true });

    const result = mergeNotifications([existing], [incoming]);
    expect(result).toHaveLength(1);
    expect(result[0].read).toBe(true);
  });

  it('returns empty array when both inputs are empty', () => {
    expect(mergeNotifications([], [])).toEqual([]);
  });

  it('handles merging with an empty existing list', () => {
    const n = makeNotification({ id: 'only' });
    const result = mergeNotifications([], [n]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('only');
  });

  it('handles merging with an empty incoming list', () => {
    const n = makeNotification({ id: 'only' });
    const result = mergeNotifications([n], []);
    expect(result).toHaveLength(1);
  });
});

describe('filterByService', () => {
  const notifications = [
    makeNotification({ id: 'gh1', service: 'github' }),
    makeNotification({ id: 'gh2', service: 'github' }),
    makeNotification({ id: 'gm1', service: 'gmail' }),
    makeNotification({ id: 'sl1', service: 'slack' }),
  ];

  it("returns all notifications when filter is 'all'", () => {
    expect(filterByService(notifications, 'all')).toHaveLength(4);
  });

  it('filters to only github notifications', () => {
    const result = filterByService(notifications, 'github');
    expect(result).toHaveLength(2);
    expect(result.every((n) => n.service === 'github')).toBe(true);
  });

  it('filters to only gmail notifications', () => {
    const result = filterByService(notifications, 'gmail');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('gm1');
  });

  it('returns empty array when no notifications match the service', () => {
    const result = filterByService(
      [makeNotification({ service: 'github' })],
      'slack'
    );
    expect(result).toHaveLength(0);
  });
});

describe('countUnread', () => {
  it('counts only unread notifications', () => {
    const notifications = [
      makeNotification({ id: '1', read: false }),
      makeNotification({ id: '2', read: true }),
      makeNotification({ id: '3', read: false }),
    ];
    expect(countUnread(notifications)).toBe(2);
  });

  it('returns 0 when all are read', () => {
    const notifications = [
      makeNotification({ id: '1', read: true }),
      makeNotification({ id: '2', read: true }),
    ];
    expect(countUnread(notifications)).toBe(0);
  });

  it('returns 0 for an empty list', () => {
    expect(countUnread([])).toBe(0);
  });

  it('filters by service before counting', () => {
    const notifications = [
      makeNotification({ id: '1', service: 'github', read: false }),
      makeNotification({ id: '2', service: 'gmail', read: false }),
      makeNotification({ id: '3', service: 'github', read: true }),
    ];
    expect(countUnread(notifications, 'github')).toBe(1);
  });
});
