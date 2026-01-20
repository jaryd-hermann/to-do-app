import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
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

  const { goals, loading, createGoal, updateGoal, deleteGoal, activateGoal, achieveGoal, activeGoals } =
    useGoals();
  const { principles } = usePrinciples();
  const [actionCounts, setActionCounts] = useState<Record<string, number>>({});

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

  const priorityGoal = activeGoals.find((g) => g.position === 0);
  const otherActiveGoals = activeGoals.filter((g) => g.position > 0);
  const inactiveGoals = goals.filter((g) => g.status === 'inactive');

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
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
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
          onSubmit={createGoal}
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
        <View className="pt-20 pb-4">
          <Text className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
            My Goals
          </Text>
        </View>

        {/* My Goals Section */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
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

        {/* Priority Goal */}
        {priorityGoal && (
          <View className="mb-6">
            <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              PRIORITY GOAL
            </Text>
            <GoalCard
              goal={priorityGoal}
              isPriority
              actionCount={actionCounts[priorityGoal.id] || 0}
              principleTitle={principles.find((p) => p.id === priorityGoal.principle_id)?.title}
              onEdit={() => {
                setEditingGoal(priorityGoal);
                setShowGoalForm(true);
              }}
              onDelete={() => handleDelete(priorityGoal)}
            />
          </View>
        )}

        {/* Active Goals */}
        {otherActiveGoals.length > 0 && (
          <View className="mb-6">
            <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              ACTIVE GOALS
            </Text>
            {otherActiveGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                actionCount={actionCounts[goal.id] || 0}
                principleTitle={principles.find((p) => p.id === goal.principle_id)?.title}
                onEdit={() => {
                  setEditingGoal(goal);
                  setShowGoalForm(true);
                }}
                onDelete={() => handleDelete(goal)}
              />
            ))}
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

        {/* Marketing Carousel */}
        <MarketingCarousel cards={marketingCards} hideSeen={true} />
      </ScrollView>

      <GoalForm
        visible={showGoalForm}
        onClose={() => {
          setShowGoalForm(false);
          setEditingGoal(null);
        }}
        onSubmit={editingGoal ? updateGoal : createGoal}
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
  actionCount,
  onEdit,
  onDelete,
  onActivate,
}: {
  goal: Goal;
  isPriority?: boolean;
  isInactive?: boolean;
  actionCount: number;
  onEdit?: () => void;
  onDelete: () => void;
  onActivate?: () => void;
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <View
      className={`rounded-2xl p-4 mb-3 ${isPriority ? 'border-2 border-white' : ''} ${
        isDark ? '' : 'bg-gray-100'
      }`}
      style={isDark ? { backgroundColor: '#000000' } : undefined}
    >
      <View className="flex-row items-start">
        <View className="flex-1">
          <Text className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
            {goal.title}
          </Text>
          {goal.description && (
            <Text className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {goal.description}
            </Text>
          )}
          <View className="flex-row items-center">
            {principleTitle && (
              <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                • {principleTitle}
              </Text>
            )}
            <Text className={`text-xs ml-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {actionCount} {actionCount === 1 ? 'action' : 'actions'}
            </Text>
          </View>
        </View>
        <View className="items-end">
          {onEdit && (
            <TouchableOpacity onPress={onEdit} className="mb-2">
              <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Edit</Text>
            </TouchableOpacity>
          )}
          {onActivate && (
            <TouchableOpacity onPress={onActivate} className="mb-2">
              <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Activate</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onDelete}>
            <Ionicons name="trash-outline" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function GoalForm({
  visible,
  onClose,
  onSubmit,
  goal,
  principles,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (title: string, principleId: string, description?: string) => Promise<void>;
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

  const selectedPrinciple = principles.find((p) => p.id === selectedPrincipleId);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={goal ? 'Edit Goal' : 'New Goal'}>
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
          Select principle
        </Text>
        <Text className={`${selectedPrinciple ? '' : 'text-gray-500'} ${isDark ? 'text-white' : 'text-black'}`}>
          {selectedPrinciple ? selectedPrinciple.title : 'Choose a principle'}
        </Text>
      </TouchableOpacity>
      {showPrinciplePicker && (
        <View className={`rounded-2xl mb-6 ${isDark ? '' : 'bg-gray-100'}`} style={isDark ? { backgroundColor: '#27272A', paddingBottom: 8 } : undefined}>
          {principles.map((principle) => (
            <TouchableOpacity
              key={principle.id}
              className={`py-3 px-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
              style={isDark ? { backgroundColor: '#27272A' } : undefined}
              onPress={() => {
                setSelectedPrincipleId(principle.id);
                setShowPrinciplePicker(false);
              }}
            >
              <Text className={isDark ? 'text-white' : 'text-black'}>{principle.title}</Text>
            </TouchableOpacity>
          ))}
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
