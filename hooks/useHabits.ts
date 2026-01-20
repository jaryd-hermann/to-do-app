import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { SystemHabit, UserHabit, SelectedHabit } from '@/types/models';

export function useHabits() {
  const [systemHabits, setSystemHabits] = useState<SystemHabit[]>([]);
  const [userHabits, setUserHabits] = useState<UserHabit[]>([]);
  const [selectedHabits, setSelectedHabits] = useState<SelectedHabit[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchAll();
    }
  }, [user]);

  const fetchAll = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await Promise.all([
        fetchSystemHabits(),
        fetchUserHabits(),
        fetchSelectedHabits(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemHabits = async () => {
    const { data, error } = await supabase
      .from('system_habits')
      .select('*')
      .order('title');

    if (error) throw error;
    setSystemHabits(data || []);
  };

  const fetchUserHabits = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('user_habits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setUserHabits(data || []);
  };

  const fetchSelectedHabits = async () => {
    if (!user) return;
    
    // Fetch selected habits with their titles
    const { data, error } = await supabase
      .from('user_selected_habits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at');

    if (error) throw error;
    
    // Enrich with titles
    const enriched = await Promise.all(
      (data || []).map(async (selected) => {
        if (selected.habit_type === 'system') {
          const { data: habit } = await supabase
            .from('system_habits')
            .select('title')
            .eq('id', selected.habit_id)
            .single();
          return { ...selected, title: habit?.title };
        } else {
          const { data: habit } = await supabase
            .from('user_habits')
            .select('title')
            .eq('id', selected.habit_id)
            .single();
          return { ...selected, title: habit?.title };
        }
      })
    );
    
    setSelectedHabits(enriched);
  };

  const createUserHabit = async (title: string): Promise<UserHabit> => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_habits')
      .insert({ user_id: user.id, title })
      .select()
      .single();

    if (error) throw error;
    await fetchUserHabits();
    return data;
  };

  const updateUserHabit = async (habitId: string, title: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('user_habits')
      .update({ title })
      .eq('id', habitId)
      .eq('user_id', user.id);

    if (error) throw error;
    await fetchUserHabits();
    await fetchSelectedHabits(); // Refresh selected habits to update titles
  };

  const deleteUserHabit = async (habitId: string) => {
    if (!user) return;

    // First, remove from selected habits if selected
    await supabase
      .from('user_selected_habits')
      .delete()
      .eq('user_id', user.id)
      .eq('habit_id', habitId)
      .eq('habit_type', 'custom');

    // Then delete the habit
    const { error } = await supabase
      .from('user_habits')
      .delete()
      .eq('id', habitId)
      .eq('user_id', user.id);

    if (error) throw error;
    await fetchUserHabits();
    await fetchSelectedHabits();
  };

  const toggleHabitSelection = async (habitId: string, habitType: 'system' | 'custom') => {
    if (!user) return;

    const isSelected = selectedHabits.some(
      (h) => h.habit_id === habitId && h.habit_type === habitType
    );

    if (isSelected) {
      // Remove selection
      const { error } = await supabase
        .from('user_selected_habits')
        .delete()
        .eq('user_id', user.id)
        .eq('habit_id', habitId)
        .eq('habit_type', habitType);

      if (error) throw error;
    } else {
      // Add selection
      const { error } = await supabase
        .from('user_selected_habits')
        .insert({
          user_id: user.id,
          habit_id: habitId,
          habit_type: habitType,
        });

      if (error) throw error;
    }

    await fetchSelectedHabits();
  };

  const saveSelectedHabits = async (habitIds: { id: string; type: 'system' | 'custom' }[]) => {
    if (!user) return;

    // Remove all current selections
    await supabase
      .from('user_selected_habits')
      .delete()
      .eq('user_id', user.id);

    // Add new selections
    if (habitIds.length > 0) {
      const { error } = await supabase
        .from('user_selected_habits')
        .insert(
          habitIds.map((h) => ({
            user_id: user.id,
            habit_id: h.id,
            habit_type: h.type,
          }))
        );

      if (error) throw error;
    }

    await fetchSelectedHabits();
  };

  return {
    systemHabits,
    userHabits,
    selectedHabits,
    loading,
    createUserHabit,
    updateUserHabit,
    deleteUserHabit,
    toggleHabitSelection,
    saveSelectedHabits,
    refetch: fetchAll,
  };
}
