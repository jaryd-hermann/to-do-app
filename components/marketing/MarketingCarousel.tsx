import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useSeenStories } from '@/hooks/useSeenStories';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 96; // Narrower cards (48px padding + 48px to show next card)
const CARD_SPACING = 12; // Space between cards

interface MarketingCard {
  id: string;
  title: string;
  subtitle: string;
  route: string;
  badge?: string;
}

interface MarketingCarouselProps {
  cards: MarketingCard[];
  hideSeen?: boolean; // If true, filter out seen cards
}

export function MarketingCarousel({ cards, hideSeen = false }: MarketingCarouselProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const { isStorySeen, markStoryAsSeen } = useSeenStories();

  // Filter out seen cards if hideSeen is true
  // Use refreshKey to force recalculation when stories are marked as seen
  const visibleCards = React.useMemo(() => {
    return hideSeen ? cards.filter(card => !isStorySeen(card.id)) : cards;
  }, [cards, hideSeen, isStorySeen, refreshKey]);

  // Don't render if no visible cards
  if (visibleCards.length === 0) {
    return null;
  }

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (CARD_WIDTH + CARD_SPACING));
    setCurrentIndex(index);
  };

  const handleCardPress = (route: string) => {
    router.push(route as any);
  };

  const handleMarkAsSeen = async (cardId: string, e: any) => {
    e.stopPropagation();
    await markStoryAsSeen(cardId);
    // Force re-render to update visible cards
    setRefreshKey(prev => prev + 1);
  };

  return (
    <View className="mb-8">
      {/* Logo and Title Above Card */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View className="w-8 h-8 mr-3 overflow-hidden" style={{ borderRadius: 5 }}>
            <Image
              source={require('../../assets/icon.png')}
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>
          <Text className={`text-base font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
            {visibleCards[currentIndex]?.title || visibleCards[0]?.title}
          </Text>
        </View>
        {hideSeen && visibleCards[currentIndex] && !isStorySeen(visibleCards[currentIndex].id) && (
          <TouchableOpacity
            onPress={(e) => handleMarkAsSeen(visibleCards[currentIndex].id, e)}
            className="px-3 py-1 rounded-full"
            style={{ backgroundColor: isDark ? '#27272A' : '#E5E7EB' }}
          >
            <Text className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
              mark as seen
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Carousel */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingRight: 24 }}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
      >
        {visibleCards.map((card) => (
          <TouchableOpacity
            key={card.id}
            onPress={() => handleCardPress(card.route)}
            style={{ width: CARD_WIDTH, marginRight: 12 }}
            activeOpacity={0.9}
          >
            <View
              className={`rounded-2xl overflow-hidden ${isDark ? '' : 'bg-gray-100'}`}
              style={isDark ? { backgroundColor: '#18181B' } : undefined}
            >
              {/* Image */}
              <View className="w-full" style={{ height: 280 }}>
                <Image
                  source={
                    card.id === 'philosophy'
                      ? require('../../assets/1.png')
                      : card.id === 'tips'
                      ? require('../../assets/2.png')
                      : card.id === 'goals'
                      ? require('../../assets/3.png')
                      : require('../../assets/placeholder.jpg')
                  }
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>

              {/* Content */}
              <View className="p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                    {card.title}
                  </Text>
                  {card.badge && (
                    <View className="bg-red-500 px-3 py-1 rounded-full">
                      <Text className="text-white text-xs font-semibold">{card.badge}</Text>
                    </View>
                  )}
                </View>
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {card.subtitle}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Page Indicators */}
      <View className="flex-row justify-center mt-4">
        {visibleCards.map((_, index) => (
          <View
            key={index}
            className={`h-1 rounded-full mx-1 ${
              index === currentIndex
                ? isDark
                  ? 'bg-white'
                  : 'bg-black'
                : isDark
                ? 'bg-gray-700'
                : 'bg-gray-300'
            }`}
            style={{
              width: index === currentIndex ? 24 : 8,
            }}
          />
        ))}
      </View>
    </View>
  );
}
