import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { ConnectScreen } from '../screens/ConnectScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useNotificationStore } from '../store/notificationStore';
import { countUnread } from '../services/aggregator';

const Tab = createBottomTabNavigator();

function TabIcon({ icon, badge }: { icon: string; badge?: number }) {
  return (
    <Text style={{ fontSize: 20 }}>
      {icon}
      {badge != null && badge > 0 ? ` (${badge > 99 ? '99+' : badge})` : ''}
    </Text>
  );
}

export function AppNavigator() {
  const [state] = useNotificationStore();
  const unread = countUnread(state.notifications);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopColor: '#e5e5ea',
          },
          tabBarActiveTintColor: '#007aff',
          tabBarInactiveTintColor: '#8e8e93',
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Notifications',
            tabBarIcon: () => <TabIcon icon="🔔" badge={unread} />,
          }}
        />
        <Tab.Screen
          name="Connect"
          component={ConnectScreen}
          options={{
            tabBarLabel: 'Connect',
            tabBarIcon: () => <TabIcon icon="🔗" />,
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarLabel: 'Settings',
            tabBarIcon: () => <TabIcon icon="⚙️" />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
