import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Task } from '@/types/models';

export function useDailyTasks(date: Date) {
  const [tasks, setTasks] = useState<Task[]>([]);
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

  useEffect(() => {
    if (!user) return;
    fetchTasks();
  }, [user, dateStr]);

  const fetchTasks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', dateStr)
        .order('position', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (
    title: string,
    principleId: string,
    goalId?: string | null
  ): Promise<Task> => {
    if (!user) throw new Error('User not authenticated');

    // Get current tasks to determine position
    const { data: existingTasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', dateStr);

    if (existingTasks && existingTasks.length >= 4) {
      throw new Error('Maximum 4 tasks per day');
    }

    // Ensure primary task exists first
    if (existingTasks && existingTasks.length > 0) {
      const primaryTask = existingTasks.find((t) => t.position === 0);
      if (!primaryTask) {
        throw new Error('Primary task must exist before adding secondary tasks');
      }
    }

    const position = existingTasks?.length || 0;

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        date: dateStr,
        title,
        principle_id: principleId,
        goal_id: goalId || null,
        position,
        is_completed: false,
      })
      .select()
      .single();

    if (error) throw error;
    await fetchTasks();
    return data;
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!user) return;

    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .eq('user_id', user.id);

    if (error) throw error;
    await fetchTasks();
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // If deleting primary task, delete all tasks
    if (task.position === 0) {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('user_id', user.id)
        .eq('date', dateStr);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id);
      if (error) throw error;
    }

    await fetchTasks();
  };

  const reorderTasks = async (newOrder: Task[]) => {
    if (!user) return;

    const updates = newOrder.map((task, index) => ({
      id: task.id,
      position: index,
    }));

    for (const update of updates) {
      const { error } = await supabase
        .from('tasks')
        .update({ position: update.position })
        .eq('id', update.id)
        .eq('user_id', user.id);

      if (error) throw error;
    }

    await fetchTasks();
  };

  const toggleComplete = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    await updateTask(taskId, {
      is_completed: !task.is_completed,
      completed_at: !task.is_completed ? new Date().toISOString() : null,
    });
  };

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    reorderTasks,
    toggleComplete,
    refetch: fetchTasks,
  };
}
