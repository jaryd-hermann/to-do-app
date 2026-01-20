import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { DailyHabitCompletion, SelectedHabit } from '@/types/models';

export function useDailyHabits(date: Date) {
  const [completions, setCompletions] = useState<DailyHabitCompletion[]>([]);
  const [selectedHabits, setSelectedHabits] = useState<SelectedHabit[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const dateStr = date.toISOString().split('T')[0];

  useEffect(() => {
    if (user) {
      fetchAll();
    }
  }, [user, dateStr]);

  const fetchAll = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await Promise.all([fetchSelectedHabits(), fetchCompletions()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSelectedHabits = async () => {
    if (!user) return;

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

  const fetchCompletions = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('daily_habit_completions')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', dateStr);

    if (error) throw error;
    setCompletions(data || []);
  };

  const toggleCompletion = async (habitId: string, habitType: 'system' | 'custom') => {
    if (!user) return;

    const existing = completions.find(
      (c) => c.habit_id === habitId && c.habit_type === habitType
    );

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('daily_habit_completions')
        .update({
          is_completed: !existing.is_completed,
        })
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      // Create new
      const { error } = await supabase
        .from('daily_habit_completions')
        .insert({
          user_id: user.id,
          habit_id: habitId,
          habit_type: habitType,
          date: dateStr,
          is_completed: true,
        });

      if (error) throw error;
    }

    await fetchCompletions();
  };

  const isHabitCompleted = (habitId: string, habitType: 'system' | 'custom') => {
    return completions.some(
      (c) => c.habit_id === habitId && c.habit_type === habitType && c.is_completed
    );
  };

  return {
    selectedHabits,
    completions,
    loading,
    toggleCompletion,
    isHabitCompleted,
    refetch: fetchAll,
  };
}
