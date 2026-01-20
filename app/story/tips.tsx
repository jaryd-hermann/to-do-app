import { StoryViewer } from '@/components/story/StoryViewer';
import { router } from 'expo-router';

const tipsStories = [
  {
    id: '1',
    headline: 'Start with your values',
    body: 'Your principles should reflect what you truly value. Think about what matters most to you in life.',
  },
  {
    id: '2',
    headline: 'Be specific',
    body: 'Vague principles are hard to follow. Make them concrete and actionable.',
  },
  {
    id: '3',
    headline: 'Keep it personal',
    body: 'These are YOUR principles. They don\'t need to impress anyone else.',
  },
  {
    id: '4',
    headline: 'Less is more',
    body: 'Start with 3-5 principles. You can always add more, but too many dilute your focus.',
  },
  {
    id: '5',
    headline: 'Test and refine',
    body: 'Your principles will evolve. Review them regularly and adjust as you learn more about yourself.',
  },
  {
    id: '6',
    headline: 'Make them actionable',
    body: 'A good principle helps you make decisions. If it doesn\'t guide your choices, refine it.',
  },
  {
    id: '7',
    headline: 'Connect to daily life',
    body: 'Your principles should connect to how you live each day. They\'re not abstract ideals.',
  },
  {
    id: '8',
    headline: 'Start now',
    body: 'Don\'t wait for perfect principles. Start with what you know, and let them evolve.',
  },
];

export default function TipsStory() {
  return (
    <StoryViewer
      visible={true}
      onClose={() => router.back()}
      stories={tipsStories}
      title="Tips on Writing Your Principles"
      storyId="tips"
    />
  );
}
