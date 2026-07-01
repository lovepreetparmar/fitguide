-- ============================================================
-- Fit Guide — Muscle group exercise library (90)
-- Chest, back, shoulders, triceps, biceps, legs (15 each)
-- Safe to re-run (ON CONFLICT updates by slug)
-- Run standalone or as part of full setup
-- ============================================================

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000013-0000-0000-0000-000000000013',
  'Incline Dumbbell Press',
  'incline-dumbbell-press',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['dumbbells','bench'],
  'chest',
  ARRAY['shoulders','triceps'],
  ARRAY['Set up for Incline Dumbbell Press with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the chest throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Incline Dumbbell Press','Use a slow eccentric for more time under tension'],
  7
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000014-0000-0000-0000-000000000014',
  'Dumbbell Bench Press',
  'dumbbell-bench-press',
  'c1111111-1111-1111-1111-111111111101',
  'beginner',
  ARRAY['dumbbells','bench'],
  'chest',
  ARRAY['triceps','shoulders'],
  ARRAY['Set up for Dumbbell Bench Press with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the chest throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Dumbbell Bench Press','Use a slow eccentric for more time under tension'],
  7
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000015-0000-0000-0000-000000000015',
  'Cable Chest Fly',
  'cable-chest-fly',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['cables'],
  'chest',
  ARRAY['shoulders'],
  ARRAY['Set up for Cable Chest Fly with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the chest throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Cable Chest Fly','Use a slow eccentric for more time under tension'],
  5
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000016-0000-0000-0000-000000000016',
  'Push-Up',
  'push-up',
  'c1111111-1111-1111-1111-111111111104',
  'beginner',
  ARRAY['bodyweight'],
  'chest',
  ARRAY['triceps','shoulders','abs'],
  ARRAY['Set up for Push-Up with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the chest throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Push-Up','Use a slow eccentric for more time under tension'],
  6
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000017-0000-0000-0000-000000000017',
  'Decline Bench Press',
  'decline-bench-press',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['barbell','bench'],
  'chest',
  ARRAY['triceps','shoulders'],
  ARRAY['Set up for Decline Bench Press with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the chest throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Decline Bench Press','Use a slow eccentric for more time under tension'],
  8
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000018-0000-0000-0000-000000000018',
  'Incline Barbell Bench Press',
  'incline-barbell-bench-press',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['barbell','bench'],
  'chest',
  ARRAY['shoulders','triceps'],
  ARRAY['Set up for Incline Barbell Bench Press with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the chest throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Incline Barbell Bench Press','Use a slow eccentric for more time under tension'],
  8
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000019-0000-0000-0000-000000000019',
  'Machine Chest Press',
  'machine-chest-press',
  'c1111111-1111-1111-1111-111111111101',
  'beginner',
  ARRAY['cables'],
  'chest',
  ARRAY['triceps','shoulders'],
  ARRAY['Set up for Machine Chest Press with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the chest throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Machine Chest Press','Use a slow eccentric for more time under tension'],
  6
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000020-0000-0000-0000-000000000020',
  'Pec Deck Fly',
  'pec-deck-fly',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['cables'],
  'chest',
  ARRAY[]::text[],
  ARRAY['Set up for Pec Deck Fly with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the chest throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Pec Deck Fly','Use a slow eccentric for more time under tension'],
  5
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000021-0000-0000-0000-000000000021',
  'Dumbbell Pullover',
  'dumbbell-pullover',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['dumbbells','bench'],
  'chest',
  ARRAY['back','triceps'],
  ARRAY['Set up for Dumbbell Pullover with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the chest throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Dumbbell Pullover','Use a slow eccentric for more time under tension'],
  6
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000022-0000-0000-0000-000000000022',
  'Landmine Press',
  'landmine-press',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['barbell'],
  'chest',
  ARRAY['shoulders','triceps'],
  ARRAY['Set up for Landmine Press with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the chest throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Landmine Press','Use a slow eccentric for more time under tension'],
  7
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000023-0000-0000-0000-000000000023',
  'Svend Press',
  'svend-press',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['dumbbells'],
  'chest',
  ARRAY['shoulders'],
  ARRAY['Set up for Svend Press with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the chest throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Svend Press','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000024-0000-0000-0000-000000000024',
  'Floor Press',
  'floor-press',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['barbell','dumbbells'],
  'chest',
  ARRAY['triceps'],
  ARRAY['Set up for Floor Press with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the chest throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Floor Press','Use a slow eccentric for more time under tension'],
  7
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000025-0000-0000-0000-000000000025',
  'Incline Cable Fly',
  'incline-cable-fly',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['cables','bench'],
  'chest',
  ARRAY['shoulders'],
  ARRAY['Set up for Incline Cable Fly with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the chest throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Incline Cable Fly','Use a slow eccentric for more time under tension'],
  5
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000026-0000-0000-0000-000000000026',
  'Diamond Push-Up',
  'diamond-push-up',
  'c1111111-1111-1111-1111-111111111104',
  'intermediate',
  ARRAY['bodyweight'],
  'chest',
  ARRAY['triceps'],
  ARRAY['Set up for Diamond Push-Up with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the chest throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Diamond Push-Up','Use a slow eccentric for more time under tension'],
  6
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000027-0000-0000-0000-000000000027',
  'Resistance Band Chest Press',
  'resistance-band-chest-press',
  'c1111111-1111-1111-1111-111111111101',
  'beginner',
  ARRAY['bodyweight'],
  'chest',
  ARRAY['triceps','shoulders'],
  ARRAY['Set up for Resistance Band Chest Press with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the chest throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Resistance Band Chest Press','Use a slow eccentric for more time under tension'],
  5
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000028-0000-0000-0000-000000000028',
  'Bent-Over Barbell Row',
  'bent-over-barbell-row',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['barbell'],
  'back',
  ARRAY['biceps','forearms'],
  ARRAY['Set up for Bent-Over Barbell Row with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the back throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Bent-Over Barbell Row','Use a slow eccentric for more time under tension'],
  8
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000029-0000-0000-0000-000000000029',
  'Seated Cable Row',
  'seated-cable-row',
  'c1111111-1111-1111-1111-111111111101',
  'beginner',
  ARRAY['cables'],
  'back',
  ARRAY['biceps','forearms'],
  ARRAY['Set up for Seated Cable Row with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the back throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Seated Cable Row','Use a slow eccentric for more time under tension'],
  6
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000030-0000-0000-0000-000000000030',
  'T-Bar Row',
  't-bar-row',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['barbell'],
  'back',
  ARRAY['biceps','forearms'],
  ARRAY['Set up for T-Bar Row with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the back throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for T-Bar Row','Use a slow eccentric for more time under tension'],
  8
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000031-0000-0000-0000-000000000031',
  'Single-Arm Dumbbell Row',
  'single-arm-dumbbell-row',
  'c1111111-1111-1111-1111-111111111101',
  'beginner',
  ARRAY['dumbbells','bench'],
  'back',
  ARRAY['biceps','forearms'],
  ARRAY['Set up for Single-Arm Dumbbell Row with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the back throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Single-Arm Dumbbell Row','Use a slow eccentric for more time under tension'],
  6
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000032-0000-0000-0000-000000000032',
  'Face Pull',
  'face-pull',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['cables'],
  'back',
  ARRAY['shoulders','biceps'],
  ARRAY['Set up for Face Pull with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the back throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Face Pull','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000033-0000-0000-0000-000000000033',
  'Chest-Supported Row',
  'chest-supported-row',
  'c1111111-1111-1111-1111-111111111101',
  'beginner',
  ARRAY['dumbbells','bench'],
  'back',
  ARRAY['biceps'],
  ARRAY['Set up for Chest-Supported Row with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the back throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Chest-Supported Row','Use a slow eccentric for more time under tension'],
  6
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000034-0000-0000-0000-000000000034',
  'Pendlay Row',
  'pendlay-row',
  'c1111111-1111-1111-1111-111111111101',
  'advanced',
  ARRAY['barbell'],
  'back',
  ARRAY['biceps','forearms'],
  ARRAY['Set up for Pendlay Row with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the back throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Pendlay Row','Use a slow eccentric for more time under tension'],
  8
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000035-0000-0000-0000-000000000035',
  'Straight-Arm Pulldown',
  'straight-arm-pulldown',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['cables'],
  'back',
  ARRAY['triceps'],
  ARRAY['Set up for Straight-Arm Pulldown with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the back throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Straight-Arm Pulldown','Use a slow eccentric for more time under tension'],
  5
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000036-0000-0000-0000-000000000036',
  'Inverted Row',
  'inverted-row',
  'c1111111-1111-1111-1111-111111111104',
  'beginner',
  ARRAY['bodyweight','pull_up_bar'],
  'back',
  ARRAY['biceps','forearms'],
  ARRAY['Set up for Inverted Row with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the back throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Inverted Row','Use a slow eccentric for more time under tension'],
  6
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000037-0000-0000-0000-000000000037',
  'Meadows Row',
  'meadows-row',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['barbell'],
  'back',
  ARRAY['biceps','forearms'],
  ARRAY['Set up for Meadows Row with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the back throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Meadows Row','Use a slow eccentric for more time under tension'],
  7
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000038-0000-0000-0000-000000000038',
  'Wide-Grip Cable Row',
  'wide-grip-cable-row',
  'c1111111-1111-1111-1111-111111111101',
  'beginner',
  ARRAY['cables'],
  'back',
  ARRAY['biceps'],
  ARRAY['Set up for Wide-Grip Cable Row with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the back throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Wide-Grip Cable Row','Use a slow eccentric for more time under tension'],
  6
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000039-0000-0000-0000-000000000039',
  'Machine High Row',
  'machine-high-row',
  'c1111111-1111-1111-1111-111111111101',
  'beginner',
  ARRAY['cables'],
  'back',
  ARRAY['biceps'],
  ARRAY['Set up for Machine High Row with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the back throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Machine High Row','Use a slow eccentric for more time under tension'],
  6
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000040-0000-0000-0000-000000000040',
  'Rack Pull',
  'rack-pull',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['barbell','squat_rack'],
  'back',
  ARRAY['glutes','hamstrings','forearms'],
  ARRAY['Set up for Rack Pull with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the back throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Rack Pull','Use a slow eccentric for more time under tension'],
  9
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000041-0000-0000-0000-000000000041',
  'Resistance Band Row',
  'resistance-band-row',
  'c1111111-1111-1111-1111-111111111101',
  'beginner',
  ARRAY['bodyweight'],
  'back',
  ARRAY['biceps'],
  ARRAY['Set up for Resistance Band Row with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the back throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Resistance Band Row','Use a slow eccentric for more time under tension'],
  5
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000042-0000-0000-0000-000000000042',
  'Seal Row',
  'seal-row',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['barbell','bench'],
  'back',
  ARRAY['biceps'],
  ARRAY['Set up for Seal Row with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the back throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Seal Row','Use a slow eccentric for more time under tension'],
  7
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000043-0000-0000-0000-000000000043',
  'Dumbbell Shoulder Press',
  'dumbbell-shoulder-press',
  'c1111111-1111-1111-1111-111111111101',
  'beginner',
  ARRAY['dumbbells','bench'],
  'shoulders',
  ARRAY['triceps','abs'],
  ARRAY['Set up for Dumbbell Shoulder Press with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the shoulders throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Dumbbell Shoulder Press','Use a slow eccentric for more time under tension'],
  7
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000044-0000-0000-0000-000000000044',
  'Lateral Raise',
  'lateral-raise',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['dumbbells'],
  'shoulders',
  ARRAY[]::text[],
  ARRAY['Set up for Lateral Raise with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the shoulders throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Lateral Raise','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000045-0000-0000-0000-000000000045',
  'Arnold Press',
  'arnold-press',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['dumbbells','bench'],
  'shoulders',
  ARRAY['triceps'],
  ARRAY['Set up for Arnold Press with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the shoulders throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Arnold Press','Use a slow eccentric for more time under tension'],
  7
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000046-0000-0000-0000-000000000046',
  'Front Raise',
  'front-raise',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['dumbbells'],
  'shoulders',
  ARRAY['abs'],
  ARRAY['Set up for Front Raise with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the shoulders throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Front Raise','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000047-0000-0000-0000-000000000047',
  'Rear Delt Fly',
  'rear-delt-fly',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['dumbbells'],
  'shoulders',
  ARRAY['back'],
  ARRAY['Set up for Rear Delt Fly with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the shoulders throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Rear Delt Fly','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000048-0000-0000-0000-000000000048',
  'Cable Lateral Raise',
  'cable-lateral-raise',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['cables'],
  'shoulders',
  ARRAY[]::text[],
  ARRAY['Set up for Cable Lateral Raise with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the shoulders throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Cable Lateral Raise','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000049-0000-0000-0000-000000000049',
  'Upright Row',
  'upright-row',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['barbell','dumbbells'],
  'shoulders',
  ARRAY['triceps','forearms'],
  ARRAY['Set up for Upright Row with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the shoulders throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Upright Row','Use a slow eccentric for more time under tension'],
  6
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000050-0000-0000-0000-000000000050',
  'Push Press',
  'push-press',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['barbell'],
  'shoulders',
  ARRAY['triceps','quadriceps'],
  ARRAY['Set up for Push Press with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the shoulders throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Push Press','Use a slow eccentric for more time under tension'],
  8
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000051-0000-0000-0000-000000000051',
  'Machine Shoulder Press',
  'machine-shoulder-press',
  'c1111111-1111-1111-1111-111111111101',
  'beginner',
  ARRAY['cables'],
  'shoulders',
  ARRAY['triceps'],
  ARRAY['Set up for Machine Shoulder Press with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the shoulders throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Machine Shoulder Press','Use a slow eccentric for more time under tension'],
  6
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000052-0000-0000-0000-000000000052',
  'Lu Raise',
  'lu-raise',
  'c1111111-1111-1111-1111-111111111102',
  'intermediate',
  ARRAY['dumbbells'],
  'shoulders',
  ARRAY['back'],
  ARRAY['Set up for Lu Raise with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the shoulders throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Lu Raise','Use a slow eccentric for more time under tension'],
  5
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000053-0000-0000-0000-000000000053',
  'Cable Face Pull to Press',
  'cable-face-pull-to-press',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['cables'],
  'shoulders',
  ARRAY['back','triceps'],
  ARRAY['Set up for Cable Face Pull to Press with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the shoulders throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Cable Face Pull to Press','Use a slow eccentric for more time under tension'],
  6
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000054-0000-0000-0000-000000000054',
  'Plate Front Raise',
  'plate-front-raise',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['barbell'],
  'shoulders',
  ARRAY[]::text[],
  ARRAY['Set up for Plate Front Raise with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the shoulders throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Plate Front Raise','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000055-0000-0000-0000-000000000055',
  'Y Raise',
  'y-raise',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['dumbbells'],
  'shoulders',
  ARRAY['back'],
  ARRAY['Set up for Y Raise with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the shoulders throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Y Raise','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000056-0000-0000-0000-000000000056',
  'Bradford Press',
  'bradford-press',
  'c1111111-1111-1111-1111-111111111101',
  'advanced',
  ARRAY['barbell'],
  'shoulders',
  ARRAY['triceps'],
  ARRAY['Set up for Bradford Press with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the shoulders throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Bradford Press','Use a slow eccentric for more time under tension'],
  7
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000057-0000-0000-0000-000000000057',
  'Landmine Press Shoulder',
  'landmine-shoulder-press',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['barbell'],
  'shoulders',
  ARRAY['chest','triceps'],
  ARRAY['Set up for Landmine Press Shoulder with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the shoulders throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Landmine Press Shoulder','Use a slow eccentric for more time under tension'],
  7
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000058-0000-0000-0000-000000000058',
  'Skull Crusher',
  'skull-crusher',
  'c1111111-1111-1111-1111-111111111102',
  'intermediate',
  ARRAY['barbell','bench'],
  'triceps',
  ARRAY[]::text[],
  ARRAY['Set up for Skull Crusher with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the triceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Skull Crusher','Use a slow eccentric for more time under tension'],
  5
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000059-0000-0000-0000-000000000059',
  'Overhead Tricep Extension',
  'overhead-tricep-extension',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['dumbbells'],
  'triceps',
  ARRAY['abs'],
  ARRAY['Set up for Overhead Tricep Extension with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the triceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Overhead Tricep Extension','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000060-0000-0000-0000-000000000060',
  'Close-Grip Bench Press',
  'close-grip-bench-press',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['barbell','bench'],
  'triceps',
  ARRAY['chest','shoulders'],
  ARRAY['Set up for Close-Grip Bench Press with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the triceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Close-Grip Bench Press','Use a slow eccentric for more time under tension'],
  8
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000061-0000-0000-0000-000000000061',
  'Tricep Kickback',
  'tricep-kickback',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['dumbbells'],
  'triceps',
  ARRAY[]::text[],
  ARRAY['Set up for Tricep Kickback with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the triceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Tricep Kickback','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000062-0000-0000-0000-000000000062',
  'Bench Dip',
  'bench-dip',
  'c1111111-1111-1111-1111-111111111104',
  'beginner',
  ARRAY['bench','bodyweight'],
  'triceps',
  ARRAY['chest','shoulders'],
  ARRAY['Set up for Bench Dip with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the triceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Bench Dip','Use a slow eccentric for more time under tension'],
  5
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000063-0000-0000-0000-000000000063',
  'Cable Overhead Extension',
  'cable-overhead-extension',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['cables'],
  'triceps',
  ARRAY[]::text[],
  ARRAY['Set up for Cable Overhead Extension with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the triceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Cable Overhead Extension','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000064-0000-0000-0000-000000000064',
  'JM Press',
  'jm-press',
  'c1111111-1111-1111-1111-111111111101',
  'advanced',
  ARRAY['barbell','bench'],
  'triceps',
  ARRAY['chest'],
  ARRAY['Set up for JM Press with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the triceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for JM Press','Use a slow eccentric for more time under tension'],
  7
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000065-0000-0000-0000-000000000065',
  'Single-Arm Cable Pushdown',
  'single-arm-cable-pushdown',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['cables'],
  'triceps',
  ARRAY[]::text[],
  ARRAY['Set up for Single-Arm Cable Pushdown with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the triceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Single-Arm Cable Pushdown','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000066-0000-0000-0000-000000000066',
  'Dumbbell Tate Press',
  'dumbbell-tate-press',
  'c1111111-1111-1111-1111-111111111102',
  'intermediate',
  ARRAY['dumbbells','bench'],
  'triceps',
  ARRAY[]::text[],
  ARRAY['Set up for Dumbbell Tate Press with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the triceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Dumbbell Tate Press','Use a slow eccentric for more time under tension'],
  5
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000067-0000-0000-0000-000000000067',
  'Parallel Bar Dip',
  'parallel-bar-dip',
  'c1111111-1111-1111-1111-111111111104',
  'intermediate',
  ARRAY['bodyweight','pull_up_bar'],
  'triceps',
  ARRAY['chest','shoulders'],
  ARRAY['Set up for Parallel Bar Dip with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the triceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Parallel Bar Dip','Use a slow eccentric for more time under tension'],
  7
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000068-0000-0000-0000-000000000068',
  'Reverse-Grip Pushdown',
  'reverse-grip-pushdown',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['cables'],
  'triceps',
  ARRAY[]::text[],
  ARRAY['Set up for Reverse-Grip Pushdown with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the triceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Reverse-Grip Pushdown','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000069-0000-0000-0000-000000000069',
  'EZ Bar Skull Crusher',
  'ez-bar-skull-crusher',
  'c1111111-1111-1111-1111-111111111102',
  'intermediate',
  ARRAY['barbell','bench'],
  'triceps',
  ARRAY[]::text[],
  ARRAY['Set up for EZ Bar Skull Crusher with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the triceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for EZ Bar Skull Crusher','Use a slow eccentric for more time under tension'],
  5
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000070-0000-0000-0000-000000000070',
  'Floor Skull Crusher',
  'floor-skull-crusher',
  'c1111111-1111-1111-1111-111111111102',
  'intermediate',
  ARRAY['dumbbells'],
  'triceps',
  ARRAY[]::text[],
  ARRAY['Set up for Floor Skull Crusher with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the triceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Floor Skull Crusher','Use a slow eccentric for more time under tension'],
  5
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000071-0000-0000-0000-000000000071',
  'Resistance Band Pushdown',
  'resistance-band-pushdown',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['bodyweight'],
  'triceps',
  ARRAY[]::text[],
  ARRAY['Set up for Resistance Band Pushdown with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the triceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Resistance Band Pushdown','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000072-0000-0000-0000-000000000072',
  'Machine Tricep Extension',
  'machine-tricep-extension',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['cables'],
  'triceps',
  ARRAY[]::text[],
  ARRAY['Set up for Machine Tricep Extension with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the triceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Machine Tricep Extension','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000073-0000-0000-0000-000000000073',
  'Hammer Curl',
  'hammer-curl',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['dumbbells'],
  'biceps',
  ARRAY['forearms'],
  ARRAY['Set up for Hammer Curl with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the biceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Hammer Curl','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000074-0000-0000-0000-000000000074',
  'Barbell Curl',
  'barbell-curl',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['barbell'],
  'biceps',
  ARRAY['forearms'],
  ARRAY['Set up for Barbell Curl with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the biceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Barbell Curl','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000075-0000-0000-0000-000000000075',
  'Preacher Curl',
  'preacher-curl',
  'c1111111-1111-1111-1111-111111111102',
  'intermediate',
  ARRAY['barbell','bench'],
  'biceps',
  ARRAY['forearms'],
  ARRAY['Set up for Preacher Curl with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the biceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Preacher Curl','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000076-0000-0000-0000-000000000076',
  'Concentration Curl',
  'concentration-curl',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['dumbbells'],
  'biceps',
  ARRAY['forearms'],
  ARRAY['Set up for Concentration Curl with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the biceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Concentration Curl','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000077-0000-0000-0000-000000000077',
  'Cable Curl',
  'cable-curl',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['cables'],
  'biceps',
  ARRAY['forearms'],
  ARRAY['Set up for Cable Curl with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the biceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Cable Curl','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000078-0000-0000-0000-000000000078',
  'Incline Dumbbell Curl',
  'incline-dumbbell-curl',
  'c1111111-1111-1111-1111-111111111102',
  'intermediate',
  ARRAY['dumbbells','bench'],
  'biceps',
  ARRAY['forearms'],
  ARRAY['Set up for Incline Dumbbell Curl with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the biceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Incline Dumbbell Curl','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000079-0000-0000-0000-000000000079',
  'EZ Bar Curl',
  'ez-bar-curl',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['barbell'],
  'biceps',
  ARRAY['forearms'],
  ARRAY['Set up for EZ Bar Curl with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the biceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for EZ Bar Curl','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000080-0000-0000-0000-000000000080',
  'Spider Curl',
  'spider-curl',
  'c1111111-1111-1111-1111-111111111102',
  'intermediate',
  ARRAY['barbell','bench'],
  'biceps',
  ARRAY['forearms'],
  ARRAY['Set up for Spider Curl with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the biceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Spider Curl','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000081-0000-0000-0000-000000000081',
  'Cable Hammer Curl',
  'cable-hammer-curl',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['cables'],
  'biceps',
  ARRAY['forearms'],
  ARRAY['Set up for Cable Hammer Curl with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the biceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Cable Hammer Curl','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000082-0000-0000-0000-000000000082',
  'Reverse Curl',
  'reverse-curl',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['barbell','dumbbells'],
  'biceps',
  ARRAY['forearms'],
  ARRAY['Set up for Reverse Curl with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the biceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Reverse Curl','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000083-0000-0000-0000-000000000083',
  'Drag Curl',
  'drag-curl',
  'c1111111-1111-1111-1111-111111111102',
  'intermediate',
  ARRAY['barbell'],
  'biceps',
  ARRAY['forearms'],
  ARRAY['Set up for Drag Curl with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the biceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Drag Curl','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000084-0000-0000-0000-000000000084',
  'Machine Bicep Curl',
  'machine-bicep-curl',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['cables'],
  'biceps',
  ARRAY['forearms'],
  ARRAY['Set up for Machine Bicep Curl with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the biceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Machine Bicep Curl','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000085-0000-0000-0000-000000000085',
  'Cross-Body Hammer Curl',
  'cross-body-hammer-curl',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['dumbbells'],
  'biceps',
  ARRAY['forearms'],
  ARRAY['Set up for Cross-Body Hammer Curl with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the biceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Cross-Body Hammer Curl','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000086-0000-0000-0000-000000000086',
  '21s Curl',
  '21s-curl',
  'c1111111-1111-1111-1111-111111111102',
  'advanced',
  ARRAY['barbell'],
  'biceps',
  ARRAY['forearms'],
  ARRAY['Set up for 21s Curl with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the biceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for 21s Curl','Use a slow eccentric for more time under tension'],
  5
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000087-0000-0000-0000-000000000087',
  'Resistance Band Curl',
  'resistance-band-curl',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['bodyweight'],
  'biceps',
  ARRAY['forearms'],
  ARRAY['Set up for Resistance Band Curl with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the biceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Resistance Band Curl','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000088-0000-0000-0000-000000000088',
  'Walking Lunge',
  'walking-lunge',
  'c1111111-1111-1111-1111-111111111101',
  'beginner',
  ARRAY['dumbbells','bodyweight'],
  'quadriceps',
  ARRAY['glutes','hamstrings'],
  ARRAY['Set up for Walking Lunge with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the quadriceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Walking Lunge','Use a slow eccentric for more time under tension'],
  8
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000089-0000-0000-0000-000000000089',
  'Leg Curl',
  'leg-curl',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['cables'],
  'hamstrings',
  ARRAY['glutes'],
  ARRAY['Set up for Leg Curl with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the hamstrings throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Leg Curl','Use a slow eccentric for more time under tension'],
  5
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000090-0000-0000-0000-000000000090',
  'Bulgarian Split Squat',
  'bulgarian-split-squat',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['dumbbells','bench'],
  'quadriceps',
  ARRAY['glutes','hamstrings'],
  ARRAY['Set up for Bulgarian Split Squat with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the quadriceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Bulgarian Split Squat','Use a slow eccentric for more time under tension'],
  8
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000091-0000-0000-0000-000000000091',
  'Standing Calf Raise',
  'standing-calf-raise',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['bodyweight','dumbbells'],
  'calves',
  ARRAY[]::text[],
  ARRAY['Set up for Standing Calf Raise with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the calves throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Standing Calf Raise','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000092-0000-0000-0000-000000000092',
  'Goblet Squat',
  'goblet-squat',
  'c1111111-1111-1111-1111-111111111101',
  'beginner',
  ARRAY['dumbbells'],
  'quadriceps',
  ARRAY['glutes','abs'],
  ARRAY['Set up for Goblet Squat with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the quadriceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Goblet Squat','Use a slow eccentric for more time under tension'],
  8
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000093-0000-0000-0000-000000000093',
  'Leg Extension',
  'leg-extension',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['cables'],
  'quadriceps',
  ARRAY[]::text[],
  ARRAY['Set up for Leg Extension with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the quadriceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Leg Extension','Use a slow eccentric for more time under tension'],
  5
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000094-0000-0000-0000-000000000094',
  'Front Squat',
  'front-squat',
  'c1111111-1111-1111-1111-111111111101',
  'advanced',
  ARRAY['barbell','squat_rack'],
  'quadriceps',
  ARRAY['glutes','abs'],
  ARRAY['Set up for Front Squat with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the quadriceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Front Squat','Use a slow eccentric for more time under tension'],
  10
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000095-0000-0000-0000-000000000095',
  'Hack Squat',
  'hack-squat',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['cables','squat_rack'],
  'quadriceps',
  ARRAY['glutes','hamstrings'],
  ARRAY['Set up for Hack Squat with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the quadriceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Hack Squat','Use a slow eccentric for more time under tension'],
  9
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000096-0000-0000-0000-000000000096',
  'Step-Up',
  'step-up',
  'c1111111-1111-1111-1111-111111111101',
  'beginner',
  ARRAY['dumbbells','bench'],
  'quadriceps',
  ARRAY['glutes','hamstrings'],
  ARRAY['Set up for Step-Up with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the quadriceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Step-Up','Use a slow eccentric for more time under tension'],
  7
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000097-0000-0000-0000-000000000097',
  'Romanian Deadlift Single Leg',
  'single-leg-romanian-deadlift',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['dumbbells'],
  'hamstrings',
  ARRAY['glutes','back'],
  ARRAY['Set up for Romanian Deadlift Single Leg with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the hamstrings throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Romanian Deadlift Single Leg','Use a slow eccentric for more time under tension'],
  7
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000098-0000-0000-0000-000000000098',
  'Seated Calf Raise',
  'seated-calf-raise',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['dumbbells','bench'],
  'calves',
  ARRAY[]::text[],
  ARRAY['Set up for Seated Calf Raise with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the calves throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Seated Calf Raise','Use a slow eccentric for more time under tension'],
  4
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000099-0000-0000-0000-000000000099',
  'Sumo Deadlift',
  'sumo-deadlift',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['barbell'],
  'glutes',
  ARRAY['hamstrings','quadriceps','back'],
  ARRAY['Set up for Sumo Deadlift with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the glutes throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Sumo Deadlift','Use a slow eccentric for more time under tension'],
  10
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000100-0000-0000-0000-000000000100',
  'Box Squat',
  'box-squat',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['barbell','squat_rack','bench'],
  'quadriceps',
  ARRAY['glutes','hamstrings'],
  ARRAY['Set up for Box Squat with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the quadriceps throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Box Squat','Use a slow eccentric for more time under tension'],
  9
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000101-0000-0000-0000-000000000101',
  'Nordic Hamstring Curl',
  'nordic-hamstring-curl',
  'c1111111-1111-1111-1111-111111111104',
  'advanced',
  ARRAY['bodyweight','bench'],
  'hamstrings',
  ARRAY['glutes'],
  ARRAY['Set up for Nordic Hamstring Curl with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the hamstrings throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Nordic Hamstring Curl','Use a slow eccentric for more time under tension'],
  6
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;

INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000102-0000-0000-0000-000000000102',
  'Cable Pull-Through',
  'cable-pull-through',
  'c1111111-1111-1111-1111-111111111101',
  'beginner',
  ARRAY['cables'],
  'glutes',
  ARRAY['hamstrings','back'],
  ARRAY['Set up for Cable Pull-Through with proper posture and bracing.','Move through full range of motion with control.','Focus on engaging the glutes throughout the rep.','Return to the start position without using momentum.'],
  ARRAY['Using too much weight','Rushing reps','Poor posture or alignment'],
  ARRAY['Warm up before working sets','Stop if you feel sharp joint pain'],
  ARRAY['Pause at peak contraction for Cable Pull-Through','Use a slow eccentric for more time under tension'],
  6
) ON CONFLICT (slug) DO UPDATE SET
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
  calories_per_minute = EXCLUDED.calories_per_minute;
