-- Travel Planning & Budget Management System
-- Phase 2: MySQL database setup
-- MySQL 8.0+ is recommended for CHECK constraint enforcement.

-- Database creation
CREATE DATABASE IF NOT EXISTS travel_planner
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE travel_planner;

-- Fresh rebuild support
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS budget_allocations;
DROP TABLE IF EXISTS trip_budgets;
DROP TABLE IF EXISTS budget_categories;
DROP TABLE IF EXISTS itinerary_activities;
DROP TABLE IF EXISTS itinerary_days;
DROP TABLE IF EXISTS trips;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- Table creation, constraints, foreign keys, and indexes
CREATE TABLE users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT chk_users_name_length CHECK (CHAR_LENGTH(TRIM(name)) BETWEEN 2 AND 50),
    CONSTRAINT chk_users_email_not_empty CHECK (CHAR_LENGTH(TRIM(email)) > 0),
    CONSTRAINT chk_users_password_hash_not_empty CHECK (CHAR_LENGTH(TRIM(password_hash)) > 0)
) ENGINE=InnoDB;

CREATE TABLE trips (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    destination VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    description VARCHAR(500) NULL,
    num_travelers INT UNSIGNED NOT NULL DEFAULT 1,
    status ENUM('upcoming', 'ongoing', 'completed') NOT NULL DEFAULT 'upcoming',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_trips_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT chk_trips_destination_length CHECK (CHAR_LENGTH(TRIM(destination)) BETWEEN 2 AND 100),
    CONSTRAINT chk_trips_date_range CHECK (end_date >= start_date),
    CONSTRAINT chk_trips_num_travelers CHECK (num_travelers >= 1),
    CONSTRAINT chk_trips_description_length CHECK (description IS NULL OR CHAR_LENGTH(description) <= 500),
    INDEX idx_trips_user_id (user_id),
    INDEX idx_trips_user_start_date (user_id, start_date),
    INDEX idx_trips_user_status (user_id, status)
) ENGINE=InnoDB;

CREATE TABLE itinerary_days (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    trip_id BIGINT UNSIGNED NOT NULL,
    day_date DATE NOT NULL,
    day_number INT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_itinerary_days_trip
        FOREIGN KEY (trip_id)
        REFERENCES trips (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT uq_itinerary_days_trip_date UNIQUE (trip_id, day_date),
    CONSTRAINT uq_itinerary_days_trip_day_number UNIQUE (trip_id, day_number),
    CONSTRAINT chk_itinerary_days_day_number CHECK (day_number >= 1),
    INDEX idx_itinerary_days_trip_id (trip_id),
    INDEX idx_itinerary_days_trip_date (trip_id, day_date)
) ENGINE=InnoDB;

CREATE TABLE itinerary_activities (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    itinerary_day_id BIGINT UNSIGNED NOT NULL,
    activity_time TIME NOT NULL,
    title VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    notes VARCHAR(300) NULL,
    end_time TIME NULL,
    sequence_order INT UNSIGNED NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_itinerary_activities_day
        FOREIGN KEY (itinerary_day_id)
        REFERENCES itinerary_days (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT chk_itinerary_activities_title_length CHECK (CHAR_LENGTH(TRIM(title)) BETWEEN 2 AND 100),
    CONSTRAINT chk_itinerary_activities_location_length CHECK (CHAR_LENGTH(TRIM(location)) BETWEEN 2 AND 100),
    CONSTRAINT chk_itinerary_activities_notes_length CHECK (notes IS NULL OR CHAR_LENGTH(notes) <= 300),
    INDEX idx_itinerary_activities_day_id (itinerary_day_id),
    INDEX idx_itinerary_activities_day_time (itinerary_day_id, activity_time)
) ENGINE=InnoDB;

CREATE TABLE budget_categories (
    id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) NOT NULL,
    display_order TINYINT UNSIGNED NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uq_budget_categories_name UNIQUE (name),
    CONSTRAINT uq_budget_categories_slug UNIQUE (slug),
    CONSTRAINT uq_budget_categories_display_order UNIQUE (display_order),
    CONSTRAINT chk_budget_categories_name_length CHECK (CHAR_LENGTH(TRIM(name)) BETWEEN 2 AND 50),
    CONSTRAINT chk_budget_categories_slug_length CHECK (CHAR_LENGTH(TRIM(slug)) BETWEEN 2 AND 50),
    CONSTRAINT chk_budget_categories_display_order CHECK (display_order BETWEEN 1 AND 6),
    INDEX idx_budget_categories_active_order (is_active, display_order)
) ENGINE=InnoDB;

CREATE TABLE trip_budgets (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    trip_id BIGINT UNSIGNED NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uq_trip_budgets_trip_id UNIQUE (trip_id),
    CONSTRAINT uq_trip_budgets_id_trip_id UNIQUE (id, trip_id),
    CONSTRAINT fk_trip_budgets_trip
        FOREIGN KEY (trip_id)
        REFERENCES trips (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT chk_trip_budgets_total_amount CHECK (total_amount > 0),
    INDEX idx_trip_budgets_trip_id (trip_id)
) ENGINE=InnoDB;

CREATE TABLE budget_allocations (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    budget_id BIGINT UNSIGNED NOT NULL,
    category_id TINYINT UNSIGNED NOT NULL,
    allocated_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uq_budget_allocations_budget_category UNIQUE (budget_id, category_id),
    CONSTRAINT fk_budget_allocations_budget
        FOREIGN KEY (budget_id)
        REFERENCES trip_budgets (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_budget_allocations_category
        FOREIGN KEY (category_id)
        REFERENCES budget_categories (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT chk_budget_allocations_amount CHECK (allocated_amount >= 0),
    INDEX idx_budget_allocations_budget_id (budget_id),
    INDEX idx_budget_allocations_category_id (category_id)
) ENGINE=InnoDB;

CREATE TABLE expenses (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    trip_id BIGINT UNSIGNED NOT NULL,
    budget_id BIGINT UNSIGNED NOT NULL,
    category_id TINYINT UNSIGNED NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    expense_date DATE NOT NULL,
    description VARCHAR(200) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_expenses_trip
        FOREIGN KEY (trip_id)
        REFERENCES trips (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_expenses_budget_trip
        FOREIGN KEY (budget_id, trip_id)
        REFERENCES trip_budgets (id, trip_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_expenses_budget_allocation
        FOREIGN KEY (budget_id, category_id)
        REFERENCES budget_allocations (budget_id, category_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_expenses_category
        FOREIGN KEY (category_id)
        REFERENCES budget_categories (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT chk_expenses_amount CHECK (amount > 0),
    CONSTRAINT chk_expenses_description_length CHECK (description IS NULL OR CHAR_LENGTH(description) <= 200),
    INDEX idx_expenses_trip_id (trip_id),
    INDEX idx_expenses_budget_id (budget_id),
    INDEX idx_expenses_category_id (category_id),
    INDEX idx_expenses_budget_category (budget_id, category_id),
    INDEX idx_expenses_trip_category (trip_id, category_id),
    INDEX idx_expenses_trip_date (trip_id, expense_date)
) ENGINE=InnoDB;
