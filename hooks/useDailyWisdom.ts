import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface DailyWisdom {
  id: string;
  quote: string;
  author: string;
}

export function useDailyWisdom(date?: Date) {
  const [wisdom, setWisdom] = useState<DailyWisdom | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDailyWisdom(date);
  }, [date]);

  const fetchDailyWisdom = async (targetDate?: Date) => {
    try {
      setLoading(true);
      // Get all wisdom quotes
      const { data, error } = await supabase
        .from('daily_wisdom')
        .select('*')
        .order('id');

      if (error) throw error;
      
      if (data && data.length > 0) {
        // Use date to deterministically pick a quote (same date = same quote)
        const target = targetDate || new Date();
        // Use day of year (1-365) to pick a quote
        const startOfYear = new Date(target.getFullYear(), 0, 0);
        const dayOfYear = Math.floor((target.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
        const quoteIndex = dayOfYear % data.length;
        setWisdom(data[quoteIndex]);
      }
    } catch (error) {
      console.error('Error fetching daily wisdom:', error);
    } finally {
      setLoading(false);
    }
  };

  return { wisdom, loading, refetch: () => fetchDailyWisdom(date) };
}
