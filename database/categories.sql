-- Non-destructive category setup for a schema-only installation.
-- The optional demo seed is destructive; do not use it on an existing database.
USE travel_planner;
INSERT IGNORE INTO budget_categories (id, name, slug, display_order) VALUES
 (1, 'Transportation', 'transportation', 1),
 (2, 'Accommodation', 'accommodation', 2),
 (3, 'Food', 'food', 3),
 (4, 'Activities', 'activities', 4),
 (5, 'Shopping', 'shopping', 5),
 (6, 'Miscellaneous', 'miscellaneous', 6);
