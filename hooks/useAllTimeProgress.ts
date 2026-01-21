import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface AllTimeProgress {
  completionRate: number;
  totalTasks: number;
  completedTasks: number;
  tasksByPrinciple: Record<string, number>;
  mostFocusedPrinciple: { id: string; title: string; count: number } | null;
}

export function useAllTimeProgress() {
  const [progress, setProgress] = useState<AllTimeProgress>({
    completionRate: 0,
    totalTasks: 0,
    completedTasks: 0,
    tasksByPrinciple: {},
    mostFocusedPrinciple: null,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    fetchProgress();
  }, [user]);

  const fetchProgress = async () => {
    if (!user) return;

    try {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);

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

      setProgress({
        completionRate,
        totalTasks,
        completedTasks,
        tasksByPrinciple,
        mostFocusedPrinciple: mostFocused,
      });
    } catch (error) {
      console.error('Error fetching all-time progress:', error);
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
