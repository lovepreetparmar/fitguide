import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View } from 'react-native';
import { WebShell } from '@/components/layout/WebShell';

const tabScreens = [
  { name: 'index', title: 'Home', icon: 'home' as const },
  { name: 'workout', title: 'Workout', icon: 'barbell' as const },
  { name: 'exercises', title: 'Exercises', icon: 'list' as const },
  { name: 'progress', title: 'Progress', icon: 'trending-up' as const },
  { name: 'profile', title: 'Profile', icon: 'person' as const },
];

function TabNavigator() {
  const isWeb = Platform.OS === 'web';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: isWeb
          ? { display: 'none' }
          : {
              backgroundColor: '#161616',
              borderTopColor: '#2A2A2A',
              borderTopWidth: 1,
              height: Platform.OS === 'ios' ? 88 : 64,
              paddingBottom: Platform.OS === 'ios' ? 28 : 8,
              paddingTop: 8,
            },
        tabBarActiveTintColor: '#6C63FF',
        tabBarInactiveTintColor: '#666666',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      {tabScreens.map((screen) => (
        <Tabs.Screen
          key={screen.name}
          name={screen.name}
          options={{
            title: screen.title,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name={screen.icon} size={size} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

export default function TabsLayout() {
  if (Platform.OS === 'web') {
    return (
      <WebShell>
        <View className="flex-1">
          <TabNavigator />
        </View>
      </WebShell>
    );
  }

  return <TabNavigator />;
}
