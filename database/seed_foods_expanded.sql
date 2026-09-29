-- Expanded food catalog (generated)
-- Run after 004_nutrition_foundation.sql

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Idli (2 pieces)', 2, 'pieces', 120, 4, 24, 1, 2
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Idli (2 pieces)');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Dosa (plain)', 1, 'piece', 168, 4, 28, 4, 1
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Dosa (plain)');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Poha', 1, 'bowl', 250, 5, 45, 6, 3
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Poha');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Upma', 1, 'bowl', 280, 7, 42, 8, 4
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Upma');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Paratha (plain)', 1, 'piece', 260, 6, 36, 10, 3
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Paratha (plain)');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Aloo paratha', 1, 'piece', 320, 8, 42, 14, 4
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Aloo paratha');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Chole (chickpea curry)', 1, 'bowl', 280, 12, 38, 8, 10
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Chole (chickpea curry)');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Rajma (kidney beans)', 1, 'bowl', 260, 14, 36, 4, 12
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Rajma (kidney beans)');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Palak paneer', 1, 'bowl', 320, 16, 18, 22, 4
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Palak paneer');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Butter chicken', 1, 'bowl', 420, 28, 14, 28, 2
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Butter chicken');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Chicken tikka', 100, 'g', 180, 28, 4, 6, 0
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Chicken tikka');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Tandoori chicken', 100, 'g', 165, 31, 0, 4, 0
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Tandoori chicken');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Fish curry', 1, 'bowl', 280, 24, 12, 14, 2
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Fish curry');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Egg bhurji', 1, 'serving', 220, 14, 4, 16, 1
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Egg bhurji');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Boiled egg', 1, 'piece', 78, 6, 0.6, 5, 0
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Boiled egg');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Omelette (2 eggs)', 1, 'serving', 180, 12, 2, 14, 0
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Omelette (2 eggs)');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Sprouts salad', 1, 'bowl', 120, 10, 18, 2, 6
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Sprouts salad');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Samosa', 1, 'piece', 260, 5, 28, 14, 3
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Samosa');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Pakora (4 pcs)', 4, 'pieces', 200, 6, 22, 10, 3
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Pakora (4 pcs)');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Biryani (chicken)', 1, 'plate', 580, 28, 72, 18, 4
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Biryani (chicken)');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Biryani (veg)', 1, 'plate', 480, 12, 78, 14, 6
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Biryani (veg)');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Khichdi', 1, 'bowl', 320, 12, 52, 8, 5
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Khichdi');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Curd rice', 1, 'bowl', 280, 10, 42, 6, 1
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Curd rice');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Lemon rice', 1, 'bowl', 300, 6, 52, 8, 2
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Lemon rice');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Coconut chutney', 2, 'tbsp', 45, 1, 3, 4, 1
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Coconut chutney');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Sambar', 1, 'bowl', 120, 6, 18, 3, 5
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Sambar');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Rasam', 1, 'bowl', 60, 2, 10, 1, 2
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Rasam');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Naan', 1, 'piece', 260, 8, 44, 5, 2
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Naan');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Kulcha', 1, 'piece', 240, 7, 40, 5, 2
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Kulcha');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Pav bhaji', 1, 'plate', 420, 10, 58, 16, 8
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Pav bhaji');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Vada pav', 1, 'piece', 280, 6, 38, 12, 3
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Vada pav');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Misal pav', 1, 'plate', 380, 14, 48, 14, 10
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Misal pav');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Dhokla', 4, 'pieces', 160, 6, 28, 3, 2
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Dhokla');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Khandvi', 1, 'serving', 120, 6, 14, 4, 2
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Khandvi');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Thepla', 2, 'pieces', 200, 6, 28, 7, 4
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Thepla');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Methi paratha', 1, 'piece', 280, 7, 38, 11, 4
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Methi paratha');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Jowar roti', 1, 'piece', 100, 3, 20, 1, 3
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Jowar roti');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Bajra roti', 1, 'piece', 110, 4, 20, 2, 3
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Bajra roti');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Ragi mudde', 1, 'piece', 130, 3, 28, 0, 4
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Ragi mudde');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Soya chunks (cooked)', 100, 'g', 140, 24, 8, 2, 4
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Soya chunks (cooked)');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Tofu stir fry', 1, 'bowl', 220, 18, 12, 12, 3
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Tofu stir fry');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Mutton curry', 1, 'bowl', 380, 26, 10, 26, 2
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Mutton curry');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Keema', 1, 'bowl', 340, 24, 8, 24, 2
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Keema');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Grilled fish', 100, 'g', 150, 26, 0, 4, 0
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Grilled fish');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Prawn curry', 1, 'bowl', 260, 22, 10, 14, 1
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Prawn curry');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Paneer tikka', 1, 'serving', 280, 18, 12, 18, 2
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Paneer tikka');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Mushroom masala', 1, 'bowl', 180, 8, 14, 12, 4
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Mushroom masala');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Baingan bharta', 1, 'bowl', 140, 4, 16, 8, 6
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Baingan bharta');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Aloo gobi', 1, 'bowl', 200, 5, 28, 8, 6
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Aloo gobi');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Mixed veg sabzi', 1, 'bowl', 160, 5, 22, 6, 5
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Mixed veg sabzi');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Chana masala', 1, 'bowl', 260, 12, 36, 8, 10
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Chana masala');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Lassi (sweet)', 1, 'glass', 220, 8, 32, 6, 0
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Lassi (sweet)');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Lassi (salted)', 1, 'glass', 120, 6, 10, 5, 0
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Lassi (salted)');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Masala chai', 1, 'cup', 80, 2, 12, 2, 0
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Masala chai');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Filter coffee', 1, 'cup', 25, 1, 3, 1, 0
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Filter coffee');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Protein shake (whey)', 1, 'scoop', 120, 24, 3, 1, 0
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Protein shake (whey)');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Mass gainer shake', 1, 'serving', 380, 20, 58, 6, 2
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Mass gainer shake');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Banana', 1, 'medium', 105, 1, 27, 0, 3
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Banana');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Apple', 1, 'medium', 95, 0, 25, 0, 4
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Apple');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Mango', 1, 'cup', 100, 1, 25, 0, 3
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Mango');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Papaya', 1, 'cup', 60, 1, 15, 0, 2
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Papaya');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Orange', 1, 'medium', 62, 1, 15, 0, 3
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Orange');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Peanut butter', 2, 'tbsp', 190, 7, 7, 16, 2
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Peanut butter');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Almonds', 28, 'g', 164, 6, 6, 14, 4
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Almonds');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Walnuts', 28, 'g', 185, 4, 4, 18, 2
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Walnuts');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Roasted chana', 30, 'g', 120, 6, 18, 2, 5
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Roasted chana');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Makhana (fox nuts)', 30, 'g', 110, 4, 20, 1, 2
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Makhana (fox nuts)');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Oats (cooked)', 1, 'cup', 150, 5, 27, 3, 4
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Oats (cooked)');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Overnight oats', 1, 'jar', 320, 14, 48, 8, 6
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Overnight oats');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Granola', 50, 'g', 220, 5, 36, 7, 4
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Granola');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Brown bread slice', 1, 'slice', 80, 3, 14, 1, 2
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Brown bread slice');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'White bread slice', 1, 'slice', 75, 2, 14, 1, 1
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'White bread slice');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Peanut butter toast', 1, 'slice', 200, 8, 22, 10, 3
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Peanut butter toast');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Avocado toast', 1, 'slice', 240, 6, 24, 14, 8
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Avocado toast');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Grilled chicken salad', 1, 'bowl', 320, 38, 12, 12, 6
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Grilled chicken salad');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Caesar salad', 1, 'bowl', 380, 12, 18, 28, 4
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Caesar salad');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Quinoa bowl', 1, 'bowl', 340, 14, 48, 10, 8
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Quinoa bowl');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Burrito bowl', 1, 'bowl', 520, 28, 58, 18, 10
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Burrito bowl');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Sushi roll (6 pcs)', 6, 'pieces', 280, 12, 42, 6, 2
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Sushi roll (6 pcs)');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Pizza slice (cheese)', 1, 'slice', 285, 12, 36, 10, 2
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Pizza slice (cheese)');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Burger (chicken)', 1, 'piece', 420, 28, 38, 18, 2
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Burger (chicken)');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'French fries (medium)', 1, 'serving', 320, 4, 42, 15, 4
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'French fries (medium)');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Maggi noodles', 1, 'pack', 310, 8, 42, 12, 2
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Maggi noodles');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Instant oats packet', 1, 'serving', 160, 5, 28, 3, 4
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Instant oats packet');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Cottage cheese (paneer raw 100g)', 100, 'g', 265, 18, 4, 20, 0
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Cottage cheese (paneer raw 100g)');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Skim milk', 1, 'cup', 90, 8, 12, 0, 0
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Skim milk');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Whole milk', 1, 'cup', 150, 8, 12, 8, 0
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Whole milk');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Soy milk', 1, 'cup', 100, 7, 10, 4, 1
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Soy milk');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Coconut water', 1, 'cup', 46, 2, 9, 0, 0
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Coconut water');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Whey isolate scoop', 1, 'scoop', 110, 25, 2, 0, 0
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Whey isolate scoop');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Creatine serving', 1, 'serving', 0, 0, 0, 0, 0
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Creatine serving');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'BCAA drink', 1, 'serving', 10, 2, 1, 0, 0
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'BCAA drink');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Electrolyte drink', 1, 'bottle', 50, 0, 12, 0, 0
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Electrolyte drink');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Energy bar', 1, 'bar', 200, 10, 28, 7, 3
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Energy bar');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Protein bar', 1, 'bar', 220, 20, 22, 8, 5
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Protein bar');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Dark chocolate (30g)', 30, 'g', 170, 2, 13, 12, 3
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Dark chocolate (30g)');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Honey', 1, 'tbsp', 64, 0, 17, 0, 0
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Honey');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Ghee', 1, 'tbsp', 120, 0, 0, 14, 0
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Ghee');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Olive oil', 1, 'tbsp', 120, 0, 0, 14, 0
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Olive oil');

INSERT INTO foods (user_id, name, serving_amount, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT NULL, 'Coconut oil', 1, 'tbsp', 120, 0, 0, 14, 0
WHERE NOT EXISTS (SELECT 1 FROM foods WHERE user_id IS NULL AND name = 'Coconut oil');
