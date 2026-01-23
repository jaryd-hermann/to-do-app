import { Tabs } from 'expo-router';
import { Image } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function TabsLayout() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? '#FFFFFF' : '#000000',
        tabBarInactiveTintColor: isDark ? '#6B7280' : '#9CA3AF',
        tabBarStyle: {
          backgroundColor: isDark ? '#000000' : '#FFFFFF',
          borderTopColor: isDark ? '#1F2937' : '#E5E7EB',
        },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: 'Today',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../assets/task.png')}
              style={{ width: 28, height: 28, opacity: focused ? 1 : 0.6 }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="principles"
        options={{
          title: 'Principles',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../assets/pillar.png')}
              style={{ width: 28, height: 28, opacity: focused ? 1 : 0.6 }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Goals',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../assets/goal.png')}
              style={{ width: 28, height: 28, opacity: focused ? 1 : 0.6 }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="scribbles"
        options={{
          title: 'Scribbles',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../assets/scribble.png')}
              style={{ width: 28, height: 28, opacity: focused ? 1 : 0.6 }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../assets/progress.png')}
              style={{ width: 28, height: 28, opacity: focused ? 1 : 0.6 }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null, // Hide from tab bar
          tabBarStyle: { display: 'none' }, // Hide tab bar on settings screen
        }}
      />
    </Tabs>
  );
}
