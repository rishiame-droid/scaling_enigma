import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchAllNotifications, filterByService, countUnread } from '../services/aggregator';
import { useNotificationStore } from '../store/notificationStore';
import { markGitHubNotificationRead } from '../services/github';
import { NotificationCard } from '../components/NotificationCard';
import { EmptyState } from '../components/EmptyState';
import { Notification, FilterType, ServiceType } from '../types';

const FILTERS: { label: string; value: FilterType }[] = [
  { label: 'All', value: 'all' },
  { label: 'GitHub', value: 'github' },
  { label: 'Gmail', value: 'gmail' },
  { label: 'Slack', value: 'slack' },
];

export function HomeScreen() {
  const [state, actions] = useNotificationStore();
  const insets = useSafeAreaInsets();

  const load = useCallback(async () => {
    actions.setLoading(true);
    const { notifications, errors } = await fetchAllNotifications();
    actions.setNotifications(notifications);
    actions.setLastRefreshed(new Date());
    (Object.keys(errors) as ServiceType[]).forEach((svc) => {
      actions.setError(svc, errors[svc]);
    });
    actions.setLoading(false);
  }, [actions]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleMarkRead = useCallback(
    async (id: string) => {
      actions.markRead(id);
      if (id.startsWith('github_')) {
        await markGitHubNotificationRead(id).catch(() => undefined);
      }
    },
    [actions]
  );

  const displayed =
    state.activeFilter === 'all'
      ? state.notifications
      : filterByService(state.notifications, state.activeFilter as ServiceType);

  const unreadCount = countUnread(state.notifications);

  const renderItem = useCallback(
    ({ item }: { item: Notification }) => (
      <NotificationCard notification={item} onMarkRead={handleMarkRead} />
    ),
    [handleMarkRead]
  );

  const keyExtractor = useCallback((item: Notification) => item.id, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Notifications
          {unreadCount > 0 ? (
            <Text style={styles.badge}>{`  ${unreadCount}`}</Text>
          ) : null}
        </Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={actions.markAllRead}>
            <Text style={styles.markAll}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[
              styles.chip,
              state.activeFilter === f.value && styles.chipActive,
            ]}
            onPress={() => actions.setFilter(f.value)}
          >
            <Text
              style={[
                styles.chipText,
                state.activeFilter === f.value && styles.chipTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {state.isLoading && displayed.length === 0 ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#007aff" />
        </View>
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={
            displayed.length === 0 ? styles.emptyContainer : styles.list
          }
          refreshControl={
            <RefreshControl
              refreshing={state.isLoading}
              onRefresh={load}
              tintColor="#007aff"
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="No notifications"
              subtitle={
                state.services.some((s) => s.connected)
                  ? "You're all caught up!"
                  : 'Connect a service on the Connect tab to get started.'
              }
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f7' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: { fontSize: 28, fontWeight: '700', color: '#1c1c1e' },
  badge: { fontSize: 20, color: '#007aff' },
  markAll: { fontSize: 14, color: '#007aff' },
  filterRow: { paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#e5e5ea',
  },
  chipActive: { backgroundColor: '#007aff' },
  chipText: { fontSize: 14, fontWeight: '500', color: '#3c3c43' },
  chipTextActive: { color: '#ffffff' },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingVertical: 8, paddingBottom: 32 },
  emptyContainer: { flex: 1 },
});
