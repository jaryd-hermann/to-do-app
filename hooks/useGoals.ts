import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Goal } from '@/types/models';

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    fetchGoals();
  }, [user]);

  const fetchGoals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('position', { ascending: true });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (
    title: string,
    principleId: string,
    description?: string
  ): Promise<Goal> => {
    if (!user) throw new Error('User not authenticated');

    const { data: existingGoals } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (existingGoals && existingGoals.length >= 5) {
      throw new Error('Maximum 5 active goals');
    }

    const position = existingGoals?.length || 0;

    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        title,
        description: description || null,
        principle_id: principleId,
        status: 'active',
        position,
      })
      .select()
      .single();

    if (error) throw error;
    await fetchGoals();
    return data;
  };

  const updateGoal = async (goalId: string, updates: Partial<Goal>) => {
    if (!user) return;

    const { error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', goalId)
      .eq('user_id', user.id);

    if (error) throw error;
    await fetchGoals();
  };

  const deleteGoal = async (goalId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', user.id);

    if (error) throw error;
    await fetchGoals();
  };

  const activateGoal = async (goalId: string) => {
    if (!user) return;

    const { data: activeGoals } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (activeGoals && activeGoals.length >= 5) {
      throw new Error('Maximum 5 active goals');
    }

    const position = activeGoals?.length || 0;

    const { error } = await supabase
      .from('goals')
      .update({
        status: 'active',
        position,
      })
      .eq('id', goalId)
      .eq('user_id', user.id);

    if (error) throw error;
    await fetchGoals();
  };

  const deactivateGoal = async (goalId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('goals')
      .update({ status: 'inactive' })
      .eq('id', goalId)
      .eq('user_id', user.id);

    if (error) throw error;
    await fetchGoals();
  };

  const achieveGoal = async (goalId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('goals')
      .update({
        status: 'achieved',
        achieved_at: new Date().toISOString(),
      })
      .eq('id', goalId)
      .eq('user_id', user.id);

    if (error) throw error;
    await fetchGoals();
  };

  const reorderGoals = async (newOrder: Goal[]) => {
    if (!user) return;

    const updates = newOrder.map((goal, index) => ({
      id: goal.id,
      position: index,
    }));

    for (const update of updates) {
      const { error } = await supabase
        .from('goals')
        .update({ position: update.position })
        .eq('id', update.id)
        .eq('user_id', user.id);

      if (error) throw error;
    }

    await fetchGoals();
  };

  const getGoalActionCount = async (goalId: string): Promise<number> => {
    if (!user) return 0;

    const { count, error } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('goal_id', goalId);

    if (error) throw error;
    return count || 0;
  };

  const activeGoals = goals.filter((g) => g.status === 'active').sort((a, b) => a.position - b.position);

  return {
    goals,
    activeGoals,
    loading,
    createGoal,
    updateGoal,
    deleteGoal,
    activateGoal,
    deactivateGoal,
    achieveGoal,
    reorderGoals,
    getGoalActionCount,
    refetch: fetchGoals,
  };
}
