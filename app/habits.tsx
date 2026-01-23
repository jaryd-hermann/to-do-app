import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useHabits } from '@/hooks/useHabits';
import { SystemHabit, UserHabit } from '@/types/models';
import { CustomHabitModal } from '@/components/habits/CustomHabitModal';

export default function HabitsScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const {
    systemHabits,
    userHabits,
    selectedHabits,
    loading,
    saveSelectedHabits,
    refetch,
  } = useHabits();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedTypes, setSelectedTypes] = useState<Map<string, 'system' | 'custom'>>(new Map());
  const [showCustomHabitModal, setShowCustomHabitModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<UserHabit | null>(null);

  useEffect(() => {
    // Initialize selected habits
    const ids = new Set<string>();
    const types = new Map<string, 'system' | 'custom'>();
    selectedHabits.forEach((habit) => {
      ids.add(habit.habit_id);
      types.set(habit.habit_id, habit.habit_type);
    });
    setSelectedIds(ids);
    setSelectedTypes(types);
  }, [selectedHabits]);

  const toggleSelection = (habitId: string, habitType: 'system' | 'custom') => {
    const newSelectedIds = new Set(selectedIds);
    const newSelectedTypes = new Map(selectedTypes);

    if (newSelectedIds.has(habitId)) {
      newSelectedIds.delete(habitId);
      newSelectedTypes.delete(habitId);
    } else {
      newSelectedIds.add(habitId);
      newSelectedTypes.set(habitId, habitType);
    }

    setSelectedIds(newSelectedIds);
    setSelectedTypes(newSelectedTypes);
  };

  const handleSave = async () => {
    try {
      // Create a snapshot of the Set and Map to avoid modification during iteration
      const idsArray = Array.from(selectedIds);
      const habitsToSave = idsArray.map((id) => ({
        id,
        type: selectedTypes.get(id)!,
      }));
      await saveSelectedHabits(habitsToSave);
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save habits');
    }
  };

  const handleEditCustom = (habit: UserHabit) => {
    setEditingHabit(habit);
    setShowCustomHabitModal(true);
  };

  const handleOpenCustomModal = () => {
    setEditingHabit(null);
    setShowCustomHabitModal(true);
  };

  const isSelected = (habitId: string) => selectedIds.has(habitId);

  return (
    <View className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-16 pb-4">
        <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
          Daily Habits
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <Text className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Select habits you want to track daily. Tap any habit to add or remove it.
        </Text>

        {/* Selected Count */}
        <View
          className={`rounded-2xl p-4 mb-6 ${isDark ? '' : 'bg-gray-100'}`}
          style={isDark ? { backgroundColor: '#18181B' } : undefined}
        >
          <Text className={`text-base ${isDark ? 'text-white' : 'text-black'}`}>
            {selectedIds.size} {selectedIds.size === 1 ? 'habit' : 'habits'} selected
          </Text>
        </View>

        {/* Popular Habits */}
        <Text className={`text-xs font-semibold mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          POPULAR HABITS
        </Text>
        <View className="flex-row flex-wrap mb-6">
          {systemHabits.map((habit) => {
            const selected = isSelected(habit.id);
            return (
              <TouchableOpacity
                key={habit.id}
                onPress={() => toggleSelection(habit.id, 'system')}
                className={`px-4 py-2 rounded-full mr-2 mb-2 ${
                  selected ? '' : ''
                }`}
                style={
                  selected
                    ? { backgroundColor: '#FFFFFF', borderWidth: 0 }
                    : isDark
                    ? { backgroundColor: '#18181B', borderWidth: 1, borderColor: '#27272A' }
                    : { backgroundColor: '#F3F4F6', borderWidth: 0 }
                }
              >
                <View className="flex-row items-center">
                  {selected && (
                    <Ionicons name="checkmark" size={16} color="#000000" style={{ marginRight: 6 }} />
                  )}
                  <Text
                    className={`text-sm font-medium ${
                      selected ? 'text-black' : isDark ? 'text-white' : 'text-black'
                    }`}
                  >
                    {habit.title}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Custom Habits */}
        {userHabits.length > 0 && (
          <>
            <View className="border-t border-gray-700 my-6" />
            <Text className={`text-xs font-semibold mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              YOUR HABITS
            </Text>
            <View className="flex-row flex-wrap mb-6">
              {userHabits.map((habit) => {
                const selected = isSelected(habit.id);
                return (
                  <TouchableOpacity
                    key={habit.id}
                    onPress={() => toggleSelection(habit.id, 'custom')}
                    onLongPress={() => handleEditCustom(habit)}
                    className={`px-4 py-2 rounded-full mr-2 mb-2 ${
                      selected ? '' : ''
                    }`}
                    style={
                      selected
                        ? { backgroundColor: '#FFFFFF', borderWidth: 0 }
                        : isDark
                        ? { backgroundColor: '#18181B', borderWidth: 1, borderColor: '#27272A' }
                        : { backgroundColor: '#F3F4F6', borderWidth: 0 }
                    }
                  >
                    <View className="flex-row items-center">
                      {selected && (
                        <Ionicons name="checkmark" size={16} color="#000000" style={{ marginRight: 6 }} />
                      )}
                      <Text
                        className={`text-sm font-medium ${
                          selected ? 'text-black' : isDark ? 'text-white' : 'text-black'
                        }`}
                      >
                        {habit.title}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* Add Custom Habit Button */}
        <View className="border-t border-gray-700 my-6" />
        <TouchableOpacity
          onPress={handleOpenCustomModal}
          className={`flex-row items-center py-4 ${isDark ? '' : ''}`}
        >
          <Ionicons name="add" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
          <Text className={`ml-2 text-base font-medium ${isDark ? 'text-white' : 'text-black'}`}>
            Add your own
          </Text>
        </TouchableOpacity>

        <View className="h-20" />
      </ScrollView>

      {/* Save Button */}
      <View className="px-6 pb-8 pt-4" style={{ borderTopWidth: 1, borderTopColor: isDark ? '#27272A' : '#E5E7EB' }}>
        <TouchableOpacity
          onPress={handleSave}
          className={`py-4 rounded-full ${isDark ? 'bg-white' : 'bg-black'}`}
        >
          <Text className={`text-center font-semibold ${isDark ? 'text-black' : 'text-white'}`}>
            Save Habits
          </Text>
        </TouchableOpacity>
      </View>

      {/* Custom Habit Modal */}
      <CustomHabitModal
        visible={showCustomHabitModal}
        onClose={() => {
          setShowCustomHabitModal(false);
          setEditingHabit(null);
        }}
        habit={editingHabit}
        onEditComplete={async () => {
          // Refetch habits to show the newly added habit
          await refetch();
          setShowCustomHabitModal(false);
          setEditingHabit(null);
        }}
      />
    </View>
  );
}
