import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Scribble } from '@/types/models';
import { format } from 'date-fns';

export function useScribbles() {
  const [scribbles, setScribbles] = useState<Scribble[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchScribbles = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('scribbles')
        .select('*')
        .eq('user_id', user.id)
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScribbles(data || []);
    } catch (error) {
      console.error('Error fetching scribbles:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchScribbles();
  }, [user, fetchScribbles]);

  const createScribble = async (
    title: string,
    body?: string,
    date?: string | null
  ): Promise<Scribble> => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('scribbles')
      .insert({
        user_id: user.id,
        title,
        body: body || null,
        date: date || null,
        pinned: false,
      })
      .select()
      .single();

    if (error) throw error;
    await fetchScribbles();
    return data;
  };

  const updateScribble = async (scribbleId: string, updates: Partial<Scribble>) => {
    if (!user) return;

    const { error } = await supabase
      .from('scribbles')
      .update(updates)
      .eq('id', scribbleId)
      .eq('user_id', user.id);

    if (error) throw error;
    await fetchScribbles();
  };

  const deleteScribble = async (scribbleId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('scribbles')
      .delete()
      .eq('id', scribbleId)
      .eq('user_id', user.id);

    if (error) throw error;
    await fetchScribbles();
  };

  const togglePin = async (scribbleId: string) => {
    if (!user) return;

    const scribble = scribbles.find((s) => s.id === scribbleId);
    if (!scribble) return;

    const { error } = await supabase
      .from('scribbles')
      .update({ pinned: !scribble.pinned })
      .eq('id', scribbleId)
      .eq('user_id', user.id);

    if (error) throw error;
    await fetchScribbles();
  };

  const getScribbleByDate = (date: string): Scribble | undefined => {
    return scribbles.find((s) => s.date === date);
  };

  // Group scribbles by sections
  const getScribblesBySection = () => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = format(yesterday, 'yyyy-MM-dd');
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = format(thirtyDaysAgo, 'yyyy-MM-dd');

    const pinned = scribbles.filter((s) => s.pinned);
    
    // For daily scribbles, use date field; for general notes, use created_at date
    const todayScribbles = scribbles.filter((s) => {
      if (s.pinned) return false;
      if (s.date) return s.date === todayStr;
      // General note - check if created today
      const createdDate = format(new Date(s.created_at), 'yyyy-MM-dd');
      return createdDate === todayStr;
    });
    
    const yesterdayScribbles = scribbles.filter((s) => {
      if (s.pinned) return false;
      if (s.date) return s.date === yesterdayStr;
      const createdDate = format(new Date(s.created_at), 'yyyy-MM-dd');
      return createdDate === yesterdayStr;
    });
    
    const previous30Days = scribbles.filter((s) => {
      if (s.pinned) return false;
      if (s.date) {
        return s.date < yesterdayStr && s.date >= thirtyDaysAgoStr;
      }
      const createdDate = format(new Date(s.created_at), 'yyyy-MM-dd');
      return createdDate < yesterdayStr && createdDate >= thirtyDaysAgoStr;
    });
    
    const older = scribbles.filter((s) => {
      if (s.pinned) return false;
      if (s.date) return s.date < thirtyDaysAgoStr;
      const createdDate = format(new Date(s.created_at), 'yyyy-MM-dd');
      return createdDate < thirtyDaysAgoStr;
    });

    return {
      pinned,
      today: todayScribbles,
      yesterday: yesterdayScribbles,
      previous30Days,
      older,
    };
  };

  const getTotalCount = () => scribbles.length;

  return {
    scribbles,
    loading,
    createScribble,
    updateScribble,
    deleteScribble,
    togglePin,
    getScribbleByDate,
    getScribblesBySection,
    getTotalCount,
    refetch: fetchScribbles,
  };
}
