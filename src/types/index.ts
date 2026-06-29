export type FitnessGoal =
  | 'lose_weight'
  | 'build_muscle'
  | 'get_stronger'
  | 'improve_endurance'
  | 'general_fitness'
  | 'athletic_performance';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'triceps'
  | 'biceps'
  | 'forearms'
  | 'abs'
  | 'obliques'
  | 'glutes'
  | 'quadriceps'
  | 'hamstrings'
  | 'calves';

export type RecoveryStatus = 'recovered' | 'recovering' | 'needs_rest';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type Equipment =
  | 'barbell'
  | 'dumbbells'
  | 'kettlebell'
  | 'cables'
  | 'pull_up_bar'
  | 'resistance_bands'
  | 'bench'
  | 'squat_rack'
  | 'bodyweight';

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  gender: Gender | null;
  goal: FitnessGoal | null;
  experience: ExperienceLevel | null;
  workout_days: number | null;
  workout_time_minutes: number | null;
  equipment: Equipment[];
  medical_limitations: string | null;
  previous_injuries: string | null;
  avatar_url: string | null;
  units: 'metric' | 'imperial';
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  difficulty: Difficulty;
  equipment: Equipment[];
  primary_muscle: MuscleGroup;
  secondary_muscles: MuscleGroup[];
  instructions: string[];
  common_mistakes: string[];
  safety_tips: string[];
  pro_tips: string[];
  calories_per_minute: number;
  video_url: string | null;
  model_url: string | null;
  thumbnail_url: string | null;
  created_at: string;
}

export interface ExerciseCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export interface WorkoutPlan {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  exercises: WorkoutExercise[];
  estimated_duration_minutes: number;
  difficulty: Difficulty;
  created_at: string;
}

export interface WorkoutExercise {
  exercise_id: string;
  exercise?: Exercise;
  sets: number;
  reps: number | string;
  weight_kg: number | null;
  rest_seconds: number;
  notes: string | null;
  order: number;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  plan_id: string | null;
  name: string;
  started_at: string;
  completed_at: string | null;
  duration_minutes: number | null;
  calories_burned: number | null;
  notes: string | null;
  sets: WorkoutSet[];
}

export interface WorkoutSet {
  id: string;
  session_id: string;
  exercise_id: string;
  exercise?: Exercise;
  set_number: number;
  reps: number;
  weight_kg: number | null;
  completed: boolean;
  rpe: number | null;
  notes: string | null;
}

export interface RecoveryData {
  id: string;
  user_id: string;
  muscle_group: MuscleGroup;
  status: RecoveryStatus;
  score: number;
  last_trained_at: string | null;
  volume_last_7_days: number;
  updated_at: string;
}

export interface ProgressEntry {
  id: string;
  user_id: string;
  date: string;
  weight_kg: number | null;
  body_fat_percent: number | null;
  muscle_mass_kg: number | null;
  calories: number | null;
  workout_volume_kg: number | null;
  notes: string | null;
}

export interface Measurement {
  id: string;
  user_id: string;
  date: string;
  chest_cm: number | null;
  waist_cm: number | null;
  arms_cm: number | null;
  legs_cm: number | null;
  shoulders_cm: number | null;
  neck_cm: number | null;
  body_fat_percent: number | null;
  weight_kg: number | null;
}

export interface NutritionLog {
  id: string;
  user_id: string;
  date: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  water_ml: number;
}

export interface WaterLog {
  id: string;
  user_id: string;
  amount_ml: number;
  logged_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  title: string;
  description: string;
  unlocked_at: string;
  icon: string;
}

export interface NotificationPreference {
  id: string;
  user_id: string;
  workout_reminder: boolean;
  water_reminder: boolean;
  creatine_reminder: boolean;
  sleep_reminder: boolean;
  weekly_progress: boolean;
  motivation: boolean;
  reminder_time: string;
}

export interface AIRecommendation {
  id: string;
  type: 'workout' | 'recovery' | 'nutrition' | 'progress' | 'motivation';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  action_label?: string;
  action_route?: string;
}

export interface OnboardingData {
  name: string;
  age: number;
  height_cm: number;
  weight_kg: number;
  gender: Gender;
  goal: FitnessGoal;
  experience: ExperienceLevel;
  workout_days: number;
  workout_time_minutes: number;
  equipment: Equipment[];
  medical_limitations: string;
  previous_injuries: string;
}

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
}
