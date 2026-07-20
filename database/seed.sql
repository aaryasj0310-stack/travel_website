-- Travel Planning & Budget Management System
-- Demo seed data for a fresh database created with database/schema.sql.

USE travel_planner;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE expenses;
TRUNCATE TABLE budget_allocations;
TRUNCATE TABLE trip_budgets;
TRUNCATE TABLE budget_categories;
TRUNCATE TABLE itinerary_activities;
TRUNCATE TABLE itinerary_days;
TRUNCATE TABLE trips;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO budget_categories (id, name, slug, display_order)
VALUES
    (1, 'Transportation', 'transportation', 1),
    (2, 'Accommodation', 'accommodation', 2),
    (3, 'Food', 'food', 3),
    (4, 'Activities', 'activities', 4),
    (5, 'Shopping', 'shopping', 5),
    (6, 'Miscellaneous', 'miscellaneous', 6);

INSERT INTO users (id, name, email, password_hash)
VALUES
    (1, 'Aarav Mehta', 'aarav@example.com', '$2b$10$k9nI3FaYJlceaczE74/qXeyU3jo5op1Go8o1bePZhZXdX/XKSdcUS'),
    (2, 'Maya Rao', 'maya@example.com', '$2b$10$e/dKFciZHjdz9H1/GYy9o.IFFQLZJ/g1SiN3Mc7Iedd093ghqs4dW');

INSERT INTO trips (
    id,
    user_id,
    destination,
    start_date,
    end_date,
    description,
    num_travelers,
    status
)
VALUES
    (
        1,
        1,
        'Goa, India',
        '2026-08-10',
        '2026-08-14',
        'A short beach break with planned food, activities, and local transport.',
        2,
        'upcoming'
    ),
    (
        2,
        1,
        'Jaipur, India',
        '2026-12-20',
        '2026-12-24',
        'Winter heritage trip focused on forts, markets, and local food.',
        3,
        'upcoming'
    ),
    (
        3,
        2,
        'Munnar, India',
        '2026-06-02',
        '2026-06-06',
        'Completed hill station trip used for demo history.',
        1,
        'completed'
    );

INSERT INTO itinerary_days (id, trip_id, day_date, day_number)
VALUES
    (1, 1, '2026-08-10', 1),
    (2, 1, '2026-08-11', 2),
    (3, 2, '2026-12-20', 1),
    (4, 3, '2026-06-02', 1);

INSERT INTO itinerary_activities (
    id,
    itinerary_day_id,
    activity_time,
    title,
    location,
    notes,
    end_time,
    sequence_order
)
VALUES
    (1, 1, '09:30:00', 'Arrive and check in', 'Calangute', 'Confirm hotel booking and freshen up.', '10:30:00', 1),
    (2, 1, '16:00:00', 'Beach walk', 'Baga Beach', 'Keep this light after travel.', '18:00:00', 2),
    (3, 2, '10:00:00', 'Fort visit', 'Aguada Fort', 'Carry water and sunscreen.', '12:30:00', 1),
    (4, 3, '11:00:00', 'City Palace tour', 'Jaipur City Palace', 'Book tickets at the counter.', NULL, 1),
    (5, 4, '08:30:00', 'Tea garden walk', 'Munnar Tea Estate', 'Morning photo stop.', '10:00:00', 1);

INSERT INTO trip_budgets (id, trip_id, total_amount)
VALUES
    (1, 1, 45000.00),
    (2, 2, 65000.00),
    (3, 3, 18000.00);

INSERT INTO budget_allocations (budget_id, category_id, allocated_amount)
VALUES
    (1, 1, 12000.00),
    (1, 2, 15000.00),
    (1, 3, 8000.00),
    (1, 4, 6000.00),
    (1, 5, 2500.00),
    (1, 6, 1500.00),
    (2, 1, 18000.00),
    (2, 2, 22000.00),
    (2, 3, 10000.00),
    (2, 4, 9000.00),
    (2, 5, 4000.00),
    (2, 6, 2000.00),
    (3, 1, 5000.00),
    (3, 2, 6500.00),
    (3, 3, 3500.00),
    (3, 4, 2000.00),
    (3, 5, 500.00),
    (3, 6, 500.00);

INSERT INTO expenses (
    id,
    trip_id,
    budget_id,
    category_id,
    amount,
    expense_date,
    description
)
VALUES
    (1, 1, 1, 1, 3500.00, '2026-08-10', 'Airport taxi and local transfers'),
    (2, 1, 1, 3, 1250.00, '2026-08-10', 'Lunch and dinner'),
    (3, 1, 1, 4, 900.00, '2026-08-11', 'Fort entry and local guide'),
    (4, 2, 2, 2, 5000.00, '2026-12-20', 'Hotel advance payment'),
    (5, 3, 3, 1, 4200.00, '2026-06-02', 'Cab from Kochi to Munnar'),
    (6, 3, 3, 3, 1800.00, '2026-06-03', 'Meals and snacks');
