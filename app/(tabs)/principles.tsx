import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { router } from 'expo-router';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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

  const { principles, loading, createPrinciple, updatePrinciple, deletePrinciple, reorderPrinciples } =
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
      Alert.alert('Success', 'Principle copied to your list');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const renderPrinciple = ({ item, drag, isActive }: RenderItemParams<Principle>) => {
    const isTopRanked = item.position === 0;
    return (
    <View
      className={`rounded-2xl p-4 mb-3 ${isDark ? '' : 'bg-gray-100'}`}
      style={isDark ? { backgroundColor: '#000000', borderWidth: isTopRanked ? 1 : 0, borderColor: isTopRanked ? '#FFFFFF' : 'transparent' } : undefined}
    >
      <View className="flex-row items-start">
        <TouchableOpacity onLongPress={drag} disabled={isActive} className="mr-3">
          <Ionicons
            name="reorder-three-outline"
            size={24}
            color={isDark ? '#9CA3AF' : '#6B7280'}
          />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
            {item.title}
          </Text>
          {item.description && (
            <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {item.description}
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => {
            setEditingPrinciple(item);
            setShowPrincipleForm(true);
          }}
          className="mr-3"
        >
          <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item)}>
          <Ionicons name="trash-outline" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
        </TouchableOpacity>
      </View>
    </View>
  );
  };

  return (
    <View className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`}>
      <ScrollView className="flex-1 px-6">
        {/* Header */}
        <View className="pt-20 pb-4">
          <Text className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
            My Principles
          </Text>
        </View>

        {/* My Principles Section */}
        <View className="flex-row items-center justify-between mb-8">
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

        {principles.length === 0 ? (
          <>
            <Text className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              No principles yet. Add your first one!
            </Text>
            
            {/* Marketing Carousel */}
            <MarketingCarousel cards={marketingCards} hideSeen={true} />
          </>
        ) : (
          <>
            <View className="mb-6 mt-6">
              <GestureHandlerRootView>
                <DraggableFlatList
                  data={principles}
                  onDragEnd={({ data }) => reorderPrinciples(data)}
                  keyExtractor={(item) => item.id}
                  renderItem={renderPrinciple}
                  scrollEnabled={false}
                />
              </GestureHandlerRootView>
            </View>
            
            {/* Marketing Carousel - Always show below principles */}
            <MarketingCarousel cards={marketingCards} hideSeen={true} />
          </>
        )}

        {/* Inspiration Section */}
        <TouchableOpacity
          className="flex-row items-center justify-between mt-8 mb-4"
          onPress={() => setShowInspiration(!showInspiration)}
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
          <View>
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
      </ScrollView>

      {/* Principle Form Modal */}
      <PrincipleForm
        visible={showPrincipleForm}
        onClose={() => {
          setShowPrincipleForm(false);
          setEditingPrinciple(null);
        }}
        onSubmit={editingPrinciple ? updatePrinciple : createPrinciple}
        principle={editingPrinciple}
      />
    </View>
  );
}

function PrincipleForm({
  visible,
  onClose,
  onSubmit,
  principle,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (title: string, description?: string) => Promise<void>;
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

  return (
    <BottomSheet visible={visible} onClose={onClose} title={principle ? 'Edit Principle' : 'New Principle'}>
      <TextInput
        className={`py-4 px-4 rounded-2xl mb-4 ${isDark ? '' : 'bg-gray-100'}`}
        style={isDark ? { backgroundColor: '#18181B', color: '#FFFFFF' } : { color: '#000000' }}
        placeholder="Title"
        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
        value={title}
        onChangeText={setTitle}
      />
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
        disabled={loading || !title.trim()}
      >
        <Text className={`text-center font-semibold ${isDark ? 'text-black' : 'text-white'}`}>
          {loading ? 'Saving...' : principle ? 'Update' : 'Create'}
        </Text>
      </TouchableOpacity>
    </BottomSheet>
  );
}
