import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { router } from 'expo-router';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { usePrinciples, useSystemPrinciples } from '@/hooks/usePrinciples';
import { Principle } from '@/types/models';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { TextInput } from 'react-native';
import { MarketingCarousel } from '@/components/marketing/MarketingCarousel';

export default function PrinciplesScreen() {
  const [showInspiration, setShowInspiration] = useState(false);
  const [showPrincipleForm, setShowPrincipleForm] = useState(false);
  const [editingPrinciple, setEditingPrinciple] = useState<Principle | null>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const { principles, loading, createPrinciple, updatePrinciple, deletePrinciple, reorderPrinciples, refetch: refetchPrinciples } =
    usePrinciples();
  const { principles: systemPrinciples } = useSystemPrinciples();

  // Marketing cards for Principles page
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

  const handleDelete = (principle: Principle) => {
    Alert.alert('Delete Principle', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePrinciple(principle.id);
            await refetchPrinciples();
          } catch (error: any) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ]);
  };

  const handleCopySystemPrinciple = async (principle: Principle) => {
    try {
      // Use the createPrinciple directly since we have the principle object
      await createPrinciple(principle.title, principle.description || undefined);
      await refetchPrinciples();
      Alert.alert('Success', 'Principle copied to your list');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const renderPrinciple = ({ item, drag, isActive }: RenderItemParams<Principle>) => {
    const isTopRanked = item.position === 0;
    
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
      <TouchableOpacity
        className={`rounded-2xl p-4 mb-3 ${isDark ? '' : 'bg-gray-100'}`}
        style={isDark ? { 
          backgroundColor: '#000000', 
          borderWidth: isTopRanked ? 1 : (isActive ? 2 : 1),
          borderColor: isTopRanked ? '#FFFFFF' : (isActive ? '#FFFFFF' : '#27272A'),
          opacity: isActive ? 0.8 : 1,
        } : {
          borderWidth: isTopRanked ? 1 : (isActive ? 2 : 1),
          borderColor: isTopRanked ? '#000000' : (isActive ? '#000000' : '#E5E7EB'),
          opacity: isActive ? 0.8 : 1,
        }}
        onPress={() => {
          setEditingPrinciple(item);
          setShowPrincipleForm(true);
        }}
        onLongPress={handleLongPress}
        disabled={isActive}
      >
        <View className="flex-row items-start">
          <View className="flex-1">
            {isTopRanked && (
              <Text className={`text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                THIS IS YOUR MAIN PRINCIPLE
              </Text>
            )}
            <Text className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
              {item.title}
            </Text>
            {item.description && (
              <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {item.description}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const ListHeaderComponent = () => (
    <>
      {/* Header */}
      <View className="pt-20 pb-4 flex-row items-center justify-between">
        <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
          My Principles
        </Text>
        <TouchableOpacity
          className={`px-4 py-2 rounded-xl border ${isDark ? 'bg-white border-white' : 'bg-black border-black'}`}
          onPress={() => {
            setEditingPrinciple(null);
            setShowPrincipleForm(true);
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

      {/* Spacer */}
      <View className="mb-8" />
    </>
  );

  const ListFooterComponent = () => (
    <>
      {/* Marketing Carousel */}
      {principles.length > 0 && (
        <View className="mb-6">
          <MarketingCarousel cards={marketingCards} hideSeen={true} />
        </View>
      )}

      {/* Inspiration Section */}
      <View>
        <TouchableOpacity
          className="flex-row items-center justify-between mt-8 mb-4"
          onPress={() => setShowInspiration(!showInspiration)}
          style={!showInspiration ? { marginBottom: 32 } : undefined}
        >
          <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
            Inspiration
          </Text>
          <Ionicons
            name={showInspiration ? 'chevron-down' : 'chevron-forward'}
            size={24}
            color={isDark ? '#FFFFFF' : '#000000'}
          />
        </TouchableOpacity>

        {showInspiration && (
          <View className="mb-16">
            {systemPrinciples.length === 0 ? (
              <Text className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                No inspiration principles available
              </Text>
            ) : (
              systemPrinciples.map((principle) => (
                <View
                  key={principle.id}
                  className={`rounded-2xl p-4 mb-3 ${isDark ? '' : 'bg-gray-100'}`}
                  style={isDark ? { backgroundColor: '#27272A' } : undefined}
                >
                  <Text className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
                    {principle.title}
                  </Text>
                  {principle.description && (
                    <Text className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {principle.description}
                    </Text>
                  )}
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Image
                        source={require('../../assets/jaryd.png')}
                        className="w-6 h-6 rounded-full mr-2"
                        style={{ width: 24, height: 24 }}
                      />
                      <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        by Jaryd
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleCopySystemPrinciple(principle)}
                    >
                      <Ionicons name="copy-outline" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </View>
    </>
  );

  return (
    <View className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`}>
      {principles.length === 0 ? (
        <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 24 }}>
          <ListHeaderComponent />
          <Text className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            No principles yet. Add your first one!
          </Text>
          <View>
            <MarketingCarousel cards={marketingCards} hideSeen={true} />
          </View>
          <ListFooterComponent />
        </ScrollView>
      ) : (
        <GestureHandlerRootView style={{ flex: 1 }}>
          <DraggableFlatList
            data={principles}
            onDragEnd={({ data }) => reorderPrinciples(data)}
            keyExtractor={(item) => item.id}
            renderItem={renderPrinciple}
            ListHeaderComponent={ListHeaderComponent}
            ListFooterComponent={ListFooterComponent}
            contentContainerStyle={{ paddingHorizontal: 24 }}
          />
        </GestureHandlerRootView>
      )}

      {/* Principle Form Modal */}
      <PrincipleForm
        visible={showPrincipleForm}
        onClose={() => {
          setShowPrincipleForm(false);
          setEditingPrinciple(null);
        }}
        onSubmit={async (title: string, description?: string) => {
          try {
            if (editingPrinciple) {
              await updatePrinciple(editingPrinciple.id, { title, description });
            } else {
              await createPrinciple(title, description);
            }
            await refetchPrinciples();
          } catch (error: any) {
            Alert.alert('Error', error.message);
            throw error; // Re-throw to let form handle it
          }
        }}
        onDelete={editingPrinciple ? async (principleId: string) => {
          try {
            await deletePrinciple(principleId);
            await refetchPrinciples();
          } catch (error: any) {
            Alert.alert('Error', error.message);
            throw error;
          }
        } : undefined}
        principle={editingPrinciple}
      />
    </View>
  );
}

function PrincipleForm({
  visible,
  onClose,
  onSubmit,
  onDelete,
  principle,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (title: string, description?: string) => Promise<void>;
  onDelete?: (principleId: string) => Promise<void>;
  principle?: Principle | null;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  React.useEffect(() => {
    if (principle) {
      setTitle(principle.title);
      setDescription(principle.description || '');
    } else {
      setTitle('');
      setDescription('');
    }
  }, [principle, visible]);

  const handleSubmit = async () => {
    if (!title.trim()) return;

    setLoading(true);
    try {
      await onSubmit(title.trim(), description.trim() || undefined);
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!principle || !onDelete) return;
    Alert.alert('Delete Principle', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await onDelete(principle.id);
            onClose();
          } catch (error: any) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ]);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title={principle ? 'Edit Principle' : 'New Principle'} onDelete={principle ? handleDelete : undefined}>
      <TextInput
        className={`px-4 rounded-2xl mb-4 ${isDark ? '' : 'bg-gray-100'}`}
        style={isDark ? { 
          backgroundColor: '#18181B', 
          color: '#FFFFFF', 
          height: 56,
          textAlignVertical: 'center',
          paddingVertical: 16,
        } : { 
          color: '#000000', 
          height: 56,
          textAlignVertical: 'center',
          paddingVertical: 16,
        }}
        placeholder="Title"
        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        className={`py-4 px-4 rounded-2xl mb-6 ${isDark ? '' : 'bg-gray-100'}`}
        style={isDark ? { backgroundColor: '#18181B', color: '#FFFFFF', minHeight: 160 } : { color: '#000000', minHeight: 160 }}
        placeholder="Description (optional)"
        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={8}
        textAlignVertical="top"
      />
      <TouchableOpacity
        className={`py-4 rounded-full ${isDark ? 'bg-white' : 'bg-black'}`}
        onPress={handleSubmit}
        disabled={loading || !title.trim()}
      >
        <Text className={`text-center font-semibold ${isDark ? 'text-black' : 'text-white'}`}>
          {loading ? 'Saving...' : principle ? 'Update' : 'Create'}
        </Text>
      </TouchableOpacity>
    </BottomSheet>
  );
}
