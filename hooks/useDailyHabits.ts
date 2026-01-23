import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { DailyHabitCompletion, SelectedHabit } from '@/types/models';

export function useDailyHabits(date: Date) {
  const [completions, setCompletions] = useState<DailyHabitCompletion[]>([]);
  const [selectedHabits, setSelectedHabits] = useState<SelectedHabit[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  // Safely get date string with defensive checks
  const dateStr = React.useMemo(() => {
    try {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        // Fallback to today if date is invalid
        const today = new Date();
        const iso = today.toISOString();
        if (typeof iso === 'string' && iso.includes('T')) {
          return iso.split('T')[0];
        }
        // Ultimate fallback
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      const isoString = date.toISOString();
      if (typeof isoString === 'string' && isoString.includes('T')) {
        const parts = isoString.split('T');
        if (parts.length > 0 && typeof parts[0] === 'string') {
          return parts[0];
        }
      }
      // Fallback if split fails
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error getting date string:', error);
      // Ultimate fallback
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }, [date]);

  const fetchSelectedHabits = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_selected_habits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at');

    if (error) throw error;

    if (!data || data.length === 0) {
      setSelectedHabits([]);
      return;
    }

    // Batch fetch all habit titles at once instead of individual requests
    const systemHabitIds = data.filter(s => s.habit_type === 'system').map(s => s.habit_id);
    const userHabitIds = data.filter(s => s.habit_type === 'custom').map(s => s.habit_id);

    const [systemHabitsResult, userHabitsResult] = await Promise.all([
      systemHabitIds.length > 0
        ? supabase.from('system_habits').select('id, title').in('id', systemHabitIds)
        : Promise.resolve({ data: [], error: null }),
      userHabitIds.length > 0
        ? supabase.from('user_habits').select('id, title').in('id', userHabitIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const systemHabitsMap = new Map((systemHabitsResult.data || []).map(h => [h.id, h.title]));
    const userHabitsMap = new Map((userHabitsResult.data || []).map(h => [h.id, h.title]));

    const enriched = (data || []).map((selected) => {
      const title =
        selected.habit_type === 'system'
          ? systemHabitsMap.get(selected.habit_id)
          : userHabitsMap.get(selected.habit_id);
      return { ...selected, title: title || 'Unknown' };
    });

    setSelectedHabits(enriched);
  }, [user]);

  const fetchCompletions = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('daily_habit_completions')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', dateStr);

    if (error) throw error;
    setCompletions(data || []);
  }, [user, dateStr]);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      await Promise.all([fetchSelectedHabits(), fetchCompletions()]);
    } finally {
      setLoading(false);
    }
  }, [user, fetchSelectedHabits, fetchCompletions]);

  useEffect(() => {
    if (user) {
      fetchAll();
    }
  }, [user, fetchAll]);

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
