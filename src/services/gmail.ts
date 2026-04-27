import * as SecureStore from 'expo-secure-store';
import { Notification, FetchResult } from '../types';

const GMAIL_TOKEN_KEY = 'gmail_access_token';
const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1';

export interface GmailMessageId {
  id: string;
  threadId: string;
}

export interface GmailHeader {
  name: string;
  value: string;
}

export interface GmailMessagePayload {
  headers: GmailHeader[];
  snippet?: string;
}

export interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  payload: GmailMessagePayload;
  internalDate: string;
  labelIds: string[];
}

export interface GmailListResponse {
  messages?: GmailMessageId[];
  nextPageToken?: string;
  resultSizeEstimate: number;
}

function getHeader(headers: GmailHeader[], name: string): string {
  const header = headers.find(
    (h) => h.name.toLowerCase() === name.toLowerCase()
  );
  return header ? header.value : '';
}

function decodeSnippet(snippet: string): string {
  // HTML entities commonly appearing in Gmail snippets
  return snippet
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function mapGmailMessage(message: GmailMessage): Notification {
  const headers = message.payload?.headers ?? [];
  const subject = getHeader(headers, 'Subject') || '(No subject)';
  const from = getHeader(headers, 'From') || 'Unknown sender';
  const timestamp = message.internalDate
    ? new Date(parseInt(message.internalDate, 10))
    : new Date();

  const snippet = decodeSnippet(message.snippet ?? '');

  return {
    id: `gmail_${message.id}`,
    service: 'gmail',
    title: subject,
    body: `${from}: ${snippet}`,
    timestamp,
    read: !message.labelIds?.includes('UNREAD'),
    url: `https://mail.google.com/mail/u/0/#inbox/${message.threadId}`,
    metadata: {
      messageId: message.id,
      threadId: message.threadId,
      from,
      snippet,
    },
  };
}

async function fetchMessageDetail(
  token: string,
  messageId: string
): Promise<GmailMessage | null> {
  let response: Response;
  try {
    response = await fetch(
      `${GMAIL_API_BASE}/users/me/messages/${messageId}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch {
    return null;
  }

  if (!response.ok) return null;

  try {
    return (await response.json()) as GmailMessage;
  } catch {
    return null;
  }
}

export async function fetchGmailNotifications(): Promise<FetchResult> {
  let token: string | null = null;

  try {
    token = await SecureStore.getItemAsync(GMAIL_TOKEN_KEY);
  } catch {
    return {
      notifications: [],
      error: 'Failed to retrieve Gmail token from secure storage.',
    };
  }

  if (!token) {
    return {
      notifications: [],
      error: 'Gmail is not connected. Please authenticate with your Google account.',
    };
  }

  let listResponse: Response;
  try {
    listResponse = await fetch(
      `${GMAIL_API_BASE}/users/me/messages?labelIds=INBOX&q=is%3Aunread&maxResults=25`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch {
    return {
      notifications: [],
      error: 'Network error while fetching Gmail messages. Check your connection.',
    };
  }

  if (listResponse.status === 401) {
    return {
      notifications: [],
      error: 'Gmail token is invalid or expired. Please reconnect.',
    };
  }

  if (!listResponse.ok) {
    return {
      notifications: [],
      error: `Gmail API returned an error: ${listResponse.status} ${listResponse.statusText}`,
    };
  }

  let listData: GmailListResponse;
  try {
    listData = (await listResponse.json()) as GmailListResponse;
  } catch {
    return {
      notifications: [],
      error: 'Failed to parse Gmail API response.',
    };
  }

  const messageIds = listData.messages ?? [];
  if (messageIds.length === 0) {
    return { notifications: [] };
  }

  // Fetch details for each message (limit to 20 to avoid excessive requests)
  const detailPromises = messageIds
    .slice(0, 20)
    .map((m) => fetchMessageDetail(token as string, m.id));

  const details = await Promise.all(detailPromises);
  const notifications = details
    .filter((d): d is GmailMessage => d !== null)
    .map(mapGmailMessage);

  return { notifications };
}

export async function saveGmailToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(GMAIL_TOKEN_KEY, token);
}

export async function removeGmailToken(): Promise<void> {
  await SecureStore.deleteItemAsync(GMAIL_TOKEN_KEY);
}

export async function hasGmailToken(): Promise<boolean> {
  const token = await SecureStore.getItemAsync(GMAIL_TOKEN_KEY);
  return token !== null && token.length > 0;
}
