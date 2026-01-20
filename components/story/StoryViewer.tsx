import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, ScrollView, Modal } from 'react-native';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useSeenStories } from '@/hooks/useSeenStories';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Story {
  id: string;
  headline: string;
  body: string;
}

interface StoryViewerProps {
  visible: boolean;
  onClose: () => void;
  stories: Story[];
  title: string;
  storyId?: string; // ID to track if this story has been seen
}

export function StoryViewer({ visible, onClose, stories, title, storyId }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const translateX = useSharedValue(0);
  const { markStoryAsSeen } = useSeenStories();

  useEffect(() => {
    // When user reaches the last slide, mark story as seen
    if (visible && storyId && currentIndex === stories.length - 1) {
      markStoryAsSeen(storyId);
    }
  }, [currentIndex, visible, storyId, stories.length, markStoryAsSeen]);

  if (!visible || stories.length === 0) return null;

  const currentStory = stories[currentIndex];

  const goToNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      translateX.value = 0;
    } else {
      // Mark as seen when closing from last slide
      if (storyId) {
        markStoryAsSeen(storyId);
      }
      onClose();
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      translateX.value = 0;
    }
  };

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX > 100) {
        // Swipe right - previous
        runOnJS(goToPrevious)();
      } else if (e.translationX < -100) {
        // Swipe left - next
        runOnJS(goToNext)();
      }
      translateX.value = withTiming(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Modal visible={visible} animationType="fade" transparent={false}>
      <GestureHandlerRootView style={{ flex: 1 }}>
      <View className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-12 pb-4">
        <View className="flex-row items-center flex-1">
          <View className="w-8 h-8 bg-white rounded-full items-center justify-center mr-3">
            <Text className="text-black text-sm font-bold">M</Text>
          </View>
          <Text className={`text-lg font-semibold flex-1 ${isDark ? 'text-white' : 'text-black'}`}>
            {title}
          </Text>
        </View>
        <View className="flex-row items-center">
          <View className="bg-red-500 px-3 py-1 rounded-full mr-4">
            <Text className="text-white text-xs font-semibold">
              {currentIndex + 1} of {stories.length}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Bar */}
      <View className="flex-row px-6 mb-8">
        {stories.map((_, index) => (
          <View
            key={index}
            className={`flex-1 h-1 mx-1 rounded-full ${
              index <= currentIndex
                ? isDark
                  ? 'bg-white'
                  : 'bg-black'
                : isDark
                ? 'bg-gray-800'
                : 'bg-gray-300'
            }`}
          />
        ))}
      </View>

      {/* Story Content */}
      <GestureDetector gesture={panGesture}>
        <Animated.View className="flex-1 px-6" style={animatedStyle}>
          <View className="flex-1 justify-center">
            <Text
              className={`text-4xl font-bold text-center mb-8 ${isDark ? 'text-white' : 'text-black'}`}
            >
              {currentStory.headline}
            </Text>
            <Text
              className={`text-lg leading-7 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            >
              {currentStory.body}
            </Text>
          </View>
        </Animated.View>
      </GestureDetector>

      {/* Navigation */}
      <View className="flex-row items-center justify-between px-6 pb-8">
        <TouchableOpacity
          onPress={goToPrevious}
          disabled={currentIndex === 0}
          className={`w-12 h-12 rounded-full items-center justify-center ${
            currentIndex === 0
              ? isDark
                ? 'bg-gray-800'
                : 'bg-gray-200'
              : isDark
              ? 'bg-gray-700'
              : 'bg-gray-300'
          }`}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={currentIndex === 0 ? (isDark ? '#4B5563' : '#9CA3AF') : (isDark ? '#FFFFFF' : '#000000')}
          />
        </TouchableOpacity>

        <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {currentIndex === stories.length - 1 ? 'Tap to close' : 'Tap to advance'}
        </Text>

        <TouchableOpacity
          onPress={goToNext}
          className={`w-12 h-12 rounded-full items-center justify-center ${
            isDark ? 'bg-white' : 'bg-black'
          }`}
        >
          <Ionicons
            name="chevron-forward"
            size={24}
            color={isDark ? '#000000' : '#FFFFFF'}
          />
        </TouchableOpacity>
      </View>
      </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
