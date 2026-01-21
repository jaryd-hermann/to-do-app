import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useWeeklyProgress } from '@/hooks/useProgress';
import { useAllTimeProgress } from '@/hooks/useAllTimeProgress';
import { usePrinciples } from '@/hooks/usePrinciples';
import { useHabitProgress } from '@/hooks/useHabitProgress';
import { useAllTimeHabitProgress } from '@/hooks/useAllTimeHabitProgress';
import { useTheme } from '@/contexts/ThemeContext';
import { startOfWeek, addWeeks, subWeeks, format, addDays } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

export default function ProgressScreen() {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [viewMode, setViewMode] = useState<'weekly' | 'alltime'>('weekly');
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { progress: weeklyProgress, loading: weeklyLoading } = useWeeklyProgress(currentWeek);
  const { progress: allTimeProgress, loading: allTimeLoading } = useAllTimeProgress();
  const { principles } = usePrinciples();
  const { progress: weeklyHabitProgress, loading: habitLoading } = useHabitProgress(currentWeek);
  const { progress: allTimeHabitProgress, loading: allTimeHabitLoading } = useAllTimeHabitProgress();
  
  const habitProgress = viewMode === 'weekly' ? weeklyHabitProgress : allTimeHabitProgress;
  
  const progress = viewMode === 'weekly' ? weeklyProgress : allTimeProgress;
  const loading = viewMode === 'weekly' ? weeklyLoading : allTimeLoading;

  const goToPreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const weekStartStr = format(currentWeek, 'MMM d');
  const weekEnd = addWeeks(currentWeek, 1);
  const weekEndStr = format(weekEnd, 'MMM d');

  return (
    <View className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`}>
      <ScrollView className="flex-1 px-6">
        {/* Header */}
        <View className="pt-16 pb-6">
          <View className="flex-row items-center mb-6">
            <TouchableOpacity
              onPress={() => setViewMode('weekly')}
              className="mr-4"
            >
              <Text className={`text-2xl font-bold ${viewMode === 'weekly' ? (isDark ? 'text-white' : 'text-black') : (isDark ? 'text-gray-500' : 'text-gray-400')}`}>
                Weekly Progress
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setViewMode('alltime')}
            >
              <Text className={`text-2xl font-bold ${viewMode === 'alltime' ? (isDark ? 'text-white' : 'text-black') : (isDark ? 'text-gray-500' : 'text-gray-400')}`}>
                All Progress
              </Text>
            </TouchableOpacity>
          </View>
          {viewMode === 'weekly' && (
            <View className="flex-row items-center justify-between">
              <TouchableOpacity onPress={goToPreviousWeek}>
                <Ionicons name="chevron-back" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
              </TouchableOpacity>
              <View className="items-center">
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  This Week
                </Text>
                <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                  {weekStartStr} - {weekEndStr}
                </Text>
              </View>
              <TouchableOpacity onPress={goToNextWeek}>
                <Ionicons name="chevron-forward" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Completion Rate */}
        <View className={`rounded-2xl p-6 mb-4 ${isDark ? '' : 'bg-gray-100'}`} style={isDark ? { backgroundColor: '#000000', borderWidth: 1, borderColor: '#27272A' } : undefined}>
          <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Completion Rate
          </Text>
          <Text className={`text-5xl font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
            {Math.round(progress.completionRate)}%
          </Text>
          <Text className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {progress.completedTasks}/{progress.totalTasks} tasks
          </Text>
          <View className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}>
            <View
              className="h-2 rounded-full bg-white"
              style={{ width: `${progress.completionRate}%` }}
            />
          </View>
        </View>

        {/* Most Focused Principle */}
        <View className={`rounded-2xl p-6 mb-4 ${isDark ? '' : 'bg-gray-100'}`} style={isDark ? { backgroundColor: '#000000', borderWidth: 1, borderColor: '#27272A' } : undefined}>
          <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Most Focused Principle
          </Text>
          {progress.mostFocusedPrinciple ? (
            <>
              <View className="flex-row items-center mb-2">
                <View className="w-3 h-3 rounded-full bg-purple-500 mr-2" />
                <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                  {progress.mostFocusedPrinciple.title}
                </Text>
              </View>
              <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {progress.mostFocusedPrinciple.count} tasks completed
              </Text>
            </>
          ) : (
            <Text className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              No data yet
            </Text>
          )}
        </View>

        {/* Tasks by Principle - Bar Chart */}
        <View className={`rounded-2xl p-6 mb-4 ${isDark ? '' : 'bg-gray-100'}`} style={isDark ? { backgroundColor: '#000000', borderWidth: 1, borderColor: '#27272A' } : undefined}>
          <Text className={`text-sm font-semibold mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Tasks by Principle
          </Text>
          {Object.keys(progress.tasksByPrinciple).length > 0 ? (
            <View className="flex-row items-end justify-around h-32">
              {Object.entries(progress.tasksByPrinciple).map(([principleId, count]) => {
                const principle = principles.find((p) => p.id === principleId);
                const maxCount = Math.max(...Object.values(progress.tasksByPrinciple), 12);
                const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                const colors = ['#60A5FA', '#A78BFA', '#F472B6', '#34D399'];
                const colorIndex = Object.keys(progress.tasksByPrinciple).indexOf(principleId) % colors.length;
                
                return (
                  <View key={principleId} className="flex-1 items-center mx-1">
                    <View className="flex-1 justify-end w-full">
                      <View
                        className="w-full rounded-t"
                        style={{
                          height: `${height}%`,
                          backgroundColor: colors[colorIndex],
                          minHeight: count > 0 ? 4 : 0,
                        }}
                      />
                    </View>
                    <Text className={`text-xs mt-2 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`} numberOfLines={1}>
                      {principle?.title || 'Unknown'}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="flex-row items-end justify-around h-32">
              {principles.slice(0, 4).map((principle, index) => {
                const colors = ['#60A5FA', '#A78BFA', '#F472B6', '#34D399'];
                return (
                  <View key={principle.id} className="flex-1 items-center mx-1">
                    <View className="flex-1 justify-end w-full">
                      <View
                        className="w-full rounded-t opacity-30"
                        style={{
                          height: '0%',
                          backgroundColor: colors[index % colors.length],
                        }}
                      />
                    </View>
                    <Text className={`text-xs mt-2 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`} numberOfLines={1}>
                      {principle.title}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Principle Breakdown */}
        <View className={`rounded-2xl p-6 mb-4 ${isDark ? '' : 'bg-gray-100'}`} style={isDark ? { backgroundColor: '#000000', borderWidth: 1, borderColor: '#27272A' } : undefined}>
          <Text className={`text-sm font-semibold mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Principle Breakdown
          </Text>
          {Object.keys(progress.tasksByPrinciple).length > 0 ? (
            Object.entries(progress.tasksByPrinciple).map(([principleId, count]) => {
              const principle = principles.find((p) => p.id === principleId);
              const maxCount = Math.max(...Object.values(progress.tasksByPrinciple), 1);
              const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
              const colors = ['#60A5FA', '#A78BFA', '#F472B6', '#34D399'];
              const colorIndex = Object.keys(progress.tasksByPrinciple).indexOf(principleId) % colors.length;

              return (
                <View key={principleId} className="mb-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                      <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: colors[colorIndex] }} />
                      <Text className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                        {principle?.title || 'Unknown'}
                      </Text>
                    </View>
                    <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {count} tasks
                    </Text>
                  </View>
                  <View className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}>
                    <View
                      className="h-2 rounded-full"
                      style={{ width: `${percentage}%`, backgroundColor: colors[colorIndex] }}
                    />
                  </View>
                </View>
              );
            })
          ) : (
            principles.slice(0, 4).map((principle, index) => {
              const colors = ['#60A5FA', '#A78BFA', '#F472B6', '#34D399'];
              return (
                <View key={principle.id} className="mb-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                      <View className="w-2 h-2 rounded-full mr-2 opacity-50" style={{ backgroundColor: colors[index % colors.length] }} />
                      <Text className={`font-semibold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {principle.title}
                      </Text>
                    </View>
                    <Text className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      0 tasks
                    </Text>
                  </View>
                  <View className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}>
                    <View
                      className="h-2 rounded-full opacity-30"
                      style={{ width: '0%', backgroundColor: colors[index % colors.length] }}
                    />
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Daily Activity - Only show for weekly view */}
        {viewMode === 'weekly' && 'dailyCompletion' in progress && (
          <View className={`rounded-2xl p-6 mb-4 ${isDark ? '' : 'bg-gray-100'}`} style={isDark ? { backgroundColor: '#000000', borderWidth: 1, borderColor: '#27272A' } : undefined}>
            <Text className={`text-sm font-semibold mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Daily Activity
            </Text>
            <View className="flex-row justify-around">
              {Array.from({ length: 7 }, (_, i) => {
                const dayDate = addDays(currentWeek, i);
                const dayStr = format(dayDate, 'yyyy-MM-dd');
                const isCompleted = progress.dailyCompletion?.[dayStr];
                const dayName = format(dayDate, 'EEE');

              return (
                <View key={dayStr} className="items-center">
                  <View
                    className={`w-12 h-12 rounded-xl items-center justify-center mb-2 ${
                      isCompleted
                        ? isDark
                          ? 'bg-white'
                          : 'bg-black'
                        : isDark
                        ? 'bg-gray-700'
                        : 'bg-gray-300'
                    }`}
                  >
                    {isCompleted ? (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={isDark ? '#000000' : '#FFFFFF'}
                      />
                    ) : (
                      <View
                        className={`w-2 h-2 rounded-full ${
                          isDark ? 'bg-gray-500' : 'bg-gray-400'
                        }`}
                      />
                    )}
                  </View>
                  <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {dayName}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
        )}

        {/* Habit Progress */}
        {habitProgress.length > 0 && (
          <View className={`rounded-2xl p-6 mb-8 ${isDark ? '' : 'bg-gray-100'}`} style={isDark ? { backgroundColor: '#000000', borderWidth: 1, borderColor: '#27272A' } : undefined}>
            <Text className={`text-sm font-semibold mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Habit Breakdown
            </Text>
            {habitProgress.map((habit) => {
              const colors = ['#60A5FA', '#A78BFA', '#F472B6', '#34D399'];
              const colorIndex = habitProgress.indexOf(habit) % colors.length;
              const color = colors[colorIndex];

              return (
                <View key={`${habit.habit_id}-${habit.habit_type}`} className="mb-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                      <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: color }} />
                      <Text className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                        {habit.title}
                      </Text>
                    </View>
                    <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {habit.completed_days} of {habit.total_days} days
                    </Text>
                  </View>
                  <View className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}>
                    <View
                      className="h-2 rounded-full"
                      style={{ width: `${habit.completion_rate}%`, backgroundColor: color }}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
