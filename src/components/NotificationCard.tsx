import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '../types';
import { ServiceBadge } from './ServiceBadge';

interface NotificationCardProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
}

const SERVICE_ACCENT: Record<string, string> = {
  github: '#24292f',
  gmail: '#EA4335',
  slack: '#4A154B',
};

export function NotificationCard({
  notification,
  onMarkRead,
}: NotificationCardProps): React.JSX.Element {
  const { id, service, title, body, timestamp, read, url } = notification;

  const accentColor = SERVICE_ACCENT[service] ?? '#007aff';

  const relativeTime = formatDistanceToNow(timestamp, { addSuffix: true });

  const handlePress = useCallback(() => {
    if (!read) {
      onMarkRead(id);
    }
    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Could not open the link.');
      });
    }
  }, [id, read, url, onMarkRead]);

  const handleLongPress = useCallback(() => {
    if (!read) {
      onMarkRead(id);
    }
  }, [id, read, onMarkRead]);

  const truncatedBody =
    body.length > 100 ? body.slice(0, 100).trimEnd() + '…' : body;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      onLongPress={handleLongPress}
      accessibilityRole="button"
      accessibilityLabel={`Notification from ${service}: ${title}`}
      accessibilityState={{ selected: !read }}
    >
      <View style={[styles.card, read && styles.cardRead]}>
        {/* Left accent bar */}
        <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

        <View style={styles.inner}>
          {/* Header row */}
          <View style={styles.header}>
            <ServiceBadge service={service} size="small" />
            <Text style={styles.time} numberOfLines={1}>
              {relativeTime}
            </Text>
            {!read && <View style={[styles.unreadDot, { backgroundColor: accentColor }]} />}
          </View>

          {/* Title */}
          <Text
            style={[styles.title, read && styles.titleRead]}
            numberOfLines={2}
          >
            {title}
          </Text>

          {/* Body */}
          <Text style={styles.body} numberOfLines={2}>
            {truncatedBody}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 5,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardRead: {
    opacity: 0.75,
  },
  accentBar: {
    width: 4,
  },
  inner: {
    flex: 1,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  time: {
    flex: 1,
    fontSize: 12,
    color: '#8e8e93',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 3,
    lineHeight: 20,
  },
  titleRead: {
    fontWeight: '400',
    color: '#3c3c43',
  },
  body: {
    fontSize: 13,
    color: '#8e8e93',
    lineHeight: 18,
  },
});
