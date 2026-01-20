import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { startOfWeek, addDays, format } from 'date-fns';

export interface HabitProgress {
  habit_id: string;
  habit_type: 'system' | 'custom';
  title: string;
  completed_days: number;
  total_days: number;
  completion_rate: number; // 0-100
  daily_completions: Record<string, boolean>; // date -> is_completed
}

export function useHabitProgress(weekStart: Date) {
  const [progress, setProgress] = useState<HabitProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProgress();
    }
  }, [user, weekStart]);

  const fetchProgress = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Get all days in the week
      const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
      const dateStrings = weekDays.map((d) => format(d, 'yyyy-MM-dd'));

      // Fetch selected habits
      const { data: selectedHabits, error: selectedError } = await supabase
        .from('user_selected_habits')
        .select('*')
        .eq('user_id', user.id);

      if (selectedError) throw selectedError;

      if (!selectedHabits || selectedHabits.length === 0) {
        setProgress([]);
        setLoading(false);
        return;
      }

      // Fetch completions for the week
      const { data: completions, error: completionsError } = await supabase
        .from('daily_habit_completions')
        .select('*')
        .eq('user_id', user.id)
        .in('date', dateStrings);

      if (completionsError) throw completionsError;

      // Build progress for each habit
      const habitProgress: HabitProgress[] = await Promise.all(
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

          // Count completions for this habit
          const habitCompletions = (completions || []).filter(
            (c) => c.habit_id === selected.habit_id && c.habit_type === selected.habit_type
          );

          const dailyCompletions: Record<string, boolean> = {};
          dateStrings.forEach((dateStr) => {
            const completion = habitCompletions.find((c) => c.date === dateStr);
            dailyCompletions[dateStr] = completion?.is_completed || false;
          });

          const completedDays = habitCompletions.filter((c) => c.is_completed).length;
          const completionRate = (completedDays / 7) * 100;

          return {
            habit_id: selected.habit_id,
            habit_type: selected.habit_type,
            title,
            completed_days: completedDays,
            total_days: 7,
            completion_rate: completionRate,
            daily_completions: dailyCompletions,
          };
        })
      );

      setProgress(habitProgress);
    } catch (error) {
      console.error('Error fetching habit progress:', error);
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
