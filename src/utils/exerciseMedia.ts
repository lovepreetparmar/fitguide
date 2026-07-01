import type { Exercise } from '@/types';

/** Returns the best available animated demo URL for an exercise. */
export function getExerciseDemoUrl(
  exercise: Pick<Exercise, 'thumbnail_url' | 'video_url'>
): string | null {
  const candidates = [exercise.thumbnail_url, exercise.video_url].filter(Boolean) as string[];
  return candidates.find((url) => isAnimatedDemoUrl(url)) ?? candidates[0] ?? null;
}

export function isAnimatedDemoUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return lower.endsWith('.gif') || lower.includes('.gif?') || lower.includes('/gifs/');
}

export function isVideoDemoUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov');
}
