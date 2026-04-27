import * as SecureStore from 'expo-secure-store';
import { Notification, FetchResult } from '../types';

const SLACK_TOKEN_KEY = 'slack_bot_token';
const SLACK_API_BASE = 'https://slack.com/api';

export interface SlackChannel {
  id: string;
  name: string;
  is_member: boolean;
  is_im: boolean;
  is_mpim: boolean;
}

export interface SlackConversationsListResponse {
  ok: boolean;
  channels?: SlackChannel[];
  error?: string;
}

export interface SlackMessage {
  type: string;
  ts: string;
  user?: string;
  username?: string;
  text: string;
  subtype?: string;
}

export interface SlackConversationsHistoryResponse {
  ok: boolean;
  messages?: SlackMessage[];
  error?: string;
}

export interface SlackUserInfo {
  ok: boolean;
  user?: {
    id: string;
    name: string;
    real_name?: string;
    profile?: {
      display_name?: string;
      real_name?: string;
    };
  };
  error?: string;
}

function slackTsToDate(ts: string): Date {
  const epochMs = parseFloat(ts) * 1000;
  return new Date(epochMs);
}

function mapSlackMessage(
  message: SlackMessage,
  channel: SlackChannel
): Notification {
  const timestamp = slackTsToDate(message.ts);
  const sender = message.username ?? message.user ?? 'Someone';
  const channelLabel = channel.is_im ? 'Direct message' : `#${channel.name}`;

  // Truncate long messages for the body
  const maxBody = 120;
  const rawText = message.text ?? '';
  const body =
    rawText.length > maxBody ? rawText.slice(0, maxBody) + '…' : rawText;

  return {
    id: `slack_${channel.id}_${message.ts}`,
    service: 'slack',
    title: `${channelLabel} — ${sender}`,
    body: body || '(No text)',
    timestamp,
    read: false, // Slack history doesn't expose individual read state via bot token
    url: undefined,
    metadata: {
      channelId: channel.id,
      channelName: channel.name,
      ts: message.ts,
      userId: message.user,
      subtype: message.subtype,
    },
  };
}

async function slackGet<T>(
  token: string,
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T> {
  const url = new URL(`${SLACK_API_BASE}/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Slack HTTP error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchSlackNotifications(): Promise<FetchResult> {
  let token: string | null = null;

  try {
    token = await SecureStore.getItemAsync(SLACK_TOKEN_KEY);
  } catch {
    return {
      notifications: [],
      error: 'Failed to retrieve Slack token from secure storage.',
    };
  }

  if (!token) {
    return {
      notifications: [],
      error: 'Slack is not connected. Please add your bot token.',
    };
  }

  // 1. Fetch the list of channels the bot is a member of
  let channelsData: SlackConversationsListResponse;
  try {
    channelsData = await slackGet<SlackConversationsListResponse>(
      token,
      'conversations.list',
      {
        types: 'public_channel,private_channel,im,mpim',
        exclude_archived: 'true',
        limit: '20',
      }
    );
  } catch {
    return {
      notifications: [],
      error: 'Network error while fetching Slack channels. Check your connection.',
    };
  }

  if (!channelsData.ok) {
    if (channelsData.error === 'invalid_auth' || channelsData.error === 'token_revoked') {
      return {
        notifications: [],
        error: 'Slack token is invalid or revoked. Please reconnect.',
      };
    }
    return {
      notifications: [],
      error: `Slack API error: ${channelsData.error ?? 'unknown error'}`,
    };
  }

  const channels = (channelsData.channels ?? []).filter((c) => c.is_member);
  if (channels.length === 0) {
    return { notifications: [] };
  }

  // 2. For each channel, fetch recent messages (last 5)
  const allNotifications: Notification[] = [];

  const historyPromises = channels.slice(0, 10).map(async (channel) => {
    try {
      const historyData = await slackGet<SlackConversationsHistoryResponse>(
        token as string,
        'conversations.history',
        {
          channel: channel.id,
          limit: '5',
        }
      );

      if (historyData.ok && Array.isArray(historyData.messages)) {
        return historyData.messages
          .filter((m) => m.type === 'message' && !m.subtype)
          .map((m) => mapSlackMessage(m, channel));
      }
    } catch {
      // Silently skip channels we can't fetch
    }
    return [];
  });

  const results = await Promise.all(historyPromises);
  results.forEach((msgs) => allNotifications.push(...msgs));

  return { notifications: allNotifications };
}

export async function saveSlackToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(SLACK_TOKEN_KEY, token);
}

export async function removeSlackToken(): Promise<void> {
  await SecureStore.deleteItemAsync(SLACK_TOKEN_KEY);
}

export async function hasSlackToken(): Promise<boolean> {
  const token = await SecureStore.getItemAsync(SLACK_TOKEN_KEY);
  return token !== null && token.length > 0;
}
