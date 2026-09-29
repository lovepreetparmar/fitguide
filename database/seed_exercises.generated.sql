INSERT INTO exercises (id, name, slug, category_id, difficulty, equipment, primary_muscle, secondary_muscles, instructions, common_mistakes, safety_tips, pro_tips, calories_per_minute)
VALUES (
  'e1000001-0000-0000-0000-000000000001',
  'Barbell Bench Press',
  'barbell-bench-press',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['barbell','bench'],
  'chest',
  ARRAY['triceps','shoulders'],
  ARRAY['Lie flat on the bench with feet firmly on the ground.','Grip the bar slightly wider than shoulder width.','Lower the bar to mid-chest with control.','Press the bar up until arms are fully extended.','Keep shoulder blades retracted throughout the movement.'],
  ARRAY['Bouncing the bar off the chest','Flaring elbows too wide','Lifting hips off the bench','Uneven bar path'],
  ARRAY['Always use a spotter for heavy sets','Use safety bars or clips on the barbell','Warm up with lighter weight first'],
  ARRAY['Drive through your legs for more power','Squeeze the bar to activate more muscle fibers','Pause briefly at the bottom for increased time under tension'],
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
  'e1000002-0000-0000-0000-000000000002',
  'Barbell Squat',
  'barbell-squat',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['barbell','squat_rack'],
  'quadriceps',
  ARRAY['glutes','hamstrings','abs'],
  ARRAY['Position the bar on your upper traps.','Stand with feet shoulder-width apart, toes slightly out.','Break at the hips and knees simultaneously.','Descend until thighs are parallel to the floor.','Drive through your heels to stand back up.'],
  ARRAY['Knees caving inward','Rounding the lower back','Not reaching proper depth','Rising onto toes'],
  ARRAY['Use safety bars in the squat rack','Keep core braced throughout','Start with bodyweight squats to learn form'],
  ARRAY['Take a deep breath and brace before each rep','Think about spreading the floor with your feet','Keep your chest up throughout the movement'],
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
  'e1000003-0000-0000-0000-000000000003',
  'Deadlift',
  'deadlift',
  'c1111111-1111-1111-1111-111111111101',
  'advanced',
  ARRAY['barbell'],
  'back',
  ARRAY['glutes','hamstrings','forearms'],
  ARRAY['Stand with feet hip-width apart, bar over mid-foot.','Hinge at hips and grip the bar just outside your legs.','Keep back flat and chest up.','Drive through heels and extend hips and knees simultaneously.','Stand tall at the top, then lower with control.'],
  ARRAY['Rounding the back','Bar drifting away from body','Jerking the weight off the floor','Hyperextending at the top'],
  ARRAY['Use a mixed or hook grip for heavy loads','Never round your lower back under load','Use lifting straps only when grip is the limiting factor'],
  ARRAY['Engage lats by pulling the bar into your shins','Push the floor away rather than pulling the bar up','Reset each rep for heavy sets'],
  11
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
  'e1000004-0000-0000-0000-000000000004',
  'Pull-Up',
  'pull-up',
  'c1111111-1111-1111-1111-111111111104',
  'intermediate',
  ARRAY['pull_up_bar','bodyweight'],
  'back',
  ARRAY['biceps','forearms'],
  ARRAY['Hang from the bar with an overhand grip, hands shoulder-width apart.','Engage your lats and pull your chest toward the bar.','Pause at the top with chin above the bar.','Lower with control to full arm extension.'],
  ARRAY['Using momentum or kipping','Not achieving full range of motion','Shrugging shoulders at the top','Incomplete lockout at the bottom'],
  ARRAY['Use a resistance band for assistance if needed','Avoid behind-the-neck pull-ups','Warm up shoulders before heavy sets'],
  ARRAY['Initiate the pull by depressing your shoulder blades','Squeeze at the top for maximum contraction','Use a false grip for better lat engagement'],
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
  'e1000005-0000-0000-0000-000000000005',
  'Overhead Press',
  'overhead-press',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['barbell'],
  'shoulders',
  ARRAY['triceps','abs'],
  ARRAY['Stand with feet hip-width apart, bar at shoulder height.','Grip the bar just outside shoulder width.','Press the bar overhead until arms are fully locked out.','Lower with control back to shoulder height.'],
  ARRAY['Excessive back arch','Pressing the bar in front of the face','Not locking out at the top','Using leg drive (unless push press)'],
  ARRAY['Keep core tight to protect lower back','Start with lighter weight to learn the movement','Avoid pressing behind the neck'],
  ARRAY['Push your head through once the bar passes your face','Squeeze glutes to maintain a stable base','Breathe and brace at the bottom of each rep'],
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
  'e1000006-0000-0000-0000-000000000006',
  'Dumbbell Bicep Curl',
  'dumbbell-bicep-curl',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['dumbbells'],
  'biceps',
  ARRAY['forearms'],
  ARRAY['Stand with dumbbells at your sides, palms facing forward.','Keep elbows pinned to your sides.','Curl the weights up toward your shoulders.','Squeeze at the top, then lower with control.'],
  ARRAY['Swinging the weights with momentum','Moving elbows forward','Incomplete range of motion','Using too heavy weight'],
  ARRAY['Control the eccentric portion','Avoid hyperextending elbows at the bottom'],
  ARRAY['Supinate wrists at the top for peak contraction','Try alternating curls for unilateral focus','Use a slight pause at the bottom to eliminate momentum'],
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
  'e1000007-0000-0000-0000-000000000007',
  'Romanian Deadlift',
  'romanian-deadlift',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['barbell','dumbbells'],
  'hamstrings',
  ARRAY['glutes','back'],
  ARRAY['Hold the bar at hip height with an overhand grip.','Keep a slight bend in the knees.','Hinge at the hips, pushing them back.','Lower until you feel a stretch in your hamstrings.','Drive hips forward to return to standing.'],
  ARRAY['Rounding the back','Bending knees too much (turning into a squat)','Not feeling the hamstring stretch','Going too heavy too soon'],
  ARRAY['Keep the bar close to your legs throughout','Stop if you feel lower back strain','Start with light weight to learn the hip hinge'],
  ARRAY['Think about closing a car door with your hips','Focus on the hamstring stretch, not depth','Pause at the bottom for increased time under tension'],
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
  'e1000008-0000-0000-0000-000000000008',
  'Plank',
  'plank',
  'c1111111-1111-1111-1111-111111111104',
  'beginner',
  ARRAY['bodyweight'],
  'abs',
  ARRAY['obliques','shoulders'],
  ARRAY['Start in a forearm plank position.','Keep body in a straight line from head to heels.','Engage core and squeeze glutes.','Hold the position for the prescribed time.','Breathe steadily throughout.'],
  ARRAY['Hips sagging toward the floor','Hips piking up too high','Holding breath','Looking up instead of down'],
  ARRAY['Stop if you feel lower back pain','Build up hold time gradually'],
  ARRAY['Push the floor away with your forearms','Imagine pulling your elbows toward your toes','Progress to side planks for oblique work'],
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
  'e1000009-0000-0000-0000-000000000009',
  'Lat Pulldown',
  'lat-pulldown',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['cables'],
  'back',
  ARRAY['biceps'],
  ARRAY['Sit at the lat pulldown machine with thighs secured.','Grip the bar wider than shoulder width.','Pull the bar down to upper chest.','Squeeze shoulder blades together at the bottom.','Return to starting position with control.'],
  ARRAY['Leaning back too far','Pulling behind the neck','Using momentum','Not achieving full stretch at the top'],
  ARRAY['Always pull to the front of your chest','Use a weight you can control'],
  ARRAY['Initiate with your lats, not your arms','Pause at the bottom for peak contraction','Try different grip widths to target different areas'],
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
  'e1000010-0000-0000-0000-000000000010',
  'Leg Press',
  'leg-press',
  'c1111111-1111-1111-1111-111111111101',
  'beginner',
  ARRAY['cables'],
  'quadriceps',
  ARRAY['glutes','hamstrings'],
  ARRAY['Sit in the leg press machine with back flat against the pad.','Place feet shoulder-width apart on the platform.','Lower the weight until knees are at 90 degrees.','Press through your heels to extend legs.','Do not lock out knees at the top.'],
  ARRAY['Lowering weight too deep (butt lifting off seat)','Locking knees at the top','Feet placed too high or too low','Using too much weight with poor form'],
  ARRAY['Never lock your knees completely','Keep lower back pressed against the pad','Use safety stops on the machine'],
  ARRAY['Vary foot placement to target different muscles','Use single-leg presses for imbalance correction','Control the eccentric for 3 seconds'],
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
  'e1000011-0000-0000-0000-000000000011',
  'Tricep Pushdown',
  'tricep-pushdown',
  'c1111111-1111-1111-1111-111111111102',
  'beginner',
  ARRAY['cables'],
  'triceps',
  ARRAY[]::text[],
  ARRAY['Stand facing the cable machine with rope or bar attachment.','Keep elbows pinned to your sides.','Push the attachment down until arms are fully extended.','Squeeze triceps at the bottom.','Return with control to starting position.'],
  ARRAY['Moving elbows away from body','Using shoulders to push down','Incomplete extension at the bottom','Leaning over the bar'],
  ARRAY['Use a weight you can control through full ROM','Keep wrists neutral'],
  ARRAY['Try rope attachment for better peak contraction','Pause at the bottom for 1 second','Use drop sets for advanced hypertrophy'],
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
  'e1000012-0000-0000-0000-000000000012',
  'Hip Thrust',
  'hip-thrust',
  'c1111111-1111-1111-1111-111111111101',
  'intermediate',
  ARRAY['barbell','bench'],
  'glutes',
  ARRAY['hamstrings'],
  ARRAY['Sit on the floor with upper back against a bench.','Roll a barbell over your hips (use a pad for comfort).','Drive through your heels to lift hips up.','Squeeze glutes hard at the top.','Lower with control and repeat.'],
  ARRAY['Hyperextending the lower back','Not achieving full hip extension','Pushing through toes instead of heels','Looking up excessively'],
  ARRAY['Use a barbell pad to protect hips','Start with bodyweight to learn the movement'],
  ARRAY['Pause at the top for 2 seconds','Keep chin tucked throughout','Try single-leg variations for unilateral work'],
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

