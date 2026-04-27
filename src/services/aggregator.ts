import { Notification, ServiceType, FetchResult } from '../types';
import { fetchGitHubNotifications } from './github';
import { fetchGmailNotifications } from './gmail';
import { fetchSlackNotifications } from './slack';

export interface AggregatedResult {
  notifications: Notification[];
  errors: Partial<Record<ServiceType, string>>;
}

/**
 * Fetches notifications from all configured services in parallel, merges them,
 * and sorts them by timestamp (newest first).
 *
 * Services that are not connected (token absent) return an error string — those
 * errors are surfaced to the caller but do not prevent other services from
 * loading.
 */
export async function fetchAllNotifications(): Promise<AggregatedResult> {
  const [githubResult, gmailResult, slackResult] = await Promise.all([
    fetchGitHubNotifications(),
    fetchGmailNotifications(),
    fetchSlackNotifications(),
  ]);

  const errors: Partial<Record<ServiceType, string>> = {};

  if (githubResult.error) errors['github'] = githubResult.error;
  if (gmailResult.error) errors['gmail'] = gmailResult.error;
  if (slackResult.error) errors['slack'] = slackResult.error;

  const merged: Notification[] = [
    ...githubResult.notifications,
    ...gmailResult.notifications,
    ...slackResult.notifications,
  ];

  merged.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return { notifications: merged, errors };
}

/**
 * Merges two notification arrays, deduplicating by id, then sorts by timestamp
 * descending. Useful when updating existing state with fresh data.
 */
export function mergeNotifications(
  existing: Notification[],
  incoming: Notification[]
): Notification[] {
  const map = new Map<string, Notification>();

  for (const n of existing) {
    map.set(n.id, n);
  }

  // Incoming data overwrites existing entries so read-state etc. is fresh
  for (const n of incoming) {
    map.set(n.id, n);
  }

  const merged = Array.from(map.values());
  merged.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  return merged;
}

/**
 * Filters a notification list to only include notifications from the given
 * service. Returns all notifications when service is 'all'.
 */
export function filterByService(
  notifications: Notification[],
  service: ServiceType | 'all'
): Notification[] {
  if (service === 'all') return notifications;
  return notifications.filter((n) => n.service === service);
}

/**
 * Returns the count of unread notifications, optionally filtered by service.
 */
export function countUnread(
  notifications: Notification[],
  service: ServiceType | 'all' = 'all'
): number {
  return filterByService(notifications, service).filter((n) => !n.read).length;
}

/**
 * Returns a single FetchResult-style object for a specific service, useful for
 * per-service refresh.
 */
export async function fetchServiceNotifications(
  service: ServiceType
): Promise<FetchResult> {
  switch (service) {
    case 'github':
      return fetchGitHubNotifications();
    case 'gmail':
      return fetchGmailNotifications();
    case 'slack':
      return fetchSlackNotifications();
    default: {
      const _exhaustive: never = service;
      return { notifications: [], error: `Unknown service: ${String(_exhaustive)}` };
    }
  }
}
