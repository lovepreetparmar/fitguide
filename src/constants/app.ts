export const APP_NAME = 'Fit Guide';
export const APP_TAGLINE = 'Train Smarter.\nLift Better.';

export const FITNESS_GOALS = [
  { id: 'lose_weight', label: 'Lose Weight', icon: 'trending-down' },
  { id: 'build_muscle', label: 'Build Muscle', icon: 'fitness' },
  { id: 'get_stronger', label: 'Get Stronger', icon: 'barbell' },
  { id: 'improve_endurance', label: 'Improve Endurance', icon: 'heart' },
  { id: 'general_fitness', label: 'General Fitness', icon: 'body' },
  { id: 'athletic_performance', label: 'Athletic Performance', icon: 'trophy' },
] as const;

export const EXPERIENCE_LEVELS = [
  { id: 'beginner', label: 'Beginner', description: 'Less than 1 year' },
  { id: 'intermediate', label: 'Intermediate', description: '1-3 years' },
  { id: 'advanced', label: 'Advanced', description: '3+ years' },
] as const;

export const WORKOUT_DAYS = [
  { id: 2, label: '2 days/week' },
  { id: 3, label: '3 days/week' },
  { id: 4, label: '4 days/week' },
  { id: 5, label: '5 days/week' },
  { id: 6, label: '6 days/week' },
] as const;

export const EQUIPMENT_OPTIONS = [
  { id: 'barbell', label: 'Barbell' },
  { id: 'dumbbells', label: 'Dumbbells' },
  { id: 'kettlebell', label: 'Kettlebell' },
  { id: 'cables', label: 'Cable Machine' },
  { id: 'pull_up_bar', label: 'Pull-up Bar' },
  { id: 'resistance_bands', label: 'Resistance Bands' },
  { id: 'bench', label: 'Bench' },
  { id: 'squat_rack', label: 'Squat Rack' },
  { id: 'bodyweight', label: 'Bodyweight Only' },
] as const;

export const GENDER_OPTIONS = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
  { id: 'other', label: 'Other' },
  { id: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const;

export const MUSCLE_GROUPS = [
  { id: 'chest', label: 'Chest', color: '#FF6B6B' },
  { id: 'back', label: 'Back', color: '#4ECDC4' },
  { id: 'shoulders', label: 'Shoulders', color: '#45B7D1' },
  { id: 'triceps', label: 'Triceps', color: '#96CEB4' },
  { id: 'biceps', label: 'Biceps', color: '#FFEAA7' },
  { id: 'forearms', label: 'Forearms', color: '#DDA0DD' },
  { id: 'abs', label: 'Abs', color: '#98D8C8' },
  { id: 'obliques', label: 'Obliques', color: '#F7DC6F' },
  { id: 'glutes', label: 'Glutes', color: '#BB8FCE' },
  { id: 'quadriceps', label: 'Quadriceps', color: '#85C1E9' },
  { id: 'hamstrings', label: 'Hamstrings', color: '#F8B500' },
  { id: 'calves', label: 'Calves', color: '#82E0AA' },
] as const;

export const ACHIEVEMENTS = [
  { id: 'first_workout', title: 'First Workout', description: 'Complete your first workout', icon: 'star' },
  { id: 'ten_workouts', title: '10 Workouts', description: 'Complete 10 workouts', icon: 'medal' },
  { id: 'thirty_day_streak', title: '30 Day Streak', description: 'Work out for 30 days straight', icon: 'flame' },
  { id: 'hundred_sessions', title: '100 Sessions', description: 'Complete 100 workout sessions', icon: 'trophy' },
  { id: 'thousand_kg', title: '1000kg Lifted', description: 'Lift a total of 1000kg', icon: 'barbell' },
  { id: 'personal_record', title: 'Personal Record', description: 'Set a new personal record', icon: 'ribbon' },
] as const;
