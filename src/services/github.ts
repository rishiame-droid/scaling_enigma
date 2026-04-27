import * as SecureStore from 'expo-secure-store';
import { Notification, FetchResult } from '../types';

const GITHUB_TOKEN_KEY = 'github_access_token';
const GITHUB_API_BASE = 'https://api.github.com';

export interface GitHubNotificationSubject {
  title: string;
  url: string;
  type: string;
}

export interface GitHubNotificationRepository {
  full_name: string;
  html_url: string;
}

export interface GitHubNotificationRaw {
  id: string;
  subject: GitHubNotificationSubject;
  repository: GitHubNotificationRepository;
  reason: string;
  unread: boolean;
  updated_at: string;
  url: string;
}

function mapGitHubNotification(raw: GitHubNotificationRaw): Notification {
  const repoName = raw.repository.full_name;
  const subjectType = raw.subject.type;

  const bodyParts: string[] = [];
  if (subjectType) bodyParts.push(subjectType);
  if (raw.reason) bodyParts.push(`Reason: ${raw.reason}`);
  bodyParts.push(`Repo: ${repoName}`);

  return {
    id: `github_${raw.id}`,
    service: 'github',
    title: raw.subject.title,
    body: bodyParts.join(' · '),
    timestamp: new Date(raw.updated_at),
    read: !raw.unread,
    url: raw.repository.html_url,
    metadata: {
      repo: repoName,
      subjectType,
      reason: raw.reason,
      apiUrl: raw.url,
    },
  };
}

export async function fetchGitHubNotifications(): Promise<FetchResult> {
  let token: string | null = null;

  try {
    token = await SecureStore.getItemAsync(GITHUB_TOKEN_KEY);
  } catch (storeError) {
    return {
      notifications: [],
      error: 'Failed to retrieve GitHub token from secure storage.',
    };
  }

  if (!token) {
    return {
      notifications: [],
      error: 'GitHub is not connected. Please add your personal access token.',
    };
  }

  let response: Response;
  try {
    response = await fetch(`${GITHUB_API_BASE}/notifications?all=false&per_page=50`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
  } catch (networkError) {
    return {
      notifications: [],
      error: 'Network error while fetching GitHub notifications. Check your connection.',
    };
  }

  if (response.status === 401) {
    return {
      notifications: [],
      error: 'GitHub token is invalid or expired. Please reconnect.',
    };
  }

  if (response.status === 304) {
    // Not modified — no new notifications
    return { notifications: [] };
  }

  if (!response.ok) {
    return {
      notifications: [],
      error: `GitHub API returned an error: ${response.status} ${response.statusText}`,
    };
  }

  let rawNotifications: GitHubNotificationRaw[];
  try {
    rawNotifications = (await response.json()) as GitHubNotificationRaw[];
  } catch {
    return {
      notifications: [],
      error: 'Failed to parse GitHub API response.',
    };
  }

  if (!Array.isArray(rawNotifications)) {
    return {
      notifications: [],
      error: 'Unexpected GitHub API response format.',
    };
  }

  const notifications = rawNotifications.map(mapGitHubNotification);
  return { notifications };
}

export async function markGitHubNotificationRead(threadId: string): Promise<void> {
  const token = await SecureStore.getItemAsync(GITHUB_TOKEN_KEY);
  if (!token) return;

  // Strip the "github_" prefix to get the raw thread id
  const rawId = threadId.replace(/^github_/, '');

  await fetch(`${GITHUB_API_BASE}/notifications/threads/${rawId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
}

export async function saveGitHubToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(GITHUB_TOKEN_KEY, token);
}

export async function removeGitHubToken(): Promise<void> {
  await SecureStore.deleteItemAsync(GITHUB_TOKEN_KEY);
}

export async function hasGitHubToken(): Promise<boolean> {
  const token = await SecureStore.getItemAsync(GITHUB_TOKEN_KEY);
  return token !== null && token.length > 0;
}
