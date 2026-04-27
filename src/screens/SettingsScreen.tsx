import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotificationStore } from '../store/notificationStore';
import { countUnread } from '../services/aggregator';

export function SettingsScreen() {
  const [state, actions] = useNotificationStore();
  const insets = useSafeAreaInsets();

  const totalCount = state.notifications.length;
  const unreadCount = countUnread(state.notifications);

  const handleMarkAllRead = () => {
    Alert.alert(
      'Mark all as read',
      `Mark all ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'} as read?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark all read',
          onPress: () => actions.markAllRead(),
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear all notifications',
      'This will remove all notifications from this session. They will reload on next refresh.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => actions.setNotifications([]),
        },
      ]
    );
  };

  const lastRefreshedText = state.lastRefreshed
    ? state.lastRefreshed.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Never';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <Text style={styles.heading}>Settings</Text>

      {/* Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalCount}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, unreadCount > 0 && styles.statUnread]}>
              {unreadCount}
            </Text>
            <Text style={styles.statLabel}>Unread</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{lastRefreshedText}</Text>
            <Text style={styles.statLabel}>Refreshed</Text>
          </View>
        </View>
      </View>

      {/* Connected services */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connected Services</Text>
        {state.services.map((svc) => (
          <View key={svc.type} style={styles.svcRow}>
            <View style={[styles.dot, { backgroundColor: svc.connected ? '#34c759' : '#c7c7cc' }]} />
            <Text style={styles.svcName}>{svc.name}</Text>
            <Text style={[styles.svcStatus, { color: svc.connected ? '#34c759' : '#8e8e93' }]}>
              {svc.connected ? 'Connected' : 'Not connected'}
            </Text>
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <TouchableOpacity
          style={[styles.actionRow, unreadCount === 0 && styles.actionDisabled]}
          onPress={unreadCount > 0 ? handleMarkAllRead : undefined}
        >
          <Text style={[styles.actionText, unreadCount === 0 && styles.actionTextDisabled]}>
            Mark all as read
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionRow, totalCount === 0 && styles.actionDisabled]}
          onPress={totalCount > 0 ? handleClearAll : undefined}
        >
          <Text
            style={[
              styles.actionText,
              styles.actionDanger,
              totalCount === 0 && styles.actionTextDisabled,
            ]}
          >
            Clear all notifications
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f7' },
  content: { paddingHorizontal: 16 },
  heading: { fontSize: 28, fontWeight: '700', color: '#1c1c1e', marginBottom: 20 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8e8e93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: { fontSize: 22, fontWeight: '700', color: '#1c1c1e' },
  statUnread: { color: '#007aff' },
  statLabel: { fontSize: 12, color: '#8e8e93', marginTop: 4 },
  svcRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    gap: 10,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  svcName: { flex: 1, fontSize: 15, color: '#1c1c1e', fontWeight: '500' },
  svcStatus: { fontSize: 13 },
  actionRow: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 8,
  },
  actionDisabled: { opacity: 0.4 },
  actionText: { fontSize: 15, color: '#007aff', fontWeight: '500' },
  actionTextDisabled: { color: '#8e8e93' },
  actionDanger: { color: '#ff3b30' },
});
