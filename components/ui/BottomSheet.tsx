import React from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onDelete?: () => void;
}

export function BottomSheet({ visible, onClose, title, children, onDelete }: BottomSheetProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end"
      >
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
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
                {title}
              </Text>
              <View className="flex-row items-center">
                {onDelete && (
                  <TouchableOpacity onPress={onDelete} className="mr-4">
                    <Ionicons
                      name="trash-outline"
                      size={24}
                      color={isDark ? '#EF4444' : '#EF4444'}
                    />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={onClose}>
                  <Ionicons
                    name="close"
                    size={24}
                    color={isDark ? '#FFFFFF' : '#000000'}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Content */}
            <View className="px-6 pb-8">
              {children}
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
