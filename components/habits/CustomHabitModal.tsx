import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useHabits } from '@/hooks/useHabits';
import { UserHabit } from '@/types/models';

interface CustomHabitModalProps {
  visible: boolean;
  onClose: () => void;
  habit?: UserHabit | null;
  onEditComplete?: () => void;
}

export function CustomHabitModal({ visible, onClose, habit, onEditComplete }: CustomHabitModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { createUserHabit, updateUserHabit, deleteUserHabit, refetch } = useHabits();
  const [customTitle, setCustomTitle] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setCustomTitle(habit?.title || '');
    } else {
      setCustomTitle('');
    }
  }, [visible, habit]);

  const handleSave = async () => {
    if (!customTitle.trim()) return;
    setLoading(true);
    try {
      if (habit) {
        await updateUserHabit(habit.id, customTitle.trim());
      } else {
        await createUserHabit(customTitle.trim());
      }
      await refetch();
      if (onEditComplete) {
        onEditComplete();
      } else {
        onClose();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save habit');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (habitId: string) => {
    Alert.alert('Delete Habit', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteUserHabit(habitId);
            await refetch();
            if (onEditComplete) {
              onEditComplete();
            } else {
              onClose();
            }
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to delete habit');
          }
        },
      },
    ]);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
      statusBarTranslucent={true}
      hardwareAccelerated={true}
    >
      <Pressable
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)', zIndex: 10000 }}
        onPress={onClose}
      >
        <Pressable
          className={`rounded-t-3xl ${isDark ? 'bg-black' : 'bg-white'}`}
          style={isDark ? { borderTopWidth: 1, borderTopColor: '#FFFFFF' } : undefined}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Handle */}
          <View className="items-center py-2">
            <View className={`w-12 h-1 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between px-6 pb-4">
            <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
              {habit ? 'Edit Habit' : 'New Habit'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons
                name="close"
                size={24}
                color={isDark ? '#FFFFFF' : '#000000'}
              />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View className="px-6 pb-8">
            <TextInput
              className={`py-4 px-4 rounded-2xl mb-4 ${isDark ? '' : 'bg-gray-100'}`}
              style={isDark ? { backgroundColor: '#18181B', color: '#FFFFFF' } : { color: '#000000' }}
              placeholder="Habit name"
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              value={customTitle}
              onChangeText={setCustomTitle}
              autoFocus
            />
            {habit && (
              <TouchableOpacity
                onPress={() => handleDelete(habit.id)}
                className="py-4 rounded-full mb-4"
                style={{ backgroundColor: isDark ? '#27272A' : '#F3F4F6' }}
              >
                <Text className={`text-center font-semibold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                  Delete Habit
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleSave}
              className={`py-4 rounded-full ${isDark ? 'bg-white' : 'bg-black'}`}
              disabled={loading || !customTitle.trim()}
            >
              <Text className={`text-center font-semibold ${isDark ? 'text-black' : 'text-white'}`}>
                {loading ? 'Saving...' : habit ? 'Update' : 'Add'}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
