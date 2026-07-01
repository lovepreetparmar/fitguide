#!/usr/bin/env node
/**
 * Generates SQL INSERTs for muscle-group exercise library.
 * Run: node scripts/generate-exercise-seeds.mjs > database/seed_exercises_additional.sql
 */

const COMPOUND = 'c1111111-1111-1111-1111-111111111101';
const ISOLATION = 'c1111111-1111-1111-1111-111111111102';
const BODYWEIGHT = 'c1111111-1111-1111-1111-111111111104';

const ON_CONFLICT = `) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  difficulty = EXCLUDED.difficulty,
  equipment = EXCLUDED.equipment,
  primary_muscle = EXCLUDED.primary_muscle,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  common_mistakes = EXCLUDED.common_mistakes,
  safety_tips = EXCLUDED.safety_tips,
  pro_tips = EXCLUDED.pro_tips,
  calories_per_minute = EXCLUDED.calories_per_minute;`;

function arr(values) {
  if (!values.length) return 'ARRAY[]::text[]';
  return `ARRAY[${values.map((v) => `'${v.replace(/'/g, "''")}'`).join(',')}]`;
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function defaults(name, primary) {
  return {
    instructions: [
      `Set up for ${name} with proper posture and bracing.`,
      `Move through full range of motion with control.`,
      `Focus on engaging the ${primary} throughout the rep.`,
      `Return to the start position without using momentum.`,
    ],
    mistakes: ['Using too much weight', 'Rushing reps', 'Poor posture or alignment'],
    safety: ['Warm up before working sets', 'Stop if you feel sharp joint pain'],
    pro: [`Pause at peak contraction for ${name}`, 'Use a slow eccentric for more time under tension'],
  };
}

function ex(num, fields) {
  const d = defaults(fields.name, fields.primary);
  return {
    num,
    slug: fields.slug ?? slugify(fields.name),
    instructions: fields.instructions ?? d.instructions,
    mistakes: fields.mistakes ?? d.mistakes,
    safety: fields.safety ?? d.safety,
    pro: fields.pro ?? d.pro,
    ...fields,
  };
}

function insert(exercise) {
  const padded = String(exercise.num).padStart(4, '0');
  const id = `e100${padded}-0000-0000-0000-00000000${padded}`;
  return `INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  '${id}',
  '${exercise.name.replace(/'/g, "''")}',
  '${exercise.slug}',
  '${exercise.category}',
  '${exercise.difficulty}',
  ${arr(exercise.equipment)},
  '${exercise.primary}',
  ${arr(exercise.secondary)},
  ${arr(exercise.instructions)},
  ${arr(exercise.mistakes)},
  ${arr(exercise.safety)},
  ${arr(exercise.pro)},
  ${exercise.calories}
${ON_CONFLICT}`;
}

let num = 13;

const chest = [
  ex(num++, { name: 'Incline Dumbbell Press', category: COMPOUND, difficulty: 'intermediate', equipment: ['dumbbells', 'bench'], primary: 'chest', secondary: ['shoulders', 'triceps'], calories: 7 }),
  ex(num++, { name: 'Dumbbell Bench Press', category: COMPOUND, difficulty: 'beginner', equipment: ['dumbbells', 'bench'], primary: 'chest', secondary: ['triceps', 'shoulders'], calories: 7 }),
  ex(num++, { name: 'Cable Chest Fly', category: ISOLATION, difficulty: 'beginner', equipment: ['cables'], primary: 'chest', secondary: ['shoulders'], calories: 5 }),
  ex(num++, { name: 'Push-Up', category: BODYWEIGHT, difficulty: 'beginner', equipment: ['bodyweight'], primary: 'chest', secondary: ['triceps', 'shoulders', 'abs'], calories: 6 }),
  ex(num++, { name: 'Decline Bench Press', category: COMPOUND, difficulty: 'intermediate', equipment: ['barbell', 'bench'], primary: 'chest', secondary: ['triceps', 'shoulders'], calories: 8 }),
  ex(num++, { name: 'Incline Barbell Bench Press', category: COMPOUND, difficulty: 'intermediate', equipment: ['barbell', 'bench'], primary: 'chest', secondary: ['shoulders', 'triceps'], calories: 8 }),
  ex(num++, { name: 'Machine Chest Press', category: COMPOUND, difficulty: 'beginner', equipment: ['cables'], primary: 'chest', secondary: ['triceps', 'shoulders'], calories: 6 }),
  ex(num++, { name: 'Pec Deck Fly', category: ISOLATION, difficulty: 'beginner', equipment: ['cables'], primary: 'chest', secondary: [], calories: 5 }),
  ex(num++, { name: 'Dumbbell Pullover', category: COMPOUND, difficulty: 'intermediate', equipment: ['dumbbells', 'bench'], primary: 'chest', secondary: ['back', 'triceps'], calories: 6 }),
  ex(num++, { name: 'Landmine Press', category: COMPOUND, difficulty: 'intermediate', equipment: ['barbell'], primary: 'chest', secondary: ['shoulders', 'triceps'], calories: 7 }),
  ex(num++, { name: 'Svend Press', category: ISOLATION, difficulty: 'beginner', equipment: ['dumbbells'], primary: 'chest', secondary: ['shoulders'], calories: 4 }),
  ex(num++, { name: 'Floor Press', category: COMPOUND, difficulty: 'intermediate', equipment: ['barbell', 'dumbbells'], primary: 'chest', secondary: ['triceps'], calories: 7 }),
  ex(num++, { name: 'Incline Cable Fly', category: ISOLATION, difficulty: 'beginner', equipment: ['cables', 'bench'], primary: 'chest', secondary: ['shoulders'], calories: 5 }),
  ex(num++, { name: 'Diamond Push-Up', category: BODYWEIGHT, difficulty: 'intermediate', equipment: ['bodyweight'], primary: 'chest', secondary: ['triceps'], calories: 6 }),
  ex(num++, { name: 'Resistance Band Chest Press', category: COMPOUND, difficulty: 'beginner', equipment: ['bodyweight'], primary: 'chest', secondary: ['triceps', 'shoulders'], calories: 5 }),
];

const back = [
  ex(num++, { name: 'Bent-Over Barbell Row', category: COMPOUND, difficulty: 'intermediate', equipment: ['barbell'], primary: 'back', secondary: ['biceps', 'forearms'], calories: 8 }),
  ex(num++, { name: 'Seated Cable Row', category: COMPOUND, difficulty: 'beginner', equipment: ['cables'], primary: 'back', secondary: ['biceps', 'forearms'], calories: 6 }),
  ex(num++, { name: 'T-Bar Row', category: COMPOUND, difficulty: 'intermediate', equipment: ['barbell'], primary: 'back', secondary: ['biceps', 'forearms'], calories: 8 }),
  ex(num++, { name: 'Single-Arm Dumbbell Row', category: COMPOUND, difficulty: 'beginner', equipment: ['dumbbells', 'bench'], primary: 'back', secondary: ['biceps', 'forearms'], calories: 6 }),
  ex(num++, { name: 'Face Pull', category: ISOLATION, difficulty: 'beginner', equipment: ['cables'], primary: 'back', secondary: ['shoulders', 'biceps'], calories: 4 }),
  ex(num++, { name: 'Chest-Supported Row', category: COMPOUND, difficulty: 'beginner', equipment: ['dumbbells', 'bench'], primary: 'back', secondary: ['biceps'], calories: 6 }),
  ex(num++, { name: 'Pendlay Row', category: COMPOUND, difficulty: 'advanced', equipment: ['barbell'], primary: 'back', secondary: ['biceps', 'forearms'], calories: 8 }),
  ex(num++, { name: 'Straight-Arm Pulldown', category: ISOLATION, difficulty: 'beginner', equipment: ['cables'], primary: 'back', secondary: ['triceps'], calories: 5 }),
  ex(num++, { name: 'Inverted Row', category: BODYWEIGHT, difficulty: 'beginner', equipment: ['bodyweight', 'pull_up_bar'], primary: 'back', secondary: ['biceps', 'forearms'], calories: 6 }),
  ex(num++, { name: 'Meadows Row', category: COMPOUND, difficulty: 'intermediate', equipment: ['barbell'], primary: 'back', secondary: ['biceps', 'forearms'], calories: 7 }),
  ex(num++, { name: 'Wide-Grip Cable Row', category: COMPOUND, difficulty: 'beginner', equipment: ['cables'], primary: 'back', secondary: ['biceps'], calories: 6 }),
  ex(num++, { name: 'Machine High Row', category: COMPOUND, difficulty: 'beginner', equipment: ['cables'], primary: 'back', secondary: ['biceps'], calories: 6 }),
  ex(num++, { name: 'Rack Pull', category: COMPOUND, difficulty: 'intermediate', equipment: ['barbell', 'squat_rack'], primary: 'back', secondary: ['glutes', 'hamstrings', 'forearms'], calories: 9 }),
  ex(num++, { name: 'Resistance Band Row', category: COMPOUND, difficulty: 'beginner', equipment: ['bodyweight'], primary: 'back', secondary: ['biceps'], calories: 5 }),
  ex(num++, { name: 'Seal Row', category: COMPOUND, difficulty: 'intermediate', equipment: ['barbell', 'bench'], primary: 'back', secondary: ['biceps'], calories: 7 }),
];

const shoulders = [
  ex(num++, { name: 'Dumbbell Shoulder Press', category: COMPOUND, difficulty: 'beginner', equipment: ['dumbbells', 'bench'], primary: 'shoulders', secondary: ['triceps', 'abs'], calories: 7 }),
  ex(num++, { name: 'Lateral Raise', category: ISOLATION, difficulty: 'beginner', equipment: ['dumbbells'], primary: 'shoulders', secondary: [], calories: 4 }),
  ex(num++, { name: 'Arnold Press', category: COMPOUND, difficulty: 'intermediate', equipment: ['dumbbells', 'bench'], primary: 'shoulders', secondary: ['triceps'], calories: 7 }),
  ex(num++, { name: 'Front Raise', category: ISOLATION, difficulty: 'beginner', equipment: ['dumbbells'], primary: 'shoulders', secondary: ['abs'], calories: 4 }),
  ex(num++, { name: 'Rear Delt Fly', category: ISOLATION, difficulty: 'beginner', equipment: ['dumbbells'], primary: 'shoulders', secondary: ['back'], calories: 4 }),
  ex(num++, { name: 'Cable Lateral Raise', category: ISOLATION, difficulty: 'beginner', equipment: ['cables'], primary: 'shoulders', secondary: [], calories: 4 }),
  ex(num++, { name: 'Upright Row', category: COMPOUND, difficulty: 'intermediate', equipment: ['barbell', 'dumbbells'], primary: 'shoulders', secondary: ['triceps', 'forearms'], calories: 6 }),
  ex(num++, { name: 'Push Press', category: COMPOUND, difficulty: 'intermediate', equipment: ['barbell'], primary: 'shoulders', secondary: ['triceps', 'quadriceps'], calories: 8 }),
  ex(num++, { name: 'Machine Shoulder Press', category: COMPOUND, difficulty: 'beginner', equipment: ['cables'], primary: 'shoulders', secondary: ['triceps'], calories: 6 }),
  ex(num++, { name: 'Lu Raise', category: ISOLATION, difficulty: 'intermediate', equipment: ['dumbbells'], primary: 'shoulders', secondary: ['back'], calories: 5 }),
  ex(num++, { name: 'Cable Face Pull to Press', category: COMPOUND, difficulty: 'intermediate', equipment: ['cables'], primary: 'shoulders', secondary: ['back', 'triceps'], calories: 6 }),
  ex(num++, { name: 'Plate Front Raise', category: ISOLATION, difficulty: 'beginner', equipment: ['barbell'], primary: 'shoulders', secondary: [], calories: 4 }),
  ex(num++, { name: 'Y Raise', category: ISOLATION, difficulty: 'beginner', equipment: ['dumbbells'], primary: 'shoulders', secondary: ['back'], calories: 4 }),
  ex(num++, { name: 'Bradford Press', category: COMPOUND, difficulty: 'advanced', equipment: ['barbell'], primary: 'shoulders', secondary: ['triceps'], calories: 7 }),
  ex(num++, { name: 'Landmine Press Shoulder', slug: 'landmine-shoulder-press', category: COMPOUND, difficulty: 'intermediate', equipment: ['barbell'], primary: 'shoulders', secondary: ['chest', 'triceps'], calories: 7 }),
];

const triceps = [
  ex(num++, { name: 'Skull Crusher', category: ISOLATION, difficulty: 'intermediate', equipment: ['barbell', 'bench'], primary: 'triceps', secondary: [], calories: 5 }),
  ex(num++, { name: 'Overhead Tricep Extension', category: ISOLATION, difficulty: 'beginner', equipment: ['dumbbells'], primary: 'triceps', secondary: ['abs'], calories: 4 }),
  ex(num++, { name: 'Close-Grip Bench Press', category: COMPOUND, difficulty: 'intermediate', equipment: ['barbell', 'bench'], primary: 'triceps', secondary: ['chest', 'shoulders'], calories: 8 }),
  ex(num++, { name: 'Tricep Kickback', category: ISOLATION, difficulty: 'beginner', equipment: ['dumbbells'], primary: 'triceps', secondary: [], calories: 4 }),
  ex(num++, { name: 'Bench Dip', category: BODYWEIGHT, difficulty: 'beginner', equipment: ['bench', 'bodyweight'], primary: 'triceps', secondary: ['chest', 'shoulders'], calories: 5 }),
  ex(num++, { name: 'Cable Overhead Extension', category: ISOLATION, difficulty: 'beginner', equipment: ['cables'], primary: 'triceps', secondary: [], calories: 4 }),
  ex(num++, { name: 'JM Press', category: COMPOUND, difficulty: 'advanced', equipment: ['barbell', 'bench'], primary: 'triceps', secondary: ['chest'], calories: 7 }),
  ex(num++, { name: 'Single-Arm Cable Pushdown', category: ISOLATION, difficulty: 'beginner', equipment: ['cables'], primary: 'triceps', secondary: [], calories: 4 }),
  ex(num++, { name: 'Dumbbell Tate Press', category: ISOLATION, difficulty: 'intermediate', equipment: ['dumbbells', 'bench'], primary: 'triceps', secondary: [], calories: 5 }),
  ex(num++, { name: 'Parallel Bar Dip', category: BODYWEIGHT, difficulty: 'intermediate', equipment: ['bodyweight', 'pull_up_bar'], primary: 'triceps', secondary: ['chest', 'shoulders'], calories: 7 }),
  ex(num++, { name: 'Reverse-Grip Pushdown', category: ISOLATION, difficulty: 'beginner', equipment: ['cables'], primary: 'triceps', secondary: [], calories: 4 }),
  ex(num++, { name: 'EZ Bar Skull Crusher', category: ISOLATION, difficulty: 'intermediate', equipment: ['barbell', 'bench'], primary: 'triceps', secondary: [], calories: 5 }),
  ex(num++, { name: 'Floor Skull Crusher', category: ISOLATION, difficulty: 'intermediate', equipment: ['dumbbells'], primary: 'triceps', secondary: [], calories: 5 }),
  ex(num++, { name: 'Resistance Band Pushdown', category: ISOLATION, difficulty: 'beginner', equipment: ['bodyweight'], primary: 'triceps', secondary: [], calories: 4 }),
  ex(num++, { name: 'Machine Tricep Extension', category: ISOLATION, difficulty: 'beginner', equipment: ['cables'], primary: 'triceps', secondary: [], calories: 4 }),
];

const biceps = [
  ex(num++, { name: 'Hammer Curl', category: ISOLATION, difficulty: 'beginner', equipment: ['dumbbells'], primary: 'biceps', secondary: ['forearms'], calories: 4 }),
  ex(num++, { name: 'Barbell Curl', category: ISOLATION, difficulty: 'beginner', equipment: ['barbell'], primary: 'biceps', secondary: ['forearms'], calories: 4 }),
  ex(num++, { name: 'Preacher Curl', category: ISOLATION, difficulty: 'intermediate', equipment: ['barbell', 'bench'], primary: 'biceps', secondary: ['forearms'], calories: 4 }),
  ex(num++, { name: 'Concentration Curl', category: ISOLATION, difficulty: 'beginner', equipment: ['dumbbells'], primary: 'biceps', secondary: ['forearms'], calories: 4 }),
  ex(num++, { name: 'Cable Curl', category: ISOLATION, difficulty: 'beginner', equipment: ['cables'], primary: 'biceps', secondary: ['forearms'], calories: 4 }),
  ex(num++, { name: 'Incline Dumbbell Curl', category: ISOLATION, difficulty: 'intermediate', equipment: ['dumbbells', 'bench'], primary: 'biceps', secondary: ['forearms'], calories: 4 }),
  ex(num++, { name: 'EZ Bar Curl', category: ISOLATION, difficulty: 'beginner', equipment: ['barbell'], primary: 'biceps', secondary: ['forearms'], calories: 4 }),
  ex(num++, { name: 'Spider Curl', category: ISOLATION, difficulty: 'intermediate', equipment: ['barbell', 'bench'], primary: 'biceps', secondary: ['forearms'], calories: 4 }),
  ex(num++, { name: 'Cable Hammer Curl', category: ISOLATION, difficulty: 'beginner', equipment: ['cables'], primary: 'biceps', secondary: ['forearms'], calories: 4 }),
  ex(num++, { name: 'Reverse Curl', category: ISOLATION, difficulty: 'beginner', equipment: ['barbell', 'dumbbells'], primary: 'biceps', secondary: ['forearms'], calories: 4 }),
  ex(num++, { name: 'Drag Curl', category: ISOLATION, difficulty: 'intermediate', equipment: ['barbell'], primary: 'biceps', secondary: ['forearms'], calories: 4 }),
  ex(num++, { name: 'Machine Bicep Curl', category: ISOLATION, difficulty: 'beginner', equipment: ['cables'], primary: 'biceps', secondary: ['forearms'], calories: 4 }),
  ex(num++, { name: 'Cross-Body Hammer Curl', category: ISOLATION, difficulty: 'beginner', equipment: ['dumbbells'], primary: 'biceps', secondary: ['forearms'], calories: 4 }),
  ex(num++, { name: '21s Curl', category: ISOLATION, difficulty: 'advanced', equipment: ['barbell'], primary: 'biceps', secondary: ['forearms'], calories: 5 }),
  ex(num++, { name: 'Resistance Band Curl', category: ISOLATION, difficulty: 'beginner', equipment: ['bodyweight'], primary: 'biceps', secondary: ['forearms'], calories: 4 }),
];

const legs = [
  ex(num++, { name: 'Walking Lunge', category: COMPOUND, difficulty: 'beginner', equipment: ['dumbbells', 'bodyweight'], primary: 'quadriceps', secondary: ['glutes', 'hamstrings'], calories: 8 }),
  ex(num++, { name: 'Leg Curl', category: ISOLATION, difficulty: 'beginner', equipment: ['cables'], primary: 'hamstrings', secondary: ['glutes'], calories: 5 }),
  ex(num++, { name: 'Bulgarian Split Squat', category: COMPOUND, difficulty: 'intermediate', equipment: ['dumbbells', 'bench'], primary: 'quadriceps', secondary: ['glutes', 'hamstrings'], calories: 8 }),
  ex(num++, { name: 'Standing Calf Raise', category: ISOLATION, difficulty: 'beginner', equipment: ['bodyweight', 'dumbbells'], primary: 'calves', secondary: [], calories: 4 }),
  ex(num++, { name: 'Goblet Squat', category: COMPOUND, difficulty: 'beginner', equipment: ['dumbbells'], primary: 'quadriceps', secondary: ['glutes', 'abs'], calories: 8 }),
  ex(num++, { name: 'Leg Extension', category: ISOLATION, difficulty: 'beginner', equipment: ['cables'], primary: 'quadriceps', secondary: [], calories: 5 }),
  ex(num++, { name: 'Front Squat', category: COMPOUND, difficulty: 'advanced', equipment: ['barbell', 'squat_rack'], primary: 'quadriceps', secondary: ['glutes', 'abs'], calories: 10 }),
  ex(num++, { name: 'Hack Squat', category: COMPOUND, difficulty: 'intermediate', equipment: ['cables', 'squat_rack'], primary: 'quadriceps', secondary: ['glutes', 'hamstrings'], calories: 9 }),
  ex(num++, { name: 'Step-Up', category: COMPOUND, difficulty: 'beginner', equipment: ['dumbbells', 'bench'], primary: 'quadriceps', secondary: ['glutes', 'hamstrings'], calories: 7 }),
  ex(num++, { name: 'Romanian Deadlift Single Leg', slug: 'single-leg-romanian-deadlift', category: COMPOUND, difficulty: 'intermediate', equipment: ['dumbbells'], primary: 'hamstrings', secondary: ['glutes', 'back'], calories: 7 }),
  ex(num++, { name: 'Seated Calf Raise', category: ISOLATION, difficulty: 'beginner', equipment: ['dumbbells', 'bench'], primary: 'calves', secondary: [], calories: 4 }),
  ex(num++, { name: 'Sumo Deadlift', category: COMPOUND, difficulty: 'intermediate', equipment: ['barbell'], primary: 'glutes', secondary: ['hamstrings', 'quadriceps', 'back'], calories: 10 }),
  ex(num++, { name: 'Box Squat', category: COMPOUND, difficulty: 'intermediate', equipment: ['barbell', 'squat_rack', 'bench'], primary: 'quadriceps', secondary: ['glutes', 'hamstrings'], calories: 9 }),
  ex(num++, { name: 'Nordic Hamstring Curl', category: BODYWEIGHT, difficulty: 'advanced', equipment: ['bodyweight', 'bench'], primary: 'hamstrings', secondary: ['glutes'], calories: 6 }),
  ex(num++, { name: 'Cable Pull-Through', category: COMPOUND, difficulty: 'beginner', equipment: ['cables'], primary: 'glutes', secondary: ['hamstrings', 'back'], calories: 6 }),
];

const exercises = [...chest, ...back, ...shoulders, ...triceps, ...biceps, ...legs];

if (exercises.length !== 90) {
  console.error(`Expected 90 exercises, got ${exercises.length}`);
  process.exit(1);
}

const header = `-- ============================================================
-- Fit Guide — Muscle group exercise library (90)
-- Chest, back, shoulders, triceps, biceps, legs (15 each)
-- Safe to re-run (ON CONFLICT updates by slug)
-- Run standalone or as part of full setup
-- ============================================================

`;

process.stdout.write(header + exercises.map(insert).join('\n\n') + '\n');
