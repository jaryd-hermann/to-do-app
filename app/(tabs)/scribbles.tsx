import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useScribbles } from '@/hooks/useScribbles';
import { Scribble } from '@/types/models';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ScribbleCard } from '@/components/scribbles/ScribbleCard';

export default function ScribblesScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { scribbles, loading, getScribblesBySection, getTotalCount, refetch } = useScribbles();
  const sections = getScribblesBySection();
  const [pinnedExpanded, setPinnedExpanded] = useState(true);

  // Refetch scribbles when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleCreateNote = () => {
    router.push({
      pathname: '/scribbles/editor',
      params: { returnTo: 'scribbles' },
    });
  };

  const handleOpenNote = (scribble: Scribble) => {
    router.push({
      pathname: '/scribbles/editor',
      params: { id: scribble.id, returnTo: 'scribbles' },
    });
  };

  const handleOpenDailyScribble = (date: string) => {
    router.push({
      pathname: '/scribbles/editor',
      params: { date, returnTo: 'scribbles' },
    });
  };

  const renderSection = (title: string, items: Scribble[], showCollapse: boolean = false, isPinned: boolean = false) => {
    if (items.length === 0) return null;

    const isExpanded = isPinned ? pinnedExpanded : true;

    return (
      <View className="mb-6">
        <TouchableOpacity
          className="flex-row items-center justify-between mb-3 px-6"
          onPress={showCollapse ? () => setPinnedExpanded(!pinnedExpanded) : undefined}
          disabled={!showCollapse}
        >
          <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
            {title}
          </Text>
          {showCollapse && (
            <Ionicons
              name={isExpanded ? 'chevron-down' : 'chevron-forward'}
              size={20}
              color={isDark ? '#FFFFFF' : '#000000'}
            />
          )}
        </TouchableOpacity>
        {isExpanded && items.map((scribble) => (
          <ScribbleCard
            key={scribble.id}
            scribble={scribble}
            onPress={() => handleOpenNote(scribble)}
            onRefetch={refetch}
          />
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`}>
        <View className="pt-16 px-6 pb-4">
          <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
            Scribbles
          </Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading...</Text>
        </View>
      </View>
    );
  }

  const totalCount = getTotalCount();
  const hasNotes = totalCount > 0;

  return (
    <View className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`}>
      {/* Header */}
      <View className="pt-20 px-6 pb-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
            Scribbles
          </Text>
          <TouchableOpacity
            className={`px-4 py-2 rounded-xl border ${isDark ? 'bg-white border-white' : 'bg-black border-black'}`}
            onPress={handleCreateNote}
          >
            <View className="flex-row items-center">
              <Ionicons name="add" size={20} color={isDark ? '#000000' : '#FFFFFF'} />
              <Text className={`ml-1 font-semibold ${isDark ? 'text-black' : 'text-white'}`}>
                Add
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {totalCount} {totalCount === 1 ? 'Note' : 'Notes'}
        </Text>
      </View>

      {!hasNotes ? (
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          <View className="mb-6">
            <Text className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-black'}`}>
              Today
            </Text>
            <TouchableOpacity
              onPress={() => handleOpenDailyScribble(format(new Date(), 'yyyy-MM-dd'))}
              className={`flex-row items-center justify-center py-4 rounded-2xl ${
                isDark ? '' : 'bg-gray-100'
              }`}
              style={isDark ? { backgroundColor: '#18181B' } : undefined}
            >
              <Ionicons
                name="add"
                size={24}
                color={isDark ? '#FFFFFF' : '#000000'}
              />
              <Text className={`ml-2 font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                Add a daily scribble
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {renderSection('Pinned', sections.pinned, true, true)}
          {sections.today.length === 0 ? (
            <View className="mb-6 px-6">
              <Text className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-black'}`}>
                Today
              </Text>
              <TouchableOpacity
                onPress={() => handleOpenDailyScribble(format(new Date(), 'yyyy-MM-dd'))}
                className={`flex-row items-center justify-center py-4 rounded-2xl ${
                  isDark ? '' : 'bg-gray-100'
                }`}
                style={isDark ? { backgroundColor: '#18181B' } : undefined}
              >
                <Ionicons
                  name="add"
                  size={24}
                  color={isDark ? '#FFFFFF' : '#000000'}
                />
                <Text className={`ml-2 font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                  Add a daily scribble
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            renderSection('Today', sections.today)
          )}
          {renderSection('Yesterday', sections.yesterday)}
          {renderSection('Previous 30 Days', sections.previous30Days)}
          {renderSection('Older', sections.older)}
        </ScrollView>
      )}
    </View>
  );
}
