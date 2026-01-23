import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '@/types/models';
import { useTheme } from '@/contexts/ThemeContext';

interface TaskCardProps {
  task: Task;
  isPrimary: boolean;
  onToggleComplete: () => void;
  onDelete: () => void;
  onEdit: () => void;
  principleTitle?: string;
  goalTitle?: string;
  onLongPress?: () => void;
  isDragging?: boolean;
}

export function TaskCard({
  task,
  isPrimary,
  onToggleComplete,
  onDelete,
  onEdit,
  principleTitle,
  goalTitle,
  onLongPress,
  isDragging,
}: TaskCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <TouchableOpacity
      className={`rounded-2xl p-4 mb-3 ${isPrimary ? 'border-2 border-white' : ''} ${isDark ? '' : 'bg-gray-100'}`}
      style={isDark ? { 
        backgroundColor: '#000000',
        borderWidth: isPrimary ? 2 : (isDragging ? 2 : 1),
        borderColor: isPrimary ? '#FFFFFF' : (isDragging ? '#FFFFFF' : '#27272A'),
        opacity: isDragging ? 0.8 : 1,
      } : {
        borderWidth: isPrimary ? 2 : (isDragging ? 2 : 0),
        borderColor: isPrimary ? '#000000' : (isDragging ? '#000000' : 'transparent'),
        opacity: isDragging ? 0.8 : 1,
      }}
      onPress={onEdit}
      onLongPress={onLongPress}
    >
      <View className="flex-row items-start">
        {/* Checkbox */}
        <TouchableOpacity
          onPress={onToggleComplete}
          className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center mt-1 ${
            task.is_completed
              ? isDark ? 'bg-white border-white' : 'bg-black border-black'
              : isDark ? 'border-gray-600' : 'border-gray-400'
          }`}
        >
          {task.is_completed && (
            <Ionicons
              name="checkmark"
              size={16}
              color={isDark ? '#000000' : '#FFFFFF'}
            />
          )}
        </TouchableOpacity>

        {/* Content */}
        <View className="flex-1">
          {isPrimary && (
            <Text className={`text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              YOUR ONE BIG THING
            </Text>
          )}
          <Text
            className={`text-lg mb-2 ${task.is_completed ? 'line-through' : ''} ${
              isDark ? 'text-white' : 'text-black'
            }`}
            style={{ opacity: task.is_completed ? 0.5 : 1 }}
          >
            {task.title}
          </Text>
          <View className="flex-row items-center flex-wrap">
            {principleTitle && (
              <>
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  • {principleTitle}
                </Text>
              </>
            )}
            {goalTitle && (
              <Text className={`text-sm ml-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                → {goalTitle}
              </Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
