import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useGoals } from '@/hooks/useGoals';
import { Goal } from '@/types/models';
import { useTheme } from '@/contexts/ThemeContext';
import { usePrinciples } from '@/hooks/usePrinciples';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { TextInput } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { MarketingCarousel } from '@/components/marketing/MarketingCarousel';

export default function GoalsScreen() {
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { user } = useAuth();

  const { goals, loading, createGoal, updateGoal, deleteGoal, activateGoal, achieveGoal, activeGoals, reorderGoals, refetch: refetchGoals } =
    useGoals();
  const { principles, refetch: refetchPrinciples } = usePrinciples();
  const [actionCounts, setActionCounts] = useState<Record<string, number>>({});
  const [completedGoalsExpanded, setCompletedGoalsExpanded] = useState(false);

  useEffect(() => {
    // Fetch action counts for all goals
    const fetchActionCounts = async () => {
      if (!user) return;
      const counts: Record<string, number> = {};
      for (const goal of goals) {
        const { count } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('goal_id', goal.id);
        counts[goal.id] = count || 0;
      }
      setActionCounts(counts);
    };
    fetchActionCounts();
  }, [goals, user]);

  const inactiveGoals = goals.filter((g) => g.status === 'inactive');
  const completedGoals = goals.filter((g) => g.status === 'achieved');

  // Debug logging
  useEffect(() => {
    console.log('Goals state:', {
      totalGoals: goals.length,
      activeGoals: activeGoals.length,
      activeGoalsData: activeGoals.map(g => ({ id: g.id, title: g.title, position: g.position, status: g.status })),
      inactiveGoals: inactiveGoals.length,
    });
  }, [goals, activeGoals, inactiveGoals]);

  const handleDragEnd = async ({ data }: { data: Goal[] }) => {
    try {
      // Reorder all active goals (including priority)
      // The data passed here should only contain active goals from the DraggableFlatList
      console.log('Reordering goals, data:', data.map(g => ({ id: g.id, title: g.title, position: g.position, status: g.status })));
      const activeData = data.filter(g => g.status === 'active');
      console.log('Active goals to reorder:', activeData.map(g => ({ id: g.id, title: g.title, position: g.position })));
      if (activeData.length > 0) {
        await reorderGoals(activeData);
        await refetchGoals();
        // Force a small delay to ensure state updates
        setTimeout(() => {
          refetchGoals();
        }, 100);
      }
    } catch (error: any) {
      console.error('Error reordering goals:', error);
      Alert.alert('Error', error.message || 'Failed to reorder goals');
      await refetchGoals(); // Refetch to restore original order
    }
  };

  const renderGoal = ({ item, drag, isActive }: RenderItemParams<Goal>) => {
    const handleLongPress = () => {
      // Silently ignore haptics errors - they don't affect functionality
      try {
        if (typeof Haptics !== 'undefined' && Haptics?.impactAsync) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        }
      } catch (e) {
        // Haptics not available, continue anyway
      }
      if (drag) {
        drag();
      }
    };

    return (
      <GoalCard
        goal={item}
        isPriority={item.position === 0}
        actionCount={actionCounts[item.id] || 0}
        principleTitle={principles.find((p) => p.id === item.principle_id)?.title}
        onEdit={() => {
          setEditingGoal(item);
          setShowGoalForm(true);
        }}
        onDelete={() => handleDelete(item)}
        onToggleComplete={async () => {
          try {
            await achieveGoal(item.id);
            await refetchGoals();
          } catch (error: any) {
            Alert.alert('Error', error.message);
          }
        }}
        onLongPress={handleLongPress}
        isDragging={isActive}
      />
    );
  };

  // Marketing cards for Goals page
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

  const handleDelete = (goal: Goal) => {
    Alert.alert('Delete Goal', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteGoal(goal.id);
            await refetchGoals();
            await refetchPrinciples();
          } catch (error: any) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ]);
  };

  const handleActivate = async (goal: Goal) => {
    try {
      await activateGoal(goal.id);
      await refetchGoals();
      await refetchPrinciples();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleCreateGoal = async (title: string, principleId: string, description?: string) => {
    try {
      await createGoal(title, principleId, description);
      await refetchGoals();
      await refetchPrinciples();
    } catch (error: any) {
      Alert.alert('Error', error.message);
      throw error; // Re-throw to let form handle it
    }
  };

  const handleUpdateGoal = async (goalId: string, updates: Partial<Goal>) => {
    try {
      await updateGoal(goalId, updates);
      await refetchGoals();
      await refetchPrinciples();
    } catch (error: any) {
      Alert.alert('Error', error.message);
      throw error; // Re-throw to let form handle it
    }
  };

  const handleUpdateGoalForForm = async (title: string, principleId: string, description?: string) => {
    if (!editingGoal) return;
    await handleUpdateGoal(editingGoal.id, { title, principle_id: principleId, description });
  };

  if (goals.length === 0) {
    return (
      <View className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`}>
        <View className="flex-1 px-6 pt-20">
          <View className="mb-4">
            <Text className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
              My Goals
            </Text>
          </View>
          <View className="flex-row items-center justify-between mb-8">
            <TouchableOpacity
              className={`px-4 py-2 rounded-xl border ${isDark ? 'bg-white border-white' : 'bg-black border-black'}`}
              onPress={() => {
                setEditingGoal(null);
                setShowGoalForm(true);
              }}
            >
              <View className="flex-row items-center">
                <Ionicons name="add" size={20} color={isDark ? '#000000' : '#FFFFFF'} />
                <Text className={`ml-1 font-semibold ${isDark ? 'text-black' : 'text-white'}`}>
                  Add
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Empty State - Marketing Carousel */}
          <MarketingCarousel cards={marketingCards} hideSeen={true} />
        </View>

        <GoalForm
          visible={showGoalForm}
          onClose={() => {
            setShowGoalForm(false);
            setEditingGoal(null);
          }}
          onSubmit={handleCreateGoal}
          goal={null}
          principles={principles}
        />
      </View>
    );
  }

  return (
    <View className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`}>
      <ScrollView className="flex-1 px-6">
        {/* Header */}
        <View className="pt-20 pb-4 flex-row items-center justify-between">
          <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
            My Goals
          </Text>
          <TouchableOpacity
            className={`px-4 py-2 rounded-xl border ${isDark ? 'bg-white border-white' : 'bg-black border-black'}`}
            onPress={() => {
              setEditingGoal(null);
              setShowGoalForm(true);
            }}
          >
            <View className="flex-row items-center">
              <Ionicons name="add" size={20} color={isDark ? '#000000' : '#FFFFFF'} />
              <Text className={`ml-1 font-semibold ${isDark ? 'text-black' : 'text-white'}`}>
                Add
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Active Goals - All active goals including priority in one draggable list */}
        {activeGoals.length > 0 && (
          <View className="mb-6 mt-6">
            <GestureHandlerRootView>
              <DraggableFlatList
                data={activeGoals}
                onDragEnd={handleDragEnd}
                keyExtractor={(item) => item.id}
                renderItem={renderGoal}
                scrollEnabled={false}
              />
            </GestureHandlerRootView>
          </View>
        )}

        {/* Inactive Goals */}
        {inactiveGoals.length > 0 && (
          <View className="mb-6">
            <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              INACTIVE GOALS ({inactiveGoals.length})
            </Text>
            {inactiveGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                isInactive
                actionCount={actionCounts[goal.id] || 0}
                principleTitle={principles.find((p) => p.id === goal.principle_id)?.title}
                onActivate={() => handleActivate(goal)}
                onDelete={() => handleDelete(goal)}
              />
            ))}
          </View>
        )}

        {/* Completed Goals - Collapsible */}
        {completedGoals.length > 0 && (
          <View className="mb-6">
            <TouchableOpacity
              onPress={() => setCompletedGoalsExpanded(!completedGoalsExpanded)}
              className="flex-row items-center justify-between mb-3"
            >
              <Text className={`text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                COMPLETED GOALS ({completedGoals.length})
              </Text>
              <Ionicons
                name={completedGoalsExpanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={isDark ? '#9CA3AF' : '#6B7280'}
              />
            </TouchableOpacity>
            {completedGoalsExpanded && (
              <View>
                {completedGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    isCompleted
                    actionCount={actionCounts[goal.id] || 0}
                    principleTitle={principles.find((p) => p.id === goal.principle_id)?.title}
                    onDelete={() => handleDelete(goal)}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Marketing Carousel */}
        <MarketingCarousel cards={marketingCards} hideSeen={true} />
      </ScrollView>

      <GoalForm
        visible={showGoalForm}
        onClose={() => {
          setShowGoalForm(false);
          setEditingGoal(null);
        }}
        onSubmit={editingGoal ? handleUpdateGoalForForm : handleCreateGoal}
        goal={editingGoal}
        principles={principles}
      />
    </View>
  );
}

function GoalCard({
  goal,
  isPriority,
  isInactive,
  isCompleted,
  actionCount,
  principleTitle,
  onEdit,
  onDelete,
  onActivate,
  onToggleComplete,
  onLongPress,
  isDragging,
}: {
  goal: Goal;
  isPriority?: boolean;
  isInactive?: boolean;
  isCompleted?: boolean;
  actionCount: number;
  principleTitle?: string;
  onEdit?: () => void;
  onDelete: () => void;
  onActivate?: () => void;
  onToggleComplete?: () => void;
  onLongPress?: () => void;
  isDragging?: boolean;
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <TouchableOpacity
      className={`rounded-2xl p-4 mb-3 ${isPriority ? 'border-2 border-white' : ''} ${
        isDark ? '' : 'bg-gray-100'
      }`}
      style={isDark ? { 
        backgroundColor: '#000000',
        borderWidth: isPriority ? 2 : (isDragging ? 2 : (!isInactive && !isCompleted ? 1 : 0)),
        borderColor: isPriority ? '#FFFFFF' : (isDragging ? '#FFFFFF' : (!isInactive && !isCompleted ? '#27272A' : 'transparent')),
        opacity: isDragging ? 0.8 : (goal.status === 'achieved' ? 0.5 : 1),
      } : {
        borderWidth: isPriority ? 2 : (isDragging ? 2 : (!isInactive && !isCompleted ? 1 : 0)),
        borderColor: isPriority ? '#000000' : (isDragging ? '#000000' : (!isInactive && !isCompleted ? '#E5E7EB' : 'transparent')),
        opacity: isDragging ? 0.8 : (goal.status === 'achieved' ? 0.5 : 1),
      }}
      onPress={onEdit}
      onLongPress={onLongPress}
      disabled={isDragging || isInactive || isCompleted}
    >
      <View className="flex-row items-start">
        {/* Checkbox for active goals */}
        {!isInactive && onToggleComplete && (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onToggleComplete();
            }}
            className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center mt-1 ${
              goal.status === 'achieved'
                ? isDark ? 'bg-white border-white' : 'bg-black border-black'
                : isDark ? 'border-gray-600' : 'border-gray-400'
            }`}
          >
            {goal.status === 'achieved' && (
              <Ionicons
                name="checkmark"
                size={16}
                color={isDark ? '#000000' : '#FFFFFF'}
              />
            )}
          </TouchableOpacity>
        )}
        <View className="flex-1">
          {isPriority && (
            <Text className={`text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              YOUR MAIN GOAL
            </Text>
          )}
          <Text className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-black'} ${goal.status === 'achieved' ? 'line-through' : ''}`}>
            {goal.title}
          </Text>
          {goal.description && (
            <Text className={`text-base mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {goal.description}
            </Text>
          )}
          <View className="flex-row items-center">
            {principleTitle && (
              <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                • {principleTitle}
              </Text>
            )}
            <Text className={`text-sm ml-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {actionCount} {actionCount === 1 ? 'action' : 'actions'}
            </Text>
          </View>
        </View>
        {onActivate && (
          <TouchableOpacity onPress={onActivate} className="ml-2">
            <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Activate</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

function GoalForm({
  visible,
  onClose,
  onSubmit,
  onDelete,
  goal,
  principles,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (title: string, principleId: string, description?: string) => Promise<void>;
  onDelete?: (goalId: string) => Promise<void>;
  goal?: Goal | null;
  principles: any[];
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPrincipleId, setSelectedPrincipleId] = useState('');
  const [showPrinciplePicker, setShowPrinciplePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  React.useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setDescription(goal.description || '');
      setSelectedPrincipleId(goal.principle_id);
    } else {
      setTitle('');
      setDescription('');
      setSelectedPrincipleId('');
    }
  }, [goal, visible]);

  const handleSubmit = async () => {
    if (!title.trim() || !selectedPrincipleId) return;

    setLoading(true);
    try {
      await onSubmit(title.trim(), selectedPrincipleId, description.trim() || undefined);
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!goal || !onDelete) return;
    Alert.alert('Delete Goal', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await onDelete(goal.id);
            onClose();
          } catch (error: any) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ]);
  };

  const selectedPrinciple = principles.find((p) => p.id === selectedPrincipleId);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={goal ? 'Edit Goal' : 'New Goal'} onDelete={goal ? handleDelete : undefined}>
      <TextInput
        className={`py-4 px-4 rounded-2xl mb-4 ${isDark ? '' : 'bg-gray-100'}`}
        style={isDark ? { backgroundColor: '#18181B', color: '#FFFFFF' } : { color: '#000000' }}
        placeholder="Title"
        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
        value={title}
        onChangeText={setTitle}
      />
      <TouchableOpacity
        className={`py-4 px-4 rounded-2xl mb-4 ${isDark ? '' : 'bg-gray-100'}`}
        style={isDark ? { backgroundColor: '#18181B' } : undefined}
        onPress={() => setShowPrinciplePicker(!showPrinciplePicker)}
      >
        <Text className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          What principle does this goal align to?
        </Text>
        <Text className={`${selectedPrinciple ? '' : 'text-gray-500'} ${isDark ? 'text-white' : 'text-black'}`}>
          {selectedPrinciple ? selectedPrinciple.title : 'Choose a principle'}
        </Text>
      </TouchableOpacity>
      {showPrinciplePicker && (
        <View className={`rounded-2xl mb-6 ${isDark ? '' : 'bg-gray-100'}`} style={isDark ? { backgroundColor: '#000000', paddingBottom: 12, paddingHorizontal: 4 } : undefined}>
          <ScrollView style={{ maxHeight: 180 }} showsVerticalScrollIndicator={true}>
            {principles.map((principle, index) => (
              <TouchableOpacity
                key={principle.id}
                className={`py-3 px-4 mb-2 flex-row items-center ${index < principles.length - 1 ? '' : ''}`}
                style={{
                  backgroundColor: isDark ? '#27272A' : '#E5E7EB',
                  borderRadius: 5,
                }}
                onPress={() => {
                  setSelectedPrincipleId(principle.id);
                  setShowPrinciplePicker(false);
                }}
              >
                <View className="flex-1">
                  <Text className={`font-semibold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {principle.title}
                  </Text>
                  {principle.description && (
                    <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                      {principle.description}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      <TextInput
        className={`py-4 px-4 rounded-2xl mb-6 ${isDark ? '' : 'bg-gray-100'}`}
        style={isDark ? { backgroundColor: '#18181B', color: '#FFFFFF' } : { color: '#000000' }}
        placeholder="Description (optional)"
        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />
      <TouchableOpacity
        className={`py-4 rounded-full ${isDark ? 'bg-white' : 'bg-black'}`}
        onPress={handleSubmit}
        disabled={loading || !title.trim() || !selectedPrincipleId}
      >
        <Text className={`text-center font-semibold ${isDark ? 'text-black' : 'text-white'}`}>
          {loading ? 'Saving...' : goal ? 'Update' : 'Create'}
        </Text>
      </TouchableOpacity>
    </BottomSheet>
  );
}
