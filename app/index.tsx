import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { View, Image, ActivityIndicator } from 'react-native';

export default function Index() {
  const { user, subscriptionStatus, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center' }}>
        <Image
          source={require('../assets/icon.png')}
          style={{ width: 96, height: 96, marginBottom: 16 }}
          resizeMode="contain"
        />
        <ActivityIndicator size="small" color="#FFFFFF" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (subscriptionStatus === 'expired') {
    return <Redirect href="/(auth)/paywall" />;
  }

  return <Redirect href="/(tabs)/today" />;
}
