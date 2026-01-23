import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SEEN_STORIES_KEY = '@mindjoy_seen_stories';

export function useSeenStories() {
  const [seenStories, setSeenStories] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSeenStories();
  }, []);

  const loadSeenStories = async () => {
    try {
      const stored = await AsyncStorage.getItem(SEEN_STORIES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSeenStories(new Set(parsed));
      }
    } catch (error) {
      console.error('Error loading seen stories:', error);
    }
  };

  const markStoryAsSeen = async (storyId: string) => {
    try {
      // Use functional update to avoid stale closure issues and race conditions
      setSeenStories((prev) => {
        const updated = new Set(prev);
        updated.add(storyId);
        // Convert to array immediately while Set is stable, before any async operations
        const arrayToSave = Array.from(updated);
        // Save to AsyncStorage asynchronously (don't await to avoid blocking state update)
        AsyncStorage.setItem(SEEN_STORIES_KEY, JSON.stringify(arrayToSave)).catch((error) => {
          console.error('Error saving seen stories to storage:', error);
        });
        return updated;
      });
    } catch (error) {
      console.error('Error marking story as seen:', error);
    }
  };

  const isStorySeen = (storyId: string) => {
    return seenStories.has(storyId);
  };

  return {
    seenStories,
    markStoryAsSeen,
    isStorySeen,
  };
}
