import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Link } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

export default function WelcomeScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <View className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'} items-center justify-center px-6`}>
      {/* Logo */}
      <View className="w-24 h-24 mb-8">
        <Image
          source={require('../../assets/icon.png')}
          className="w-full h-full rounded-3xl"
          resizeMode="contain"
        />
      </View>

      {/* Headline */}
      <Text className={`text-4xl font-bold text-center mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
        Do fewer things.{'\n'}Do the right things.
      </Text>

      {/* Subheadline */}
      <Text className={`text-lg text-center mb-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        A daily to-do list aligned with your principles.
      </Text>

      {/* Continue Button */}
      <Link href="/(auth)/auth" asChild>
        <TouchableOpacity className={`w-full py-4 rounded-full ${isDark ? 'bg-white' : 'bg-black'}`}>
          <Text className={`text-center text-lg font-semibold ${isDark ? 'text-black' : 'text-white'}`}>
            Continue
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
