import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { format, differenceInDays } from 'date-fns';

export interface AllTimeHabitProgress {
  habit_id: string;
  habit_type: 'system' | 'custom';
  title: string;
  completed_days: number;
  total_days: number; // Days since habit was added
  completion_rate: number; // 0-100
}

export function useAllTimeHabitProgress() {
  const [progress, setProgress] = useState<AllTimeHabitProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProgress();
    }
  }, [user]);

  const fetchProgress = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch selected habits with created_at to know when they were added
      const { data: selectedHabits, error: selectedError } = await supabase
        .from('user_selected_habits')
        .select('*, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (selectedError) throw selectedError;

      if (!selectedHabits || selectedHabits.length === 0) {
        setProgress([]);
        setLoading(false);
        return;
      }

      // Fetch all completions for this user
      const { data: completions, error: completionsError } = await supabase
        .from('daily_habit_completions')
        .select('*')
        .eq('user_id', user.id);

      if (completionsError) throw completionsError;

      // Build progress for each habit
      const habitProgress: AllTimeHabitProgress[] = await Promise.all(
        selectedHabits.map(async (selected) => {
          // Get habit title
          let title = '';
          if (selected.habit_type === 'system') {
            const { data: habit } = await supabase
              .from('system_habits')
              .select('title')
              .eq('id', selected.habit_id)
              .single();
            title = habit?.title || '';
          } else {
            const { data: habit } = await supabase
              .from('user_habits')
              .select('title')
              .eq('id', selected.habit_id)
              .single();
            title = habit?.title || '';
          }

          // Calculate days since habit was added
          const habitAddedDate = new Date(selected.created_at);
          const today = new Date();
          const totalDays = differenceInDays(today, habitAddedDate) + 1; // +1 to include today

          // Count completions for this habit
          const habitCompletions = (completions || []).filter(
            (c) => c.habit_id === selected.habit_id && c.habit_type === selected.habit_type && c.is_completed
          );

          const completedDays = habitCompletions.length;
          const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

          return {
            habit_id: selected.habit_id,
            habit_type: selected.habit_type,
            title,
            completed_days: completedDays,
            total_days: totalDays,
            completion_rate: completionRate,
          };
        })
      );

      setProgress(habitProgress);
    } catch (error) {
      console.error('Error fetching all-time habit progress:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    progress,
    loading,
    refetch: fetchProgress,
  };
}
