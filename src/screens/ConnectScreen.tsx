import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  saveGitHubToken,
  removeGitHubToken,
  hasGitHubToken,
} from '../services/github';
import {
  saveGmailToken,
  removeGmailToken,
  hasGmailToken,
} from '../services/gmail';
import {
  saveSlackToken,
  removeSlackToken,
  hasSlackToken,
} from '../services/slack';
import { useNotificationStore } from '../store/notificationStore';
import { ServiceBadge } from '../components/ServiceBadge';
import { ServiceType } from '../types';

interface ServiceRowProps {
  service: ServiceType;
  name: string;
  description: string;
  connected: boolean;
  onConnect: (token: string) => Promise<void>;
  onDisconnect: () => Promise<void>;
}

function ServiceRow({
  service,
  name,
  description,
  connected,
  onConnect,
  onDisconnect,
}: ServiceRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);

  const handleConnect = useCallback(async () => {
    if (!token.trim()) {
      Alert.alert('Token required', 'Please paste your access token.');
      return;
    }
    setBusy(true);
    await onConnect(token.trim());
    setToken('');
    setExpanded(false);
    setBusy(false);
  }, [token, onConnect]);

  const handleDisconnect = useCallback(async () => {
    Alert.alert(
      `Disconnect ${name}`,
      'Your token will be removed from this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            await onDisconnect();
            setBusy(false);
          },
        },
      ]
    );
  }, [name, onDisconnect]);

  return (
    <View style={styles.row}>
      <View style={styles.rowHeader}>
        <ServiceBadge service={service} size="medium" />
        <View style={styles.rowInfo}>
          <Text style={styles.rowName}>{name}</Text>
          <Text style={styles.rowDesc}>{description}</Text>
        </View>
        {busy ? (
          <ActivityIndicator size="small" color="#007aff" />
        ) : connected ? (
          <TouchableOpacity onPress={handleDisconnect} style={styles.btnDanger}>
            <Text style={styles.btnDangerText}>Disconnect</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => setExpanded((v) => !v)}
            style={styles.btnPrimary}
          >
            <Text style={styles.btnPrimaryText}>
              {expanded ? 'Cancel' : 'Connect'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {expanded && !connected && (
        <View style={styles.tokenForm}>
          <TextInput
            style={styles.input}
            placeholder="Paste your token here"
            placeholderTextColor="#8e8e93"
            value={token}
            onChangeText={setToken}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
          />
          <TouchableOpacity
            style={[styles.btnPrimary, styles.saveBtn]}
            onPress={handleConnect}
          >
            <Text style={styles.btnPrimaryText}>Save</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export function ConnectScreen() {
  const [state, actions] = useNotificationStore();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const checkConnections = async () => {
      const [gh, gm, sl] = await Promise.all([
        hasGitHubToken(),
        hasGmailToken(),
        hasSlackToken(),
      ]);
      actions.setServiceConnected('github', gh);
      actions.setServiceConnected('gmail', gm);
      actions.setServiceConnected('slack', sl);
    };
    void checkConnections();
  }, [actions]);

  const getConnected = (type: ServiceType) =>
    state.services.find((s) => s.type === type)?.connected ?? false;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <Text style={styles.heading}>Connect Services</Text>
      <Text style={styles.subheading}>
        Your tokens are stored securely on this device and never leave it.
      </Text>

      <ServiceRow
        service="github"
        name="GitHub"
        description="Get PR, review, and mention notifications."
        connected={getConnected('github')}
        onConnect={async (t) => {
          await saveGitHubToken(t);
          actions.setServiceConnected('github', true);
        }}
        onDisconnect={async () => {
          await removeGitHubToken();
          actions.setServiceConnected('github', false);
        }}
      />

      <ServiceRow
        service="gmail"
        name="Gmail"
        description="See unread emails from your inbox."
        connected={getConnected('gmail')}
        onConnect={async (t) => {
          await saveGmailToken(t);
          actions.setServiceConnected('gmail', true);
        }}
        onDisconnect={async () => {
          await removeGmailToken();
          actions.setServiceConnected('gmail', false);
        }}
      />

      <ServiceRow
        service="slack"
        name="Slack"
        description="See recent messages from your channels."
        connected={getConnected('slack')}
        onConnect={async (t) => {
          await saveSlackToken(t);
          actions.setServiceConnected('slack', true);
        }}
        onDisconnect={async () => {
          await removeSlackToken();
          actions.setServiceConnected('slack', false);
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f7' },
  content: { paddingHorizontal: 16 },
  heading: { fontSize: 28, fontWeight: '700', color: '#1c1c1e', marginBottom: 6 },
  subheading: { fontSize: 14, color: '#8e8e93', marginBottom: 24, lineHeight: 20 },
  row: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  rowHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowInfo: { flex: 1 },
  rowName: { fontSize: 16, fontWeight: '600', color: '#1c1c1e' },
  rowDesc: { fontSize: 13, color: '#8e8e93', marginTop: 2 },
  btnPrimary: {
    backgroundColor: '#007aff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  btnPrimaryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  btnDanger: {
    backgroundColor: '#ff3b30',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  btnDangerText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  tokenForm: { marginTop: 12 },
  input: {
    backgroundColor: '#f2f2f7',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1c1c1e',
    marginBottom: 8,
  },
  saveBtn: { alignSelf: 'flex-end' },
});
