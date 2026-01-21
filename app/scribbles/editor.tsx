import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useScribbles } from '@/hooks/useScribbles';
import { format } from 'date-fns';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScribbleEditorScreen() {
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { scribbles, createScribble, updateScribble, togglePin, refetch } = useScribbles();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const scribbleId = params.id as string | undefined;
  const dateParam = params.date as string | undefined;
  const returnTo = (params.returnTo as string) || 'scribbles';

  const titleInputRef = useRef<TextInput>(null);
  const bodyInputRef = useRef<TextInput>(null);

  // Initialize scribble data
  useEffect(() => {
    if (scribbleId) {
      // Editing existing scribble
      const scribble = scribbles.find((s) => s.id === scribbleId);
      if (scribble) {
        setTitle(scribble.title);
        setBody(scribble.body || '');
        setIsPinned(scribble.pinned);
        setLastSaved(new Date(scribble.updated_at));
      }
    } else if (dateParam) {
      // Creating daily scribble - check if exists
      const existingScribble = scribbles.find((s) => s.date === dateParam);
      if (existingScribble) {
        // Navigate to existing scribble
        router.replace({
          pathname: '/scribbles/editor',
          params: { id: existingScribble.id, returnTo },
        });
        return;
      } else {
        // New daily scribble - set default title
        // Parse dateParam as YYYY-MM-DD format (local date, not UTC)
        if (dateParam && typeof dateParam === 'string' && dateParam.includes('-')) {
          try {
            const parts = dateParam.split('-');
            if (parts.length === 3) {
              const [year, month, day] = parts.map(Number);
              if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                const date = new Date(year, month - 1, day); // month is 0-indexed
                if (!isNaN(date.getTime())) {
                  const defaultTitle = format(date, 'EEEE, MMMM d');
                  setTitle(defaultTitle);
                  setLastSaved(null);
                  return;
                }
              }
            }
          } catch (error) {
            console.error('Error parsing dateParam:', error);
          }
        }
        // Fallback if parsing fails
        setTitle(format(new Date(), 'EEEE, MMMM d'));
        setLastSaved(null);
      }
    } else {
      // New general note
      setTitle('');
      setBody('');
      setIsPinned(false);
      setLastSaved(null);
    }
  }, [scribbleId, dateParam, scribbles]);

  const handleSave = async () => {
    // Only save if user has started typing (has content)
    if (!title.trim() && !body.trim()) {
      // Don't save empty notes - just close
      return;
    }

    setIsSaving(true);
    try {
      const titleToSave = title.trim() || (dateParam && typeof dateParam === 'string' && dateParam.includes('-') ? (() => {
        try {
          // Parse dateParam as YYYY-MM-DD format (local date, not UTC)
          const parts = dateParam.split('-');
          if (parts.length === 3) {
            const [year, month, day] = parts.map(Number);
            if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
              const date = new Date(year, month - 1, day);
              if (!isNaN(date.getTime())) {
                return format(date, 'EEEE, MMMM d');
              }
            }
          }
        } catch (error) {
          console.error('Error parsing dateParam in handleSave:', error);
        }
        return format(new Date(), 'EEEE, MMMM d');
      })() : 'Untitled');
      
      if (scribbleId) {
        // Update existing
        await updateScribble(scribbleId, {
          title: titleToSave,
          body: body.trim() || null,
          pinned: isPinned,
        });
      } else {
        // Create new - only if there's content
        if (title.trim() || body.trim()) {
          await createScribble(titleToSave, body.trim() || null, dateParam || null);
        }
      }
      
      setLastSaved(new Date());
      setHasChanges(false);
      await refetch();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = async () => {
    if (hasChanges) {
      await handleSave();
    }
    
    // Refetch scribbles to ensure latest data
    await refetch();
    
    if (returnTo === 'today') {
      router.back();
    } else {
      router.replace('/(tabs)/scribbles');
    }
  };

  const handlePinToggle = async () => {
    if (scribbleId) {
      try {
        await togglePin(scribbleId);
        setIsPinned(!isPinned);
        await refetch();
      } catch (error: any) {
        Alert.alert('Error', error.message);
      }
    } else {
      // For new notes, just toggle local state (will be saved on close)
      setIsPinned(!isPinned);
    }
  };

  // Auto-save will happen on blur (when handleClose is called)

  const handleTitleChange = (text: string) => {
    // Limit to 10 words
    const words = text.trim().split(/\s+/);
    if (words.length <= 10 || text.length < title.length) {
      setTitle(text);
      setHasChanges(true);
    }
  };

  const handleBodyChange = (text: string) => {
    setBody(text);
    setHasChanges(true);
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View
          className="flex-row items-center justify-between px-6 py-4"
          style={{ borderBottomWidth: 1, borderBottomColor: isDark ? '#27272A' : '#E5E7EB' }}
        >
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="chevron-back" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>

          <View className="flex-1 items-center">
            {lastSaved && (
              <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                Saved {format(lastSaved, 'MMM d, h:mm a')}
              </Text>
            )}
          </View>

          <View className="flex-row items-center">
            <TouchableOpacity onPress={handlePinToggle} className="mr-4">
              <Ionicons
                name={isPinned ? 'pin' : 'pin-outline'}
                size={24}
                color={isPinned ? '#F59E0B' : isDark ? '#FFFFFF' : '#000000'}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="checkmark" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Editor */}
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
          {/* Title Input */}
          <TextInput
            ref={titleInputRef}
            className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-black'}`}
            style={{ minHeight: 50 }}
            placeholder="Title"
            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
            value={title}
            onChangeText={handleTitleChange}
            multiline
            maxLength={200}
          />

          {/* Body Input */}
          <TextInput
            ref={bodyInputRef}
            className={`text-base ${isDark ? 'text-white' : 'text-black'}`}
            style={{ minHeight: 400, textAlignVertical: 'top' }}
            placeholder="Start writing..."
            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
            value={body}
            onChangeText={handleBodyChange}
            multiline
          />
        </ScrollView>

        {/* Formatting Toolbar */}
        <View
          className="flex-row items-center justify-around px-4 py-3"
          style={{
            borderTopWidth: 1,
            borderTopColor: isDark ? '#27272A' : '#E5E7EB',
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
          }}
        >
          <TouchableOpacity
            onPress={() => {
              // Note: React Native TextInput doesn't support rich text formatting natively
              // For now, we'll insert formatting markers that can be rendered later
              // In a production app, you'd use a library like react-native-pell-rich-editor
              const selection = bodyInputRef.current?.selectionStart || body.length;
              const endSelection = bodyInputRef.current?.selectionEnd || selection;
              
              if (selection !== endSelection) {
                // Text is selected - wrap it
                const selectedText = body.slice(selection, endSelection);
                const newBody = body.slice(0, selection) + '**' + selectedText + '**' + body.slice(endSelection);
                handleBodyChange(newBody);
              } else {
                // No selection - insert placeholder
                const newBody = body.slice(0, selection) + '**bold text**' + body.slice(selection);
                handleBodyChange(newBody);
                setTimeout(() => {
                  bodyInputRef.current?.setNativeProps({
                    selection: { start: selection + 2, end: selection + 11 },
                  });
                }, 100);
              }
            }}
            className="px-4 py-2"
          >
            <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-black'}`}>B</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              const selection = bodyInputRef.current?.selectionStart || body.length;
              const endSelection = bodyInputRef.current?.selectionEnd || selection;
              
              if (selection !== endSelection) {
                // Text is selected - wrap it
                const selectedText = body.slice(selection, endSelection);
                const newBody = body.slice(0, selection) + '*' + selectedText + '*' + body.slice(endSelection);
                handleBodyChange(newBody);
              } else {
                // No selection - insert placeholder
                const newBody = body.slice(0, selection) + '*italic text*' + body.slice(selection);
                handleBodyChange(newBody);
                setTimeout(() => {
                  bodyInputRef.current?.setNativeProps({
                    selection: { start: selection + 1, end: selection + 12 },
                  });
                }, 100);
              }
            }}
            className="px-4 py-2"
          >
            <Text className={`text-lg italic ${isDark ? 'text-white' : 'text-black'}`}>I</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              // Bullet list - insert • item
              const selection = bodyInputRef.current?.selectionStart || body.length;
              const newBody = body.slice(0, selection) + '• ' + body.slice(selection);
              handleBodyChange(newBody);
              setTimeout(() => {
                bodyInputRef.current?.setNativeProps({
                  selection: { start: selection + 2, end: selection + 2 },
                });
              }, 100);
            }}
            className="px-4 py-2"
          >
            <Ionicons name="list" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {isSaving && (
        <View className="absolute bottom-8 left-0 right-0 items-center">
          <View
            className="px-4 py-2 rounded-full"
            style={{ backgroundColor: isDark ? '#27272A' : '#E5E7EB' }}
          >
            <Text className={isDark ? 'text-white' : 'text-black'}>Saving...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
