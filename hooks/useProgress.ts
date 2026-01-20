import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Task } from '@/types/models';
import { startOfWeek, endOfWeek, format, eachDayOfInterval } from 'date-fns';

interface WeeklyProgress {
  completionRate: number;
  totalTasks: number;
  completedTasks: number;
  tasksByPrinciple: Record<string, number>;
  mostFocusedPrinciple: { id: string; title: string; count: number } | null;
  dailyCompletion: Record<string, boolean>;
}

export function useWeeklyProgress(weekStart: Date) {
  const [progress, setProgress] = useState<WeeklyProgress>({
    completionRate: 0,
    totalTasks: 0,
    completedTasks: 0,
    tasksByPrinciple: {},
    mostFocusedPrinciple: null,
    dailyCompletion: {},
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    fetchProgress();
  }, [user, weekStart]);

  const fetchProgress = async () => {
    if (!user) return;

    try {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
      const startStr = format(weekStart, 'yyyy-MM-dd');
      const endStr = format(weekEnd, 'yyyy-MM-dd');

      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startStr)
        .lte('date', endStr);

      if (error) throw error;

      const totalTasks = tasks?.length || 0;
      const completedTasks = tasks?.filter((t) => t.is_completed).length || 0;
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      // Group by principle
      const tasksByPrinciple: Record<string, number> = {};
      tasks?.forEach((task) => {
        if (task.is_completed) {
          tasksByPrinciple[task.principle_id] = (tasksByPrinciple[task.principle_id] || 0) + 1;
        }
      });

      // Find most focused principle
      let mostFocused: { id: string; title: string; count: number } | null = null;
      Object.entries(tasksByPrinciple).forEach(([principleId, count]) => {
        if (!mostFocused || count > mostFocused.count) {
          mostFocused = { id: principleId, title: '', count };
        }
      });

      // Get principle titles
      if (mostFocused) {
        const { data: principle } = await supabase
          .from('principles')
          .select('title')
          .eq('id', mostFocused.id)
          .single();
        if (principle) {
          mostFocused.title = principle.title;
        }
      }

      // Daily completion
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
      const dailyCompletion: Record<string, boolean> = {};
      days.forEach((day) => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const dayTasks = tasks?.filter((t) => t.date === dayStr) || [];
        dailyCompletion[dayStr] = dayTasks.length > 0 && dayTasks.every((t) => t.is_completed);
      });

      setProgress({
        completionRate,
        totalTasks,
        completedTasks,
        tasksByPrinciple,
        mostFocusedPrinciple: mostFocused,
        dailyCompletion,
      });
    } catch (error) {
      console.error('Error fetching progress:', error);
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
