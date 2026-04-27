import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ServiceType } from '../types';

interface ServiceBadgeProps {
  service: ServiceType;
  size?: 'small' | 'medium';
}

const SERVICE_META: Record<ServiceType, { label: string; color: string; bg: string }> = {
  github: { label: 'GH', color: '#ffffff', bg: '#24292f' },
  gmail: { label: 'GM', color: '#ffffff', bg: '#EA4335' },
  slack: { label: 'SL', color: '#ffffff', bg: '#4A154B' },
};

export function ServiceBadge({ service, size = 'medium' }: ServiceBadgeProps): React.JSX.Element {
  const meta = SERVICE_META[service];
  const dim = size === 'small' ? 24 : 32;
  const fontSize = size === 'small' ? 9 : 11;

  return (
    <View
      style={[
        styles.badge,
        { width: dim, height: dim, borderRadius: dim / 2, backgroundColor: meta.bg },
      ]}
    >
      <Text style={[styles.label, { color: meta.color, fontSize }]}>{meta.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
