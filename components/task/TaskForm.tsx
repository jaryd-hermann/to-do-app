import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Task, Principle, Goal } from '@/types/models';
import { useTheme } from '@/contexts/ThemeContext';

interface TaskFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (title: string, principleIds: string[], goalIds?: string[], makePrimary?: boolean) => Promise<void>;
  onDelete?: () => void;
  task?: Task | null;
  principles: Principle[];
  goals: Goal[];
}

export function TaskForm({
  visible,
  onClose,
  onSubmit,
  onDelete,
  task,
  principles,
  goals,
}: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [selectedPrincipleIds, setSelectedPrincipleIds] = useState<string[]>([]);
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>([]);
  const [showPrinciplePicker, setShowPrinciplePicker] = useState(false);
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [makePrimary, setMakePrimary] = useState(false);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      // For now, load single principle_id as array (will support multiple when DB schema is updated)
      setSelectedPrincipleIds(task.principle_id ? [task.principle_id] : []);
      // For now, load single goal_id as array (will support multiple when DB schema is updated)
      setSelectedGoalIds(task.goal_id ? [task.goal_id] : []);
      setMakePrimary(false); // Reset when task changes
    } else {
      setTitle('');
      setSelectedPrincipleIds([]);
      setSelectedGoalIds([]);
      setMakePrimary(false);
    }
  }, [task, visible]);

  const handleSubmit = async () => {
    if (!title.trim() || selectedPrincipleIds.length === 0) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(title.trim(), selectedPrincipleIds, selectedGoalIds, makePrimary);
      onClose();
      setTitle('');
      setSelectedPrincipleIds([]);
      setSelectedGoalIds([]);
      setMakePrimary(false);
    } catch (error: any) {
      alert(error.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const selectedPrinciples = principles.filter((p) => selectedPrincipleIds.includes(p.id));
  const selectedGoals = goals.filter((g) => selectedGoalIds.includes(g.id));

  const togglePrinciple = (principleId: string) => {
    setSelectedPrincipleIds((prev) => 
      prev.includes(principleId) 
        ? prev.filter((id) => id !== principleId)
        : [...prev, principleId]
    );
  };

  const toggleGoal = (goalId: string) => {
    setSelectedGoalIds((prev) => 
      prev.includes(goalId) 
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId]
    );
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title={task ? 'Edit Task' : 'New Task'} onDelete={task ? onDelete : undefined}>
      <ScrollView>
        {/* Task Title - Moved to top */}
        <TextInput
          className={`py-4 px-4 rounded-2xl mb-4 ${isDark ? '' : 'bg-gray-100'}`}
          style={isDark ? { backgroundColor: '#18181B', color: '#FFFFFF' } : { color: '#000000' }}
          placeholder="today, I will.."
          placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
          value={title}
          onChangeText={setTitle}
        />

        {/* Principle Selector */}
        <TouchableOpacity
          className={`py-4 px-4 rounded-2xl mb-4 ${isDark ? '' : 'bg-gray-100'}`}
          style={isDark ? { backgroundColor: '#18181B' } : undefined}
          onPress={() => setShowPrinciplePicker(!showPrinciplePicker)}
        >
          <Text className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            What principle does this align to
          </Text>
          <Text className={`${selectedPrinciples.length > 0 ? '' : 'text-gray-500'} ${isDark ? 'text-white' : 'text-black'}`}>
            {selectedPrinciples.length > 0 
              ? selectedPrinciples.map(p => p.title).join(', ')
              : 'Choose principles'}
          </Text>
        </TouchableOpacity>

        {showPrinciplePicker && (
          <View className={`rounded-2xl mb-6 ${isDark ? '' : 'bg-gray-100'}`} style={isDark ? { backgroundColor: '#000000', paddingBottom: 12, paddingHorizontal: 4 } : undefined}>
            <ScrollView style={{ maxHeight: 180 }} showsVerticalScrollIndicator={true}>
              {principles.map((principle, index) => {
                const isSelected = selectedPrincipleIds.includes(principle.id);
                return (
                  <TouchableOpacity
                    key={principle.id}
                    className={`py-3 px-4 mb-2 flex-row items-center ${index < principles.length - 1 ? '' : ''}`}
                    style={{
                      backgroundColor: isDark ? '#27272A' : '#E5E7EB',
                      borderRadius: 5,
                    }}
                    onPress={() => togglePrinciple(principle.id)}
                  >
                    <View className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
                      isSelected
                        ? isDark ? 'bg-white border-white' : 'bg-black border-black'
                        : isDark ? 'border-gray-600' : 'border-gray-400'
                    }`}>
                      {isSelected && (
                        <Ionicons
                          name="checkmark"
                          size={12}
                          color={isDark ? '#000000' : '#FFFFFF'}
                        />
                      )}
                    </View>
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
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Goal Selector */}
        <TouchableOpacity
          className={`py-4 px-4 rounded-2xl mb-4 ${isDark ? '' : 'bg-gray-100'}`}
          style={isDark ? { backgroundColor: '#18181B' } : undefined}
          onPress={() => setShowGoalPicker(!showGoalPicker)}
        >
          <Text className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Does this move a goal forward?
          </Text>
          <Text className={`${selectedGoals.length > 0 ? '' : 'text-gray-500'} ${isDark ? 'text-white' : 'text-black'}`}>
            {selectedGoals.length > 0 
              ? selectedGoals.map(g => g.title).join(', ')
              : 'Choose goals (optional)'}
          </Text>
        </TouchableOpacity>

        {showGoalPicker && (
          <View className={`rounded-2xl mb-6 ${isDark ? '' : 'bg-gray-100'}`} style={isDark ? { backgroundColor: '#000000', paddingBottom: 12, paddingHorizontal: 4 } : undefined}>
            {goals.map((goal, index) => {
              const isSelected = selectedGoalIds.includes(goal.id);
              return (
                <TouchableOpacity
                  key={goal.id}
                  className={`py-2 px-3 mb-2 flex-row items-center ${index < goals.length - 1 ? '' : ''}`}
                  style={{
                    backgroundColor: isDark ? '#27272A' : '#E5E7EB',
                    borderRadius: 5,
                  }}
                  onPress={() => toggleGoal(goal.id)}
                >
                  <View className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
                    isSelected
                      ? isDark ? 'bg-white border-white' : 'bg-black border-black'
                      : isDark ? 'border-gray-600' : 'border-gray-400'
                  }`}>
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={12}
                        color={isDark ? '#000000' : '#FFFFFF'}
                      />
                    )}
                  </View>
                  <Text className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                    {goal.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Make Primary Option - Only show for editing non-primary tasks */}
        {task && task.position !== 0 && (
          <TouchableOpacity
            className={`py-4 px-4 rounded-2xl mb-6 ${isDark ? '' : 'bg-gray-100'}`}
            style={isDark ? { 
              backgroundColor: makePrimary ? '#27272A' : '#18181B',
              borderWidth: makePrimary ? 1 : 0,
              borderColor: '#FFFFFF'
            } : undefined}
            onPress={() => setMakePrimary(!makePrimary)}
          >
            <View className="flex-row items-center">
              <View className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
                makePrimary 
                  ? isDark ? 'bg-white border-white' : 'bg-black border-black'
                  : isDark ? 'border-gray-600' : 'border-gray-400'
              }`}>
                {makePrimary && (
                  <Ionicons
                    name="checkmark"
                    size={12}
                    color={isDark ? '#000000' : '#FFFFFF'}
                  />
                )}
              </View>
              <Text className={`${isDark ? 'text-white' : 'text-black'}`}>
                Make this my main focus
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          className={`py-4 rounded-full ${isDark ? 'bg-white' : 'bg-black'}`}
          onPress={handleSubmit}
          disabled={loading || !title.trim() || selectedPrincipleIds.length === 0}
        >
          <Text className={`text-center font-semibold ${isDark ? 'text-black' : 'text-white'}`}>
            {loading ? 'Saving...' : task ? 'Update Task' : 'Add Task'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </BottomSheet>
  );
}
