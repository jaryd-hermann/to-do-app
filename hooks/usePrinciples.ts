import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Principle } from '@/types/models';

export function usePrinciples() {
  const [principles, setPrinciples] = useState<Principle[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPrinciples = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('principles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_system_template', false)
        .order('position', { ascending: true });

      if (error) throw error;
      setPrinciples(data || []);
    } catch (error) {
      console.error('Error fetching principles:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchPrinciples();
  }, [user, fetchPrinciples]);

  const createPrinciple = async (title: string, description?: string): Promise<Principle> => {
    if (!user) throw new Error('User not authenticated');

    const { data: existingPrinciples } = await supabase
      .from('principles')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_system_template', false);

    const position = existingPrinciples?.length || 0;

    const { data, error } = await supabase
      .from('principles')
      .insert({
        user_id: user.id,
        title,
        description: description || null,
        position,
        is_system_template: false,
      })
      .select()
      .single();

    if (error) throw error;
    await fetchPrinciples();
    return data;
  };

  const updatePrinciple = async (principleId: string, updates: Partial<Principle>) => {
    if (!user) return;

    const { error } = await supabase
      .from('principles')
      .update(updates)
      .eq('id', principleId)
      .eq('user_id', user.id);

    if (error) throw error;
    await fetchPrinciples();
  };

  const deletePrinciple = async (principleId: string) => {
    if (!user) return;

    // Check if principle is used in tasks or goals
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id')
      .eq('principle_id', principleId)
      .limit(1);

    const { data: goals } = await supabase
      .from('goals')
      .select('id')
      .eq('principle_id', principleId)
      .limit(1);

    if (tasks && tasks.length > 0) {
      throw new Error('Cannot delete principle that is used in tasks');
    }
    if (goals && goals.length > 0) {
      throw new Error('Cannot delete principle that is used in goals');
    }

    const { error } = await supabase
      .from('principles')
      .delete()
      .eq('id', principleId)
      .eq('user_id', user.id);

    if (error) throw error;
    await fetchPrinciples();
  };

  const reorderPrinciples = async (newOrder: Principle[]) => {
    if (!user) return;

    const updates = newOrder.map((principle, index) => ({
      id: principle.id,
      position: index,
    }));

    for (const update of updates) {
      const { error } = await supabase
        .from('principles')
        .update({ position: update.position })
        .eq('id', update.id)
        .eq('user_id', user.id);

      if (error) throw error;
    }

    await fetchPrinciples();
  };

  return {
    principles,
    loading,
    createPrinciple,
    updatePrinciple,
    deletePrinciple,
    reorderPrinciples,
    refetch: fetchPrinciples,
  };
}

export function useSystemPrinciples() {
  const [principles, setPrinciples] = useState<Principle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrinciples();
  }, []);

  const fetchPrinciples = async () => {
    try {
      const { data, error } = await supabase
        .from('principles')
        .select('*')
        .eq('is_system_template', true)
        .order('position', { ascending: true });

      if (error) throw error;
      setPrinciples(data || []);
    } catch (error) {
      console.error('Error fetching system principles:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    principles,
    loading,
  };
}

export function useCopySystemPrinciple() {
  const { user } = useAuth();
  const { principles } = useSystemPrinciples();

  const copySystemPrinciple = async (principleId: string): Promise<Principle> => {
    if (!user) throw new Error('User not authenticated');

    const principle = principles.find((p) => p.id === principleId);
    if (!principle) throw new Error('Principle not found');

    const { data: existingPrinciples } = await supabase
      .from('principles')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_system_template', false);

    const position = existingPrinciples?.length || 0;

    const { data, error } = await supabase
      .from('principles')
      .insert({
        user_id: user.id,
        title: principle.title,
        description: principle.description,
        position,
        is_system_template: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  return {
    copySystemPrinciple,
  };
}
