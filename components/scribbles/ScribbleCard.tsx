import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Scribble } from '@/types/models';
import { useTheme } from '@/contexts/ThemeContext';
import { useScribbles } from '@/hooks/useScribbles';
import { format } from 'date-fns';

interface ScribbleCardProps {
  scribble: Scribble;
  onPress: () => void;
  onRefetch: () => void;
}

const SWIPE_THRESHOLD = 100;

export function ScribbleCard({ scribble, onPress, onRefetch }: ScribbleCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { deleteScribble, togglePin } = useScribbles();
  const translateX = useSharedValue(0);

  const handleDelete = async () => {
    resetPosition();
    Alert.alert('Delete Note', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteScribble(scribble.id);
            onRefetch();
          } catch (error: any) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ]);
  };

  const handlePin = async () => {
    resetPosition();
    try {
      await togglePin(scribble.id);
      onRefetch();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const resetPosition = () => {
    translateX.value = withSpring(0);
  };

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      // Swipe left (negative) for delete
      if (e.translationX < 0) {
        translateX.value = Math.max(e.translationX, -SWIPE_THRESHOLD);
      }
      // Swipe right (positive) for pin
      else if (e.translationX > 0) {
        translateX.value = Math.min(e.translationX, SWIPE_THRESHOLD);
      }
    })
    .onEnd((e) => {
      if (e.translationX < -SWIPE_THRESHOLD * 0.7) {
        // Swiped left enough - trigger delete
        runOnJS(handleDelete)();
      } else if (e.translationX > SWIPE_THRESHOLD * 0.7) {
        // Swiped right enough - trigger pin
        runOnJS(handlePin)();
      } else {
        // Not enough swipe - reset
        translateX.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const deleteActionStyle = useAnimatedStyle(() => {
    const opacity = translateX.value < -20 ? Math.abs(translateX.value) / SWIPE_THRESHOLD : 0;
    return {
      opacity,
      transform: [{ translateX: translateX.value + SWIPE_THRESHOLD }],
    };
  });

  const pinActionStyle = useAnimatedStyle(() => {
    const opacity = translateX.value > 20 ? translateX.value / SWIPE_THRESHOLD : 0;
    return {
      opacity,
      transform: [{ translateX: translateX.value - SWIPE_THRESHOLD }],
    };
  });

  const getSubtitle = () => {
    if (scribble.date) {
      const date = new Date(scribble.date);
      return format(date, 'MMM d, yyyy');
    }
    if (scribble.body) {
      return scribble.body.substring(0, 50) + (scribble.body.length > 50 ? '...' : '');
    }
    return 'No content';
  };

  return (
    <View className="px-6 mb-3">
      <View className="relative">
        {/* Delete Action (Left) */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              backgroundColor: '#EF4444',
              borderRadius: 16,
              justifyContent: 'center',
              alignItems: 'flex-end',
              paddingRight: 20,
            },
            deleteActionStyle,
          ]}
        >
          <View className="flex-row items-center">
            <Ionicons name="trash" size={24} color="#FFFFFF" />
            <Text className="text-white font-semibold ml-2">Delete</Text>
          </View>
        </Animated.View>

        {/* Pin Action (Right) */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              backgroundColor: '#F59E0B',
              borderRadius: 16,
              justifyContent: 'center',
              alignItems: 'flex-start',
              paddingLeft: 20,
            },
            pinActionStyle,
          ]}
        >
          <View className="flex-row items-center">
            <Ionicons name="pin" size={24} color="#FFFFFF" />
            <Text className="text-white font-semibold ml-2">Pin</Text>
          </View>
        </Animated.View>

        {/* Card */}
        <GestureDetector gesture={panGesture}>
          <Animated.View style={cardStyle}>
            <TouchableOpacity
              className={`rounded-2xl p-4 ${isDark ? '' : 'bg-gray-100'}`}
              style={
                isDark
                  ? {
                      backgroundColor: '#000000',
                      borderWidth: 1,
                      borderColor: '#27272A',
                    }
                  : undefined
              }
              onPress={onPress}
            >
              <View className="flex-row items-start">
                {scribble.pinned && (
                  <Ionicons
                    name="pin"
                    size={16}
                    color="#F59E0B"
                    style={{ marginRight: 8, marginTop: 2 }}
                  />
                )}
                <View className="flex-1">
                  <Text
                    className={`text-lg font-semibold mb-1 ${
                      isDark ? 'text-white' : 'text-black'
                    }`}
                    numberOfLines={1}
                  >
                    {scribble.title}
                  </Text>
                  <Text
                    className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                    numberOfLines={2}
                  >
                    {getSubtitle()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
}
