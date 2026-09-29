import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useWorkoutStore } from '@/store/workoutStore';
import { workoutService } from '@/services/workout';

export function useWorkoutStartGuard() {
  const router = useRouter();
  const activeSession = useWorkoutStore((state) => state.activeSession);
  const isPaused = useWorkoutStore((state) => state.isPaused);
  const resumeActiveWorkout = useWorkoutStore((state) => state.resumeActiveWorkout);
  const abandonActiveWorkout = useWorkoutStore((state) => state.abandonActiveWorkout);

  const openActiveWorkout = () => {
    if (!resumeActiveWorkout()) return;
    router.navigate('/workout/player');
  };

  const ensureNoActiveWorkout = (onAllowed: () => void) => {
    if (!activeSession) {
      onAllowed();
      return;
    }

    Alert.alert(
      'Workout Already in Progress',
      'You can only run one workout at a time. Resume your current session or end it before starting another.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Resume Workout', onPress: openActiveWorkout },
      ]
    );
  };

  const ensureCanGenerateWorkout = (onAllowed: () => void) => {
    if (!activeSession) {
      onAllowed();
      return;
    }

    const statusLabel = isPaused ? 'paused' : 'in progress';

    Alert.alert(
      'Replace Current Workout?',
      `You have a workout ${statusLabel}. Generating a new plan will clear your current session and cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Resume Workout', onPress: openActiveWorkout },
        {
          text: 'Generate New',
          style: 'destructive',
          onPress: () => {
            const session = useWorkoutStore.getState().activeSession;
            abandonActiveWorkout();
            if (session) {
              void workoutService.abandonSession(session.user_id, session.id);
            }
            onAllowed();
          },
        },
      ]
    );
  };

  return {
    hasActiveWorkout: !!activeSession,
    ensureNoActiveWorkout,
    ensureCanGenerateWorkout,
    openActiveWorkout,
  };
}
