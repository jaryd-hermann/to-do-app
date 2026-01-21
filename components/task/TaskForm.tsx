import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Task, Principle, Goal } from '@/types/models';
import { useTheme } from '@/contexts/ThemeContext';

interface TaskFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (title: string, principleId: string, goalId?: string | null, makePrimary?: boolean) => Promise<void>;
  task?: Task | null;
  principles: Principle[];
  goals: Goal[];
}

export function TaskForm({
  visible,
  onClose,
  onSubmit,
  task,
  principles,
  goals,
}: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [selectedPrincipleId, setSelectedPrincipleId] = useState<string>('');
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [showPrinciplePicker, setShowPrinciplePicker] = useState(false);
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [makePrimary, setMakePrimary] = useState(false);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setSelectedPrincipleId(task.principle_id);
      setSelectedGoalId(task.goal_id || null);
      setMakePrimary(false); // Reset when task changes
    } else {
      setTitle('');
      setSelectedPrincipleId('');
      setSelectedGoalId(null);
      setMakePrimary(false);
    }
  }, [task, visible]);

  const handleSubmit = async () => {
    if (!title.trim() || !selectedPrincipleId) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(title.trim(), selectedPrincipleId, selectedGoalId, makePrimary);
      onClose();
      setTitle('');
      setSelectedPrincipleId('');
      setSelectedGoalId(null);
      setMakePrimary(false);
    } catch (error: any) {
      alert(error.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const selectedPrinciple = principles.find((p) => p.id === selectedPrincipleId);
  const selectedGoal = goals.find((g) => g.id === selectedGoalId);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={task ? 'Edit Task' : 'New Task'}>
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
          <Text className={`${selectedPrinciple ? '' : 'text-gray-500'} ${isDark ? 'text-white' : 'text-black'}`}>
            {selectedPrinciple ? selectedPrinciple.title : 'Choose a principle'}
          </Text>
        </TouchableOpacity>

        {showPrinciplePicker && (
          <View className={`rounded-2xl mb-6 ${isDark ? '' : 'bg-gray-100'}`} style={isDark ? { backgroundColor: '#000000', paddingBottom: 12, paddingHorizontal: 4 } : undefined}>
            {principles.map((principle, index) => (
              <TouchableOpacity
                key={principle.id}
                className={`py-2 px-3 mb-2 rounded-full ${index < principles.length - 1 ? '' : ''}`}
                style={isDark ? { backgroundColor: '#27272A' } : { backgroundColor: '#E5E7EB' }}
                onPress={() => {
                  setSelectedPrincipleId(principle.id);
                  setShowPrinciplePicker(false);
                }}
              >
                <Text className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  {principle.title}
                </Text>
              </TouchableOpacity>
            ))}
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
          <Text className={`${selectedGoal ? '' : 'text-gray-500'} ${isDark ? 'text-white' : 'text-black'}`}>
            {selectedGoal ? selectedGoal.title : 'Choose a goal (optional)'}
          </Text>
        </TouchableOpacity>

        {showGoalPicker && (
          <View className={`rounded-2xl mb-6 ${isDark ? '' : 'bg-gray-100'}`} style={isDark ? { backgroundColor: '#000000', paddingBottom: 12, paddingHorizontal: 4 } : undefined}>
            <TouchableOpacity
              className={`py-2 px-3 mb-2 rounded-full`}
              style={isDark ? { backgroundColor: '#27272A' } : { backgroundColor: '#E5E7EB' }}
              onPress={() => {
                setSelectedGoalId(null);
                setShowGoalPicker(false);
              }}
            >
              <Text className={isDark ? 'text-gray-300' : 'text-gray-700'}>None</Text>
            </TouchableOpacity>
            {goals.map((goal, index) => (
              <TouchableOpacity
                key={goal.id}
                className={`py-2 px-3 mb-2 rounded-full ${index < goals.length - 1 ? '' : ''}`}
                style={isDark ? { backgroundColor: '#27272A' } : { backgroundColor: '#E5E7EB' }}
                onPress={() => {
                  setSelectedGoalId(goal.id);
                  setShowGoalPicker(false);
                }}
              >
                <Text className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  {goal.title}
                </Text>
              </TouchableOpacity>
            ))}
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
          disabled={loading || !title.trim() || !selectedPrincipleId}
        >
          <Text className={`text-center font-semibold ${isDark ? 'text-black' : 'text-white'}`}>
            {loading ? 'Saving...' : task ? 'Update Task' : 'Add Task'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </BottomSheet>
  );
}
