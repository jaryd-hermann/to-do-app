import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useDailyHabits } from '@/hooks/useDailyHabits';
import { SelectedHabit } from '@/types/models';

interface DailyHabitsSectionProps {
  date: Date;
}

export function DailyHabitsSection({ date }: DailyHabitsSectionProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { selectedHabits, toggleCompletion, isHabitCompleted, loading } = useDailyHabits(date);

  if (loading || selectedHabits.length === 0) {
    return null;
  }

  return (
    <View className="mb-6 px-6">
      <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        things you're trying to do daily
      </Text>
      <View className="flex-row flex-wrap">
        {selectedHabits.map((habit) => {
          const completed = isHabitCompleted(habit.habit_id, habit.habit_type);
          return (
            <TouchableOpacity
              key={`${habit.habit_id}-${habit.habit_type}`}
              onPress={() => toggleCompletion(habit.habit_id, habit.habit_type)}
              className={`px-4 py-2 rounded-full mr-2 mb-2 ${
                completed ? '' : ''
              }`}
              style={
                completed
                  ? {
                      backgroundColor: '#000000',
                      borderWidth: 1,
                      borderColor: '#FFFFFF',
                      opacity: 0.5,
                    }
                  : isDark
                  ? { backgroundColor: '#000000', borderWidth: 1, borderColor: '#27272A' }
                  : { backgroundColor: '#F3F4F6', borderWidth: 0 }
              }
            >
              <Text
                className={`text-sm font-medium ${
                  completed
                    ? 'text-white line-through'
                    : isDark
                    ? 'text-white'
                    : 'text-black'
                }`}
              >
                {habit.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
