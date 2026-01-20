import { StoryViewer } from '@/components/story/StoryViewer';
import { router } from 'expo-router';

const goalsStories = [
  {
    id: '1',
    headline: 'Goals connect to principles',
    body: 'Every goal should align with one of your core principles. This ensures your goals reflect what truly matters to you.',
  },
  {
    id: '2',
    headline: 'Focus on what matters',
    body: 'You can have up to 5 active goals, with one priority goal. This constraint forces you to focus on what\'s most important.',
  },
  {
    id: '3',
    headline: 'Link tasks to goals',
    body: 'When you create tasks, link them to goals. This connects your daily actions to your long-term aspirations.',
  },
  {
    id: '4',
    headline: 'Track your progress',
    body: 'See how many actions you\'ve taken toward each goal. Every task completed moves you closer.',
  },
  {
    id: '5',
    headline: 'One priority goal',
    body: 'Your priority goal (position 0) gets the most visual emphasis. This is your north star—the most important thing you\'re working toward.',
  },
  {
    id: '6',
    headline: 'Active vs inactive',
    body: 'Goals can be active (working on them) or inactive (on hold). You can always reactivate inactive goals when you\'re ready.',
  },
  {
    id: '7',
    headline: 'Achieve and celebrate',
    body: 'When you achieve a goal, mark it as achieved. Celebrate your progress and free up space for new goals.',
  },
  {
    id: '8',
    headline: 'Long-term thinking',
    body: 'Goals help you think beyond today. They connect your daily tasks to your long-term vision and values.',
  },
];

export default function GoalsStory() {
  return (
    <StoryViewer
      visible={true}
      onClose={() => router.back()}
      stories={goalsStories}
      title="Goals Philosophy"
      storyId="goals"
    />
  );
}
