import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  rightActionLabel?: string;
  leftActionLabel?: string;
  rightActionColor?: string;
  leftActionColor?: string;
  rightActionIcon?: string;
  leftActionIcon?: string;
  disabled?: boolean;
}

const SWIPE_THRESHOLD = 100;

export function SwipeableCard({
  children,
  onSwipeRight,
  onSwipeLeft,
  rightActionLabel = 'Edit',
  leftActionLabel = 'Delete',
  rightActionColor = '#3B82F6',
  leftActionColor = '#EF4444',
  rightActionIcon = 'create-outline',
  leftActionIcon = 'trash',
  disabled = false,
}: SwipeableCardProps) {
  const translateX = useSharedValue(0);
  const { Ionicons } = require('@expo/vector-icons');

  const resetPosition = () => {
    translateX.value = withSpring(0);
  };

  const handleSwipeRight = () => {
    resetPosition();
    onSwipeRight();
  };

  const handleSwipeLeft = () => {
    resetPosition();
    onSwipeLeft();
  };

  const panGesture = Gesture.Pan()
    .enabled(!disabled)
    .onUpdate((e) => {
      // Swipe left (negative) for delete
      if (e.translationX < 0) {
        translateX.value = Math.max(e.translationX, -SWIPE_THRESHOLD);
      }
      // Swipe right (positive) for edit
      else if (e.translationX > 0) {
        translateX.value = Math.min(e.translationX, SWIPE_THRESHOLD);
      }
    })
    .onEnd((e) => {
      if (e.translationX < -SWIPE_THRESHOLD * 0.7) {
        // Swiped left enough - trigger delete
        runOnJS(handleSwipeLeft)();
      } else if (e.translationX > SWIPE_THRESHOLD * 0.7) {
        // Swiped right enough - trigger edit
        runOnJS(handleSwipeRight)();
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

  const editActionStyle = useAnimatedStyle(() => {
    const opacity = translateX.value > 20 ? translateX.value / SWIPE_THRESHOLD : 0;
    return {
      opacity,
      transform: [{ translateX: translateX.value - SWIPE_THRESHOLD }],
    };
  });

  return (
    <View className="relative mb-3">
      {/* Delete Action (Left) */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: leftActionColor,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'flex-end',
            paddingRight: 20,
          },
          deleteActionStyle,
        ]}
      >
        <View className="flex-row items-center">
          <Ionicons name={leftActionIcon} size={24} color="#FFFFFF" />
          <Text className="text-white font-semibold ml-2">{leftActionLabel}</Text>
        </View>
      </Animated.View>

      {/* Edit Action (Right) */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: rightActionColor,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'flex-start',
            paddingLeft: 20,
          },
          editActionStyle,
        ]}
      >
        <View className="flex-row items-center">
          <Ionicons name={rightActionIcon} size={24} color="#FFFFFF" />
          <Text className="text-white font-semibold ml-2">{rightActionLabel}</Text>
        </View>
      </Animated.View>

      {/* Card */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={cardStyle}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
