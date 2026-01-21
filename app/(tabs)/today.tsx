import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useDailyTasks } from '@/hooks/useTasks';
import { usePrinciples } from '@/hooks/usePrinciples';
import { useGoals } from '@/hooks/useGoals';
import { TaskCard } from '@/components/task/TaskCard';
import { TaskForm } from '@/components/task/TaskForm';
import { MarketingCarousel } from '@/components/marketing/MarketingCarousel';
import { DailyHabitsSection } from '@/components/habits/DailyHabitsSection';
import { Task } from '@/types/models';
import { useTheme } from '@/contexts/ThemeContext';
import { format, startOfWeek, addDays, isSameDay, isToday, isPast, isFuture } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { useDailyWisdom } from '@/hooks/useDailyWisdom';
import { useScribbles } from '@/hooks/useScribbles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DAY_CARD_WIDTH = 50 + 8; // card width + margin

export default function TodayScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const dayScrollViewRef = useRef<ScrollView>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const { tasks, loading, createTask, updateTask, deleteTask, reorderTasks, toggleComplete, refetch } =
    useDailyTasks(selectedDate);
  const { principles } = usePrinciples();
  const { activeGoals } = useGoals();
  const { wisdom } = useDailyWisdom(selectedDate);
  const { getScribbleByDate, refetch: refetchScribbles } = useScribbles();

  // Refetch scribbles when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refetchScribbles();
    }, [refetchScribbles])
  );

  // Get 7 days back, current day, and 7 days forward (15 days total)
  const dayNavigation = useMemo(() => {
    const today = new Date();
    const days: Date[] = [];
    // 7 days back
    for (let i = 7; i > 0; i--) {
      days.push(addDays(today, -i));
    }
    // Current day
    days.push(today);
    // 7 days forward
    for (let i = 1; i <= 7; i++) {
      days.push(addDays(today, i));
    }
    return days;
  }, []); // Recalculate when app loads or when needed

  // Center the current day in the timeline on mount
  useEffect(() => {
    if (dayScrollViewRef.current && dayNavigation.length > 0) {
      // Current day is at index 7 (7 days back + today)
      const currentDayIndex = 7;
      // Account for padding (px-6 = 24px on each side)
      const padding = 24;
      const visibleWidth = SCREEN_WIDTH - (padding * 2);
      // Calculate scroll position to center the current day
      const scrollPosition = (currentDayIndex * DAY_CARD_WIDTH) - (visibleWidth / 2) + (DAY_CARD_WIDTH / 2);
      
      // Small delay to ensure ScrollView is rendered
      setTimeout(() => {
        dayScrollViewRef.current?.scrollTo({
          x: Math.max(0, scrollPosition),
          animated: false,
        });
      }, 100);
    }
  }, []);

  const handleCreateTask = async (title: string, principleId: string, goalId?: string | null) => {
    await createTask(title, principleId, goalId);
  };

  const handleUpdateTask = async (title: string, principleId: string, goalId?: string | null, makePrimary?: boolean) => {
    if (!editingTask) return;
    
    if (makePrimary && editingTask.position !== 0) {
      // Reorder tasks: move current primary to position 1, and this task to position 0
      // All tasks between position 0 and editingTask.position shift up by 1
      const currentTasks = [...tasks].sort((a, b) => a.position - b.position);
      const updatedTasks = currentTasks.map(t => {
        if (t.id === editingTask.id) {
          return { ...t, position: 0, title, principle_id: principleId, goal_id: goalId || null };
        } else if (t.position === 0) {
          // Current primary becomes position 1
          return { ...t, position: 1 };
        } else if (t.position > 0 && t.position < editingTask.position) {
          // Tasks between primary and the promoted task shift up
          return { ...t, position: t.position + 1 };
        }
        // Tasks after the promoted task stay the same
        return t;
      });
      
      // Update task fields first
      await updateTask(editingTask.id, { title, principle_id: principleId, goal_id: goalId });
      // Then reorder (this will refetch tasks)
      await reorderTasks(updatedTasks);
      // Ensure UI is updated
      await refetch();
    } else {
      await updateTask(editingTask.id, { title, principle_id: principleId, goal_id: goalId });
      await refetch();
    }
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTask(taskId);
          } catch (error: any) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ]);
  };

  const handleDragEnd = async ({ data }: { data: Task[] }) => {
    await reorderTasks(data);
  };

  const renderTask = ({ item, drag, isActive }: RenderItemParams<Task>) => {
    const principle = principles.find((p) => p.id === item.principle_id);
    const goal = item.goal_id ? activeGoals.find((g) => g.id === item.goal_id) : null;
    const isPrimary = item.position === 0;

    return (
      <TaskCard
        task={item}
        isPrimary={isPrimary}
        principleTitle={principle?.title}
        goalTitle={goal?.title}
        onToggleComplete={() => toggleComplete(item.id)}
        onDelete={() => handleDeleteTask(item.id)}
        onEdit={() => {
          setEditingTask(item);
          setShowTaskForm(true);
        }}
      />
    );
  };

  const canAddTask = tasks.length < 4 && tasks.some((t) => t.position === 0);

  // Marketing cards for Today page
  const marketingCards = [
    {
      id: 'philosophy',
      title: 'The Mindjoy Philosophy',
      subtitle: '8 insights on focus and prioritization',
      route: '/story/philosophy',
      badge: '8 insights',
    },
    {
      id: 'tips',
      title: 'Writing your principles',
      subtitle: '8 tips for crafting meaningful principles',
      route: '/story/tips',
      badge: '8 tips',
    },
    {
      id: 'goals',
      title: 'Learn about Goals',
      subtitle: '8 insights on goal setting and achievement',
      route: '/story/goals',
      badge: '8 insights',
    },
  ];

  return (
    <View className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-16 pb-6">
        <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
          Mindjoy - do today
        </Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/settings')}>
          <Ionicons name="menu" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
        </TouchableOpacity>
      </View>

      {/* Day Selector */}
      <ScrollView
        ref={dayScrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-6"
        contentContainerStyle={{ paddingRight: 16, paddingBottom: 4 }}
        style={{ maxHeight: 60 }}
      >
        {dayNavigation.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);
          const isPastDate = isPast(day) && !isTodayDate;
          const isFutureDate = isFuture(day) && !isTodayDate;

          return (
            <TouchableOpacity
              key={day.toISOString()}
              className={`px-3 rounded-lg mr-2 items-center justify-center ${
                isSelected
                  ? isDark
                    ? 'bg-white'
                    : 'bg-black'
                  : isDark
                  ? 'bg-gray-900'
                  : 'bg-gray-100'
              }`}
              style={{
                backgroundColor: isSelected
                  ? isDark
                    ? '#FFFFFF'
                    : '#000000'
                  : isDark
                  ? '#18181B'
                  : '#F3F4F6',
                width: 50,
                height: 50,
                paddingTop: 0,
                paddingBottom: 0,
                opacity: isPastDate ? 0.5 : 1,
              }}
              onPress={() => setSelectedDate(day)}
            >
              <Text
                className={`text-xs font-semibold ${
                  isSelected
                    ? isDark
                      ? 'text-black'
                      : 'text-white'
                    : isDark
                    ? 'text-gray-500'
                    : 'text-gray-600'
                }`}
                style={{ 
                  lineHeight: 12, 
                  marginBottom: 2,
                  textDecorationLine: isPastDate ? 'line-through' : 'none',
                }}
              >
                {format(day, 'EEE').toUpperCase()}
              </Text>
              <Text
                className={`text-base font-bold ${
                  isSelected
                    ? isDark
                      ? 'text-black'
                      : 'text-white'
                    : isDark
                    ? 'text-gray-400'
                    : 'text-gray-700'
                }`}
                style={{ 
                  lineHeight: 18,
                  textDecorationLine: isPastDate ? 'line-through' : 'none',
                }}
              >
                {format(day, 'd')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Task List */}
      {tasks.length === 0 ? (
        <ScrollView 
          className="px-6" 
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Daily Wisdom Placeholder */}
          {wisdom && (
            <View className="mb-6">
              <Text className={`text-sm leading-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} style={{ fontStyle: 'italic' }}>
                {wisdom.quote}
              </Text>
            </View>
          )}

          <TouchableOpacity
            className={`flex-row items-center justify-center py-12 rounded-2xl mb-4 ${
              isDark ? '' : 'bg-gray-100'
            }`}
            style={isDark ? { backgroundColor: '#18181B' } : undefined}
            onPress={() => {
              setEditingTask(null);
              setShowTaskForm(true);
            }}
          >
            <Ionicons
              name="add"
              size={24}
              color={isDark ? '#FFFFFF' : '#000000'}
            />
            <Text className={`ml-2 text-lg font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
              Add something to do
            </Text>
          </TouchableOpacity>

          {/* Daily Habits Section */}
          <DailyHabitsSection date={selectedDate} />

          {/* Daily Scribble Section */}
          <View className="mb-6" style={{ paddingHorizontal: 24 }}>
            <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              thoughts, ideas, reflections, etc
            </Text>
            {(() => {
              const dateStr = format(selectedDate, 'yyyy-MM-dd');
              const existingScribble = getScribbleByDate(dateStr);
              
              if (existingScribble) {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      router.push({
                        pathname: '/scribbles/editor',
                        params: { id: existingScribble.id, returnTo: 'today' },
                      });
                    }}
                    className={`rounded-2xl p-4 ${isDark ? '' : 'bg-gray-100'}`}
                    style={isDark ? { backgroundColor: '#000000', borderWidth: 1, borderColor: '#27272A' } : undefined}
                  >
                    <Text className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
                      {existingScribble.title}
                    </Text>
                    {existingScribble.body && (
                      <Text
                        className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                        numberOfLines={2}
                      >
                        {existingScribble.body}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              } else {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      router.push({
                        pathname: '/scribbles/editor',
                        params: { date: dateStr, returnTo: 'today' },
                      });
                    }}
                  >
                    <Text
                      className={`text-base underline ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      today's scribble
                    </Text>
                  </TouchableOpacity>
                );
              }
            })()}
          </View>

          {/* Marketing Carousel */}
          <MarketingCarousel cards={marketingCards} hideSeen={true} />
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          {/* Today's Focus Header */}
          <View className="px-6 pt-4 pb-2">
            <Text className={`text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              today's focus
            </Text>
          </View>
          <DraggableFlatList
            data={tasks}
            onDragEnd={handleDragEnd}
            keyExtractor={(item) => item.id}
            renderItem={renderTask}
            scrollEnabled={true}
            contentContainerStyle={{ 
              paddingHorizontal: 24, 
              paddingTop: 8, 
              paddingBottom: 20
            }}
            ItemSeparatorComponent={null}
            ListFooterComponent={
            <>
              {/* Add Task Button */}
              {canAddTask && (
                <TouchableOpacity
                  className={`flex-row items-center justify-center py-4 rounded-2xl mb-6 ${
                    isDark ? '' : 'bg-gray-100'
                  }`}
                  style={isDark ? { backgroundColor: '#18181B' } : undefined}
                  onPress={() => {
                    setEditingTask(null);
                    setShowTaskForm(true);
                  }}
                >
                  <Ionicons
                    name="add"
                    size={24}
                    color={isDark ? '#FFFFFF' : '#000000'}
                  />
                  <Text className={`ml-2 font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                    something to do
                  </Text>
                </TouchableOpacity>
              )}

              {/* Daily Habits Section */}
              <DailyHabitsSection date={selectedDate} />

              {/* Daily Scribble Section */}
              <View className="mb-6" style={{ paddingHorizontal: 24 }}>
                <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  thoughts, ideas, reflections, etc
                </Text>
                {(() => {
                  const dateStr = format(selectedDate, 'yyyy-MM-dd');
                  const existingScribble = getScribbleByDate(dateStr);
                  
                  if (existingScribble) {
                    return (
                      <TouchableOpacity
                        onPress={() => {
                          router.push({
                            pathname: '/scribbles/editor',
                            params: { id: existingScribble.id, returnTo: 'today' },
                          });
                        }}
                        className={`rounded-2xl p-4 ${isDark ? '' : 'bg-gray-100'}`}
                        style={isDark ? { backgroundColor: '#000000', borderWidth: 1, borderColor: '#27272A' } : undefined}
                      >
                        <Text className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
                          {existingScribble.title}
                        </Text>
                        {existingScribble.body && (
                          <Text
                            className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                            numberOfLines={2}
                          >
                            {existingScribble.body}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  } else {
                    return (
                      <TouchableOpacity
                        onPress={() => {
                          router.push({
                            pathname: '/scribbles/editor',
                            params: { date: dateStr, returnTo: 'today' },
                          });
                        }}
                      >
                        <Text
                          className={`text-base underline ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                        >
                          today's scribble
                        </Text>
                      </TouchableOpacity>
                    );
                  }
                })()}
              </View>

              {/* Marketing Carousel */}
              <MarketingCarousel cards={marketingCards} hideSeen={true} />
            </>
            }
          />
        </View>
      )}

      {/* Task Form Modal */}
      <TaskForm
        visible={showTaskForm}
        onClose={() => {
          setShowTaskForm(false);
          setEditingTask(null);
        }}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
        principles={principles}
        goals={activeGoals}
      />
    </View>
  );
}
