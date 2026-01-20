import { StoryViewer } from '@/components/story/StoryViewer';
import { router } from 'expo-router';

const philosophyStories = [
  {
    id: '1',
    headline: "You can't do everything",
    body: "Life is finite. Time is limited. Every yes to something is a no to something else. The illusion of being able to do it all keeps us scattered and unfocused.",
  },
  {
    id: '2',
    headline: 'Focus on what truly matters',
    body: 'When you limit yourself to just 4 tasks per day, you force yourself to prioritize. Only the most important things make the cut.',
  },
  {
    id: '3',
    headline: 'Say no to the rest',
    body: 'Every task you say yes to is a commitment of your time and energy. Learn to say no to the good so you can say yes to the great.',
  },
  {
    id: '4',
    headline: 'Align with principles',
    body: 'Your principles are your north star. When every task connects to what you truly value, your daily actions become meaningful.',
  },
  {
    id: '5',
    headline: 'The primary lever',
    body: 'Principles aren\'t just nice ideas—they\'re the primary lever for living a good and fulfilling life. They guide your decisions when you can\'t do everything.',
  },
  {
    id: '6',
    headline: 'Long-term thinking',
    body: 'Daily tasks should connect to your long-term goals. Each completed task moves you closer to who you want to become.',
  },
  {
    id: '7',
    headline: 'Quality over quantity',
    body: 'Four meaningful tasks completed beats forty tasks half-done. Depth and focus create real progress.',
  },
  {
    id: '8',
    headline: 'Living intentionally',
    body: 'Mindjoy helps you live intentionally. Fewer tasks. Better choices. A life aligned with your principles.',
  },
];

export default function PhilosophyStory() {
  return (
    <StoryViewer
      visible={true}
      onClose={() => router.back()}
      stories={philosophyStories}
      title="The Mindjoy Philosophy"
      storyId="philosophy"
    />
  );
}
