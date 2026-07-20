# Database Setup

This folder contains the Phase 2 MySQL database setup for the Travel Planning & Budget Management System.

## Files

- `schema.sql`: Creates the `travel_planner` database, drops any existing phase tables, and creates all tables, constraints, foreign keys, and indexes.
- `seed.sql`: Inserts fixed budget categories and sample demo data.

## Import Instructions

From the project root, run:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

If your local MySQL root user has no password, omit `-p`:

```bash
mysql -u root < database/schema.sql
mysql -u root < database/seed.sql
```

The backend environment currently expects:

```text
DB_NAME=travel_planner
```

## Table Relationships

- `users` owns `trips`.
- `trips` owns `itinerary_days`, `trip_budgets`, and `expenses`.
- `itinerary_days` owns `itinerary_activities`.
- `budget_categories` stores the six fixed categories required by the PRD: Transportation, Accommodation, Food, Activities, Shopping, and Miscellaneous.
- `trip_budgets` stores one overall budget per trip.
- `budget_allocations` stores the per-category amount for each trip budget.
- `expenses` belongs to a trip, a trip budget, and a budget category. Composite foreign keys ensure an expense references a category allocation for the same budget.

Deleting a user cascades to that user's trips. Deleting a trip cascades to itinerary days, activities, budget records, allocations, and expenses. Budget categories are restricted from deletion while allocations or expenses still reference them.

## Money And Dates

- Money fields use `DECIMAL(12,2)`.
- Trip and expense dates use `DATE`.
- Activity times use `TIME`.
- Main tables include `created_at` and `updated_at`.

