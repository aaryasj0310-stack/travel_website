# Product Requirements Document
## Travel Planning & Budget Management System
### A College-Level Full-Stack Web Application

**Document Version:** 1.0
**Prepared For:** Single-student capstone / course project
**Technology Stack:** HTML5, CSS3, Vanilla JavaScript, Node.js, Express.js, MySQL
**Project Type:** Dynamic, database-driven web application

---

## 1. Executive Summary

The Travel Planning & Budget Management System is a full-stack web application that allows a user to register an account, plan trips, build day-by-day itineraries, set a travel budget, and track expenses against that budget. It is designed as a realistic, achievable capstone/course project for a single student, demonstrating core full-stack web development competencies: authentication, session management, CRUD operations, relational database design, REST API design, form validation, and responsive, dynamically-rendered frontend pages.

The system intentionally avoids third-party APIs, cloud infrastructure, and enterprise-scale patterns. It is entirely self-contained, running on a Node.js/Express backend with a MySQL database and a vanilla HTML/CSS/JavaScript frontend that consumes the backend's REST API.

This PRD defines the full scope, features, data model, API surface, and page-level requirements needed to build the complete system from start to finish.

---

## 2. Problem Statement

Students, individuals, and small groups planning a trip typically rely on a mix of tools — a notes app for itinerary ideas, a spreadsheet for budgeting, and a separate notebook or app for tracking what they actually spent. These tools don't talk to each other, so travelers have no single place to see whether their planned itinerary matches what they can actually afford, or how much of their budget remains as the trip progresses.

This project addresses that gap at a manageable scope: a single application where a user can create a trip, plan its itinerary, define a budget by category, and log expenses that automatically update how much budget remains — all within one login, one database, and one cohesive interface.

---

## 3. Objectives

| # | Objective |
|---|-----------|
| O1 | Build a secure authentication system (register, login, logout, session handling) |
| O2 | Allow users to create and manage trips with full CRUD functionality |
| O3 | Allow users to build a day-by-day itinerary of activities for each trip |
| O4 | Allow users to define a categorized budget for each trip |
| O5 | Allow users to log expenses that automatically recalculate remaining budget |
| O6 | Provide a dashboard summarizing upcoming trips and budget status |
| O7 | Demonstrate a complete, working full-stack application using only the mandated stack (HTML, CSS, JavaScript, Node.js, Express, MySQL) |
| O8 | Produce a project of a scope realistically completable by one student within a single academic term |

---

## 4. Scope

### 4.1 In Scope

- User registration, login, logout, and session-based authentication
- Profile view, edit, and password change
- Trip CRUD (Create, Read, Update, Delete)
- Itinerary management: days and activities within a trip
- Budget management: overall budget and fixed categories per trip
- Expense management: CRUD on expenses, tied to budget categories, with automatic recalculation of remaining budget
- Dashboard showing upcoming trips, budget summary, and basic statistics
- Responsive frontend (mobile, tablet, desktop) built with plain HTML/CSS/JS
- REST API built with Node.js and Express.js
- Relational database implemented in MySQL

### 4.2 Out of Scope

This project explicitly excludes the following, which are reserved for the Future Enhancements section (Section 18):

- Any AI, machine learning, or chatbot features
- Maps, Weather, Currency, Hotel, or Flight APIs, or any third-party API integration
- Payment gateways
- Email verification, SMS, or push notifications
- Passport/visa management, document upload, or OCR
- Real-time collaboration or multi-user trip sharing
- OAuth / third-party login
- Microservices, cloud architecture, Docker, or Redis
- Admin panel or analytics dashboard
- Offline mode or a native mobile app
- Premium plans or subscriptions

---

## 5. Target Users

| User Type | Description | Primary Need |
|-----------|--------------|----------------|
| Individual Traveler | A single user planning their own trip | Simple trip creation, itinerary building, and budget tracking |
| Student Traveler | A student planning a low-budget trip | Tight budget tracking and expense logging |
| Course Evaluator / Instructor | Reviews the finished project | A clean, working demonstration of full-stack CRUD, auth, and relational data |

This system is single-tenant per account: each registered user manages their own trips independently. There is no cross-user sharing or collaboration in this version of the project.

---

## 6. Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-1 | The system shall allow a new user to register with name, email, and password |
| FR-2 | The system shall allow a registered user to log in with email and password |
| FR-3 | The system shall allow a logged-in user to log out, ending their session |
| FR-4 | The system shall maintain a server-side session for authenticated users |
| FR-5 | The system shall allow a user to view and edit their profile |
| FR-6 | The system shall allow a user to change their password |
| FR-7 | The system shall allow a user to create, view, edit, and delete trips |
| FR-8 | The system shall allow a user to add, edit, and delete itinerary days and activities within a trip |
| FR-9 | The system shall allow a user to create a budget for a trip with fixed categories |
| FR-10 | The system shall allow a user to add, edit, and delete expenses under a trip's budget categories |
| FR-11 | The system shall automatically recalculate remaining budget whenever an expense is added, edited, or deleted |
| FR-12 | The system shall display a dashboard with upcoming trips, budget summary, and basic statistics |
| FR-13 | The system shall validate all form inputs on both the client and server side |
| FR-14 | The system shall restrict all trip, itinerary, budget, and expense data to the owning user only |

---

## 7. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Usability | The interface must be simple and intuitive enough for a first-time user to create a trip without instructions |
| Responsiveness | All pages must render correctly on mobile (~360px), tablet (~768px), and desktop (~1200px+) widths |
| Performance | Typical page loads and API responses should complete within 1–2 seconds on local/development hosting |
| Maintainability | Backend code should be organized into routes, controllers, and a data-access layer for clarity and reuse |
| Security | Passwords must be hashed before storage; sessions must be protected from basic tampering |
| Reliability | Budget and expense calculations must always be internally consistent (no orphaned or mismatched totals) |
| Portability | The application must run locally with a standard Node.js + MySQL setup, requiring no cloud services |
| Browser Compatibility | The application must work correctly in the latest versions of Chrome, Firefox, and Edge |

---

## 8. User Stories

1. As a new user, I want to register an account so that I can start planning trips.
2. As a returning user, I want to log in so that I can access my trips.
3. As a logged-in user, I want to log out so that my session ends securely on a shared computer.
4. As a user, I want to view my profile so that I can confirm my account details.
5. As a user, I want to edit my profile so that my name and email stay current.
6. As a user, I want to change my password so that I can keep my account secure.
7. As a user, I want to create a new trip so that I can begin planning it.
8. As a user, I want to view a list of all my trips so that I can see what I've planned.
9. As a user, I want to view the details of a specific trip so that I can review or continue planning it.
10. As a user, I want to edit a trip's details so that I can correct or update information.
11. As a user, I want to delete a trip I no longer need so that my trip list stays relevant.
12. As a user, I want to add a day to my trip's itinerary so that I can organize my schedule.
13. As a user, I want to add an activity to a specific day so that I know what I'm doing and when.
14. As a user, I want to edit an activity so that I can adjust its time, location, or notes.
15. As a user, I want to delete an activity so that my itinerary reflects my actual plans.
16. As a user, I want to create a budget for my trip so that I know how much I can spend.
17. As a user, I want to divide my budget into categories so that I can control spending by area.
18. As a user, I want to see my remaining budget so that I know how much is left to spend.
19. As a user, I want to add an expense so that my spending is tracked against my budget.
20. As a user, I want to edit an expense so that I can correct mistakes.
21. As a user, I want to delete an expense so that my records stay accurate.
22. As a user, I want to view my expense history so that I can review what I've spent.
23. As a user, I want the remaining budget to update automatically when I log an expense, so that I don't have to calculate it myself.
24. As a user, I want to see a dashboard when I log in so that I immediately see my upcoming trips and budget status.
25. As a user, I want form fields to show validation errors so that I know how to correct my input before submitting.
26. As a user, I want to be the only one who can see or edit my trips so that my travel plans stay private.
27. As a user, I want the site to work well on my phone so that I can check my itinerary while traveling.
28. As a user, I want to see quick statistics on my dashboard (e.g., number of trips, total planned budget) so that I get a fast overview.

---

## 9. Modules

Each module below documents Purpose, Features, Inputs, Outputs, Business Rules, Validation Rules, and Acceptance Criteria.

### 9.1 User Authentication Module

**Purpose:** Allow users to securely register, log in, log out, and maintain a session so that their trip data is private and persistent across visits.

**Features**
- Register with name, email, and password
- Login with email and password
- Logout (destroys session)
- Session-based authentication guarding all protected routes
- Basic profile access is included here and detailed further in Section 9.7

**Inputs:** Registration form (name, email, password, confirm password); Login form (email, password)

**Outputs:** New user record in the database; active session cookie; redirect to Dashboard on successful login; error messages on failure

**Business Rules**
- Each email address may be associated with only one account.
- Passwords are never stored in plain text; they are hashed before being saved.
- A session must exist and be valid for a request to reach any protected route (Dashboard, Trips, Budget, Expenses, Profile).
- Logging out destroys the session immediately; subsequent requests to protected routes are redirected to Login.

**Validation Rules**
- Name: required, 2–50 characters.
- Email: required, must match a valid email format, must be unique.
- Password: required, minimum 8 characters.
- Confirm Password: must match Password exactly.
- Login: email and password fields are both required; generic "invalid email or password" message on failure (no indication of which field was wrong).

**Acceptance Criteria**
- Given valid registration data, when submitted, then a new user record is created and the user is redirected to Login (or automatically logged in, per implementation choice).
- Given a duplicate email at registration, when submitted, then a clear error is shown and no duplicate account is created.
- Given correct login credentials, when submitted, then a session is created and the user is redirected to the Dashboard.
- Given incorrect login credentials, when submitted, then an error is shown and no session is created.
- Given no active session, when a protected route is requested, then the user is redirected to the Login page.
- Given an active session, when Logout is triggered, then the session is destroyed and the user is redirected to Home or Login.

---

### 9.2 Dashboard Module

**Purpose:** Give the user an at-a-glance summary of their trips and budget status immediately after logging in.

**Features**
- Welcome message with the user's name
- List of upcoming trips (trips with a start date in the future, sorted soonest first)
- Budget summary across trips (or for the nearest upcoming trip)
- Quick statistics: total number of trips, total planned budget, total expenses logged

**Inputs:** None directly from the user (dashboard is a read-only aggregation view); implicitly driven by the logged-in user's session

**Outputs:** Rendered dashboard page with upcoming trips list, budget summary widget, and statistics cards

**Business Rules**
- Only trips belonging to the logged-in user are shown.
- "Upcoming" is defined as any trip whose start date is on or after the current date; past trips are excluded from the upcoming list.
- If a trip has no budget set yet, its budget summary shows "No budget set" rather than a zero value that could be mistaken for an actual figure.

**Validation Rules:** Not applicable (read-only view); however, all displayed data must originate only from records owned by the current session's user.

**Acceptance Criteria**
- Given a logged-in user with at least one upcoming trip, when the Dashboard loads, then that trip appears in the upcoming trips list.
- Given a logged-in user with no trips, when the Dashboard loads, then an appropriate empty state (e.g., "You have no trips yet — create one to get started") is shown instead of an error or blank section.
- Given trips with budgets and logged expenses, when the Dashboard loads, then the budget summary numbers match the sum of the underlying budget and expense records exactly.

---

### 9.3 Trip Management Module

**Purpose:** Allow the user to create and manage the central "Trip" record that itinerary, budget, and expenses are attached to.

**Features**
- Create Trip (destination, start date, end date, description, number of travelers)
- View Trip list (all trips belonging to the user)
- View Trip details (single trip)
- Edit Trip
- Delete Trip
- Trip Status (e.g., Upcoming, Ongoing, Completed), derived from dates or set manually

**Inputs:** Trip form fields — destination, start date, end date, description, number of travelers, (optional) status

**Outputs:** New/updated/deleted trip record; rendered trip list and trip detail pages

**Business Rules**
- A trip always belongs to exactly one user (the one who created it); there is no sharing or multi-user ownership in this project.
- Deleting a trip also removes its associated itinerary days, activities, budget, and expenses (cascading delete), since none of that data has meaning without the parent trip.
- Trip Status may be computed automatically from the current date relative to start/end date (e.g., Upcoming if start date is in the future, Ongoing if today falls within the range, Completed if end date has passed), simplifying the need for manual status management.

**Validation Rules**
- Destination: required, 2–100 characters.
- Start Date: required, must be a valid date.
- End Date: required, must be a valid date, and must be on or after Start Date.
- Description: optional, maximum 500 characters.
- Number of Travelers: required, integer, minimum 1.

**Acceptance Criteria**
- Given valid trip data, when the Create Trip form is submitted, then a new trip appears in the user's trip list immediately.
- Given an End Date earlier than the Start Date, when submitted, then a validation error is shown and the trip is not created.
- Given an existing trip, when edited with valid data, then the updated details are reflected on the trip's detail page.
- Given an existing trip, when deleted, then it no longer appears in the trip list, and its itinerary, budget, and expense data are also removed.
- Given a trip the user does not own, when its ID is requested directly (e.g., via URL manipulation), then access is denied.

---

### 9.4 Itinerary Management Module

**Purpose:** Allow the user to plan a day-by-day schedule of activities for a trip.

**Features**
- Add a Day to a trip's itinerary
- Add an Activity to a specific day (time, location, notes)
- Edit an Activity
- Delete an Activity
- View the full itinerary for a trip, organized by day

**Inputs:** Day form (date or day number); Activity form (time, location, notes/description)

**Outputs:** New/updated/deleted day and activity records; rendered itinerary view grouped by day

**Business Rules**
- A Day belongs to exactly one Trip; an Activity belongs to exactly one Day.
- Days are typically expected to fall within the trip's start and end dates; the system should warn (not necessarily block) if a day is added outside that range.
- Activities within a day are displayed in chronological order by time.

**Validation Rules**
- Day date: required, must be a valid date.
- Activity time: required, must be a valid time value.
- Activity location: required, 2–100 characters.
- Activity notes: optional, maximum 300 characters.

**Acceptance Criteria**
- Given a trip, when a new day is added, then it appears in the itinerary view in correct date order.
- Given a day, when a new activity is added with valid data, then it appears under that day, sorted by time.
- Given an existing activity, when edited, then the updated details are shown immediately in the itinerary view.
- Given an existing activity, when deleted, then it no longer appears in the itinerary.
- Given a day with no activities, when viewed, then an empty state (e.g., "No activities yet for this day") is shown.

---

### 9.5 Budget Management Module

**Purpose:** Allow the user to define a budget for a trip, broken into fixed categories, and see how much of that budget remains as expenses are logged.

**Features**
- Create a Budget for a trip (overall total amount)
- Allocate the budget across fixed categories: Transportation, Accommodation, Food, Activities, Shopping, Miscellaneous
- View remaining budget, overall and per category
- Automatic recalculation of remaining budget whenever expenses change

**Inputs:** Budget form (overall amount, and an amount per category)

**Outputs:** New/updated budget and category records; rendered budget summary showing planned vs. spent vs. remaining, overall and per category

**Business Rules**
- Each trip has exactly one budget.
- The six budget categories are fixed and predefined by the system (Transportation, Accommodation, Food, Activities, Shopping, Miscellaneous); the user allocates amounts to each but does not create custom categories, keeping the data model simple.
- Remaining Budget (overall) = Total Budget − Sum of All Expenses for the trip.
- Remaining Budget (per category) = Category Allocation − Sum of Expenses in that category.
- Remaining budget figures recalculate automatically and immediately whenever an expense is added, edited, or deleted (see Section 9.6).

**Validation Rules**
- Total Budget amount: required, numeric, greater than 0.
- Category amounts: numeric, greater than or equal to 0.
- Sum of category amounts should not exceed the total budget; if it does, a warning is shown (this may be a soft warning rather than a hard block, at the student's implementation discretion, but must be clearly flagged in the UI).

**Acceptance Criteria**
- Given a trip with no budget yet, when the Create Budget form is submitted with valid data, then the budget and its category allocations are saved and displayed on the Budget page.
- Given a budget with category allocations, when the Budget page is viewed, then the sum of category allocations plus any unallocated amount reconciles with the total budget.
- Given expenses logged against categories, when the Budget page is viewed, then remaining budget (overall and per category) reflects the current expense totals accurately.

---

### 9.6 Expense Management Module

**Purpose:** Allow the user to log actual spending against a trip's budget categories, automatically keeping the budget view accurate.

**Features**
- Add an Expense (amount, category, date, description)
- Edit an Expense
- Delete an Expense
- View Expense History for a trip (list of all expenses, most recent first, filterable by category)
- Automatic Budget Update whenever an expense changes

**Inputs:** Expense form (amount, category — selected from the trip's budget categories, date, description)

**Outputs:** New/updated/deleted expense record; updated remaining-budget figures on the Budget page; rendered expense history list

**Business Rules**
- Every expense belongs to exactly one trip and is assigned to exactly one of that trip's budget categories.
- An expense cannot be created for a trip that does not yet have a budget (the user must create a budget first, so that a category exists to assign the expense to).
- Adding, editing, or deleting an expense immediately triggers recalculation of that category's remaining amount and the trip's overall remaining budget.

**Validation Rules**
- Amount: required, numeric, greater than 0.
- Category: required, must be one of the trip's existing six budget categories.
- Date: required, must be a valid date (recommended to fall within the trip's date range, flagged if not).
- Description: optional, maximum 200 characters.

**Acceptance Criteria**
- Given a trip with a budget, when a valid expense is added, then it appears in the expense history and the corresponding category's remaining budget decreases by that amount.
- Given an existing expense, when edited (e.g., amount changed), then the budget recalculates to reflect the new amount, not the old one.
- Given an existing expense, when deleted, then the corresponding category's remaining budget increases back by that amount.
- Given a trip's expense history, when filtered by category, then only expenses in that category are shown.

---

### 9.7 User Profile Module

**Purpose:** Allow the user to view and manage their own account information.

**Features**
- View Profile (name, email)
- Edit Profile (update name and/or email)
- Change Password (requires current password confirmation)

**Inputs:** Edit Profile form (name, email); Change Password form (current password, new password, confirm new password)

**Outputs:** Updated user record; confirmation messages on success; error messages on failure

**Business Rules**
- A user can only view and edit their own profile (enforced via the session's user ID, never via a client-supplied ID).
- Changing the email to one already used by another account is not permitted.
- Changing the password requires correctly entering the current password first.

**Validation Rules**
- Name: required, 2–50 characters.
- Email: required, valid email format, must be unique (excluding the user's own current email).
- Current Password: required, must match the stored password for the account.
- New Password: required, minimum 8 characters.
- Confirm New Password: must match New Password exactly.

**Acceptance Criteria**
- Given a logged-in user, when they view their profile, then their current name and email are displayed accurately.
- Given a valid profile edit, when submitted, then the updated name/email is saved and reflected immediately.
- Given an attempt to change email to one already in use, when submitted, then a clear validation error is shown and no change is made.
- Given a correct current password and a valid new password, when the Change Password form is submitted, then the password is updated and the user can log in with the new password on the next login.
- Given an incorrect current password, when Change Password is submitted, then the request is rejected with a clear error and no change is made.

---

## 10. Page Descriptions

The frontend consists of 9 pages, built with plain HTML/CSS/JavaScript, each dynamically rendering data fetched from the Express REST API.

### 10.1 Home Page

- **Purpose:** Public landing page introducing the application, with links to Login and Register.
- **Components:** Header/navigation bar, brief description of the app, call-to-action buttons.
- **Forms:** None.
- **Buttons:** "Login," "Register."
- **Navigation:** Links to Login and Register pages only (no protected content is visible here).

### 10.2 Login Page

- **Purpose:** Allow a registered user to authenticate and start a session.
- **Components:** Login form, link to Register page.
- **Forms:** Email field, Password field.
- **Buttons:** "Login" (submit), link/button to Register.
- **Navigation:** On success, redirects to Dashboard. On failure, remains on Login with an inline error message.

### 10.3 Register Page

- **Purpose:** Allow a new user to create an account.
- **Components:** Registration form, link to Login page.
- **Forms:** Name, Email, Password, Confirm Password fields.
- **Buttons:** "Register" (submit), link/button to Login.
- **Navigation:** On success, redirects to Login (or directly to Dashboard if auto-login is implemented). On failure, remains on Register with inline validation errors.

### 10.4 Dashboard Page

- **Purpose:** Central authenticated landing page summarizing the user's trips and budget status.
- **Components:** Welcome header with user's name, upcoming trips list/cards, budget summary widget, quick statistics cards (total trips, total budget, total expenses).
- **Forms:** None directly (may include a shortcut button leading to the Create Trip form).
- **Buttons:** "Create New Trip," "View All Trips," links into individual trips.
- **Navigation:** Primary navigation bar links to Trips, Budget, Expenses, Profile, and Logout are present on this and all authenticated pages.

### 10.5 Trips Page

- **Purpose:** List all trips belonging to the logged-in user, and allow creation of new trips.
- **Components:** Trip list/cards showing destination, dates, and status; "Create Trip" form (inline or modal).
- **Forms:** Create Trip form (destination, start date, end date, description, number of travelers).
- **Buttons:** "Create Trip," "View" (per trip), "Edit" (per trip), "Delete" (per trip, with confirmation).
- **Navigation:** Clicking a trip navigates to the Trip Details page for that trip.

### 10.6 Trip Details Page

- **Purpose:** Show full details of a single trip, including its itinerary, and provide access to that trip's budget and expenses.
- **Components:** Trip info panel (destination, dates, description, number of travelers, status), itinerary section (days and activities), links/tabs to that trip's Budget and Expenses views.
- **Forms:** Edit Trip form; Add Day form; Add Activity form.
- **Buttons:** "Edit Trip," "Delete Trip," "Add Day," "Add Activity," "Edit"/"Delete" per activity, "Go to Budget," "Go to Expenses."
- **Navigation:** Back to Trips list; forward to this trip's Budget and Expenses pages.

### 10.7 Budget Page

- **Purpose:** Allow the user to create/edit a trip's budget and view remaining budget overall and by category.
- **Components:** Budget form (total amount, category allocations), remaining-budget summary table/chart (overall and per category).
- **Forms:** Create/Edit Budget form (total amount; amount per category: Transportation, Accommodation, Food, Activities, Shopping, Miscellaneous).
- **Buttons:** "Save Budget," "Edit Budget."
- **Navigation:** Linked from and back to the relevant Trip Details page.

### 10.8 Expenses Page

- **Purpose:** Allow the user to log and manage expenses for a trip, and view expense history.
- **Components:** Add Expense form, expense history list/table (filterable by category), running remaining-budget indicator.
- **Forms:** Add/Edit Expense form (amount, category, date, description).
- **Buttons:** "Add Expense," "Edit" (per expense), "Delete" (per expense, with confirmation), category filter control.
- **Navigation:** Linked from and back to the relevant Trip Details / Budget page.

### 10.9 Profile Page

- **Purpose:** Allow the user to view/edit their account details and change their password.
- **Components:** Profile info display, Edit Profile form, Change Password form.
- **Forms:** Edit Profile (name, email); Change Password (current password, new password, confirm new password).
- **Buttons:** "Save Changes," "Change Password."
- **Navigation:** Accessible from the primary navigation bar on all authenticated pages; includes "Logout."

---

## 11. Database Design Overview

The database is a relational MySQL schema consisting of six tables, matching the six data-owning modules (Users, Trips, Itinerary Days, Activities, Budgets, Expenses). No unnecessary tables are introduced; budget categories are treated as fixed values on the Budgets/Expenses tables rather than a separate lookup table, keeping the schema simple and appropriate for the project's scope.

### 11.1 Tables and Columns

| Table | Key Columns | Primary Key | Foreign Keys |
|-------|--------------|--------------|----------------|
| Users | name, email, password_hash, created_at | user_id | — |
| Trips | destination, start_date, end_date, description, num_travelers, status, user_id | trip_id | user_id → Users |
| ItineraryDays | day_date, trip_id | day_id | trip_id → Trips |
| Activities | time, location, notes, day_id | activity_id | day_id → ItineraryDays |
| Budgets | total_amount, transportation_amount, accommodation_amount, food_amount, activities_amount, shopping_amount, misc_amount, trip_id | budget_id | trip_id → Trips |
| Expenses | amount, category, expense_date, description, trip_id | expense_id | trip_id → Trips |

### 11.2 Relationships

- **Users → Trips:** One-to-many. One user owns many trips; each trip belongs to exactly one user.
- **Trips → ItineraryDays:** One-to-many. One trip has many itinerary days; each day belongs to exactly one trip.
- **ItineraryDays → Activities:** One-to-many. One day has many activities; each activity belongs to exactly one day.
- **Trips → Budgets:** One-to-one. Each trip has at most one budget; each budget belongs to exactly one trip.
- **Trips → Expenses:** One-to-many. One trip has many expenses; each expense belongs to exactly one trip and references one of that trip's fixed budget categories via its `category` field.

### 11.3 Design Notes

- Budget categories (Transportation, Accommodation, Food, Activities, Shopping, Miscellaneous) are implemented as fixed columns on the Budgets table and a fixed enumerated value on the Expenses table's `category` column, rather than a separate Categories table — this keeps joins simple and matches the fixed, non-custom nature of the categories specified in scope.
- Cascading deletes should be configured (or handled at the application layer) so that deleting a Trip also removes its associated ItineraryDays, Activities, Budget, and Expenses.
- All foreign key columns should be indexed to keep trip-scoped queries (e.g., "all expenses for trip X") fast.

---

## 12. API Overview

All endpoints are prefixed with `/api` and, apart from registration and login, require an active session. Ownership checks are applied server-side on every request (a user may only access their own trips, itinerary, budget, and expenses).

### 12.1 Authentication & Profile Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/register | Create a new user account |
| POST | /api/login | Authenticate and start a session |
| POST | /api/logout | End the current session |
| GET | /api/profile | Get the logged-in user's profile |
| PUT | /api/profile | Update the logged-in user's name/email |
| PUT | /api/profile/password | Change the logged-in user's password |

### 12.2 Trip Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/trips | List all trips for the logged-in user |
| POST | /api/trips | Create a new trip |
| GET | /api/trips/:id | Get details of a single trip |
| PUT | /api/trips/:id | Update a trip |
| DELETE | /api/trips/:id | Delete a trip (cascades to its itinerary, budget, expenses) |

### 12.3 Itinerary Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/trips/:id/days | List all itinerary days for a trip |
| POST | /api/trips/:id/days | Add a new day to a trip |
| DELETE | /api/days/:dayId | Delete an itinerary day |
| GET | /api/days/:dayId/activities | List activities for a day |
| POST | /api/days/:dayId/activities | Add a new activity to a day |
| PUT | /api/activities/:id | Update an activity |
| DELETE | /api/activities/:id | Delete an activity |

### 12.4 Budget Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/trips/:id/budget | Get the budget (and remaining totals) for a trip |
| POST | /api/trips/:id/budget | Create a budget for a trip |
| PUT | /api/trips/:id/budget | Update an existing budget's total/category amounts |

### 12.5 Expense Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/trips/:id/expenses | List all expenses for a trip (supports category filter query param) |
| POST | /api/trips/:id/expenses | Add a new expense to a trip |
| PUT | /api/expenses/:id | Update an existing expense |
| DELETE | /api/expenses/:id | Delete an expense |

### 12.6 General API Conventions

- All endpoints return JSON.
- Successful create/update operations return the created/updated resource; successful deletes return a simple confirmation object.
- Requests to protected endpoints without a valid session return a 401 Unauthorized response.
- Requests for a resource the session's user does not own return a 403 Forbidden (or a 404, to avoid revealing existence) response.
- Validation failures return a 400 Bad Request response with a message describing the invalid field(s).

---

## 13. Business Rules

| Domain | Rule |
|--------|------|
| Account Ownership | A user can only ever view, edit, or delete trips, itinerary items, budgets, and expenses that they created; this is enforced server-side via the session's user ID on every request, never trusted from client input. |
| Trip Deletion | Deleting a trip cascades to delete all of its itinerary days, activities, its budget, and its expenses. |
| Budget Prerequisite | A trip must have a budget created before expenses can be logged against it, since every expense requires a valid budget category. |
| Budget Calculation | Remaining Budget (overall) = Total Budget − Sum of all Expenses for the trip. Remaining Budget (per category) = that category's allocated amount − Sum of Expenses in that category. |
| Recalculation Trigger | Any create, update, or delete operation on an Expense immediately triggers recalculation of the affected category's and the trip's overall remaining budget. |
| Trip Status | Trip status (Upcoming / Ongoing / Completed) is derived from comparing the current date to the trip's start and end dates. |
| Category Fixed Set | Budget/expense categories are limited to the six predefined values: Transportation, Accommodation, Food, Activities, Shopping, Miscellaneous. Users cannot create custom categories in this version. |
| Session Expiry | If a session expires or is invalidated, the next request to any protected route redirects the user to the Login page. |

---

## 14. Validation Rules

| Field | Rule |
|-------|------|
| Name (Register/Profile) | Required, 2–50 characters |
| Email | Required, valid email format, must be unique across Users |
| Password | Required, minimum 8 characters |
| Confirm Password | Must exactly match Password/New Password |
| Trip Destination | Required, 2–100 characters |
| Trip Start Date | Required, valid date |
| Trip End Date | Required, valid date, must be on or after Start Date |
| Trip Description | Optional, maximum 500 characters |
| Number of Travelers | Required, integer, minimum 1 |
| Itinerary Day Date | Required, valid date |
| Activity Time | Required, valid time value |
| Activity Location | Required, 2–100 characters |
| Activity Notes | Optional, maximum 300 characters |
| Budget Total Amount | Required, numeric, greater than 0 |
| Budget Category Amount | Numeric, greater than or equal to 0 |
| Expense Amount | Required, numeric, greater than 0 |
| Expense Category | Required, must be one of the six fixed categories |
| Expense Date | Required, valid date |
| Expense Description | Optional, maximum 200 characters |

All validation rules above are enforced on both the client (immediate user feedback via JavaScript) and the server (authoritative enforcement in Express route handlers), since client-side validation alone can be bypassed.

---

## 15. UI Requirements

| Aspect | Requirement |
|--------|-------------|
| Layout | Clean, uncluttered layout with a consistent navigation bar across all authenticated pages (Dashboard, Trips, Budget, Expenses, Profile, Logout) |
| Responsiveness | CSS must use relative units and media queries (or a lightweight grid/flexbox system) so pages render correctly at mobile (~360px), tablet (~768px), and desktop (~1200px+) widths |
| Visual Style | Modern, simple styling: a clear color palette (e.g., a primary travel-themed blue/teal with a neutral background), readable sans-serif typography, and consistent spacing |
| Forms | All forms show clear labels, placeholder text where helpful, and inline error messages next to the relevant field on validation failure |
| Feedback | Success actions (e.g., "Trip created," "Expense added") show a brief confirmation message or visual cue; destructive actions (delete trip/activity/expense) require a confirmation prompt before proceeding |
| Dynamic Rendering | Trip lists, itinerary items, budget summaries, and expense histories are rendered dynamically from API data using vanilla JavaScript (fetch calls + DOM manipulation), not hard-coded in HTML |
| Accessibility (Basic) | Sufficient color contrast, labeled form inputs, and logical tab order across all pages |

---

## 16. Security Requirements

| Area | Requirement |
|------|-------------|
| Password Storage | Passwords must be hashed (e.g., using bcrypt) before being stored; plain-text passwords are never stored or logged |
| Session Management | Sessions are managed server-side (e.g., via `express-session`); session cookies should be marked HttpOnly to reduce client-side script access |
| Authorization Checks | Every API route that accesses trip, itinerary, budget, or expense data must verify that the record belongs to the logged-in user's session, not just that a session exists |
| Input Validation | All inputs are validated and sanitized server-side, regardless of client-side checks, to prevent malformed or malicious data from reaching the database |
| SQL Injection Prevention | All database queries must use parameterized queries (prepared statements) rather than direct string concatenation |
| Route Protection | Protected routes (Dashboard, Trips, Budget, Expenses, Profile) must check for a valid session before rendering or returning data, redirecting unauthenticated requests to Login |

---

## 17. Testing Requirements

| Test Type | Focus |
|-----------|-------|
| Unit Testing | Validation functions (e.g., email format, date range checks), budget calculation logic (remaining budget formulas) |
| Integration Testing | API endpoints for each module (auth, trips, itinerary, budget, expenses), verifying correct database reads/writes and correct HTTP status codes |
| Authentication Testing | Verify registration, login, logout, session persistence, and session expiry behave correctly, including rejection of invalid credentials |
| Authorization Testing | Verify a user cannot access, edit, or delete another user's trips/itinerary/budget/expenses, including via direct ID manipulation in the URL |
| Validation Testing | Verify each form field's validation rule is enforced, both for valid and invalid boundary values (e.g., empty fields, negative numbers, end date before start date) |
| Manual UI Testing | Verify responsive layout at mobile/tablet/desktop breakpoints, and correct dynamic rendering of trip lists, itineraries, budgets, and expense histories |
| Regression Testing | Re-verify that budget recalculation remains correct after edits/deletes to expenses, especially across multiple categories |

---

## 18. Future Enhancements

The following ideas are explicitly out of scope for this project but are documented here as natural next steps if the project were extended beyond a single-term college assignment:

| Enhancement | Description |
|--------------|--------------|
| AI Trip Planner | Suggest itineraries automatically based on destination and trip length |
| Weather Integration | Show forecasted weather for the trip destination and dates |
| Maps Integration | Visualize itinerary stops and destinations on an interactive map |
| Hotel/Flight Booking | Integrate with booking APIs to book accommodation/transport directly |
| Expense Splitting | Allow multiple users to split and settle shared trip expenses |
| Currency Converter | Convert expenses logged in foreign currencies to a home currency |
| Receipt Scanner (OCR) | Auto-extract expense details from a photographed receipt |
| Mobile App | Build a dedicated native or cross-platform mobile companion app |
| Email Notifications | Send trip reminders or budget alerts via email |
| Multi-user Collaboration | Allow trip owners to invite others to view or edit a shared trip |

---

## 19. MVP Definition

The Minimum Viable Product for this college project consists of all seven modules defined in Section 9, since each is required to demonstrate the core learning objectives (authentication, CRUD, relational data, REST APIs, and dynamic frontend rendering):

- User Authentication (register, login, logout, session handling, basic profile)
- Dashboard (upcoming trips, budget summary, quick statistics)
- Trip Management (full CRUD)
- Itinerary Management (days and activities, full CRUD)
- Budget Management (creation, fixed categories, automatic remaining-budget calculation)
- Expense Management (full CRUD, tied to budget categories, automatic budget recalculation)
- User Profile (view, edit, change password)

No module is deferred beyond this list — the project's scope was deliberately sized so that the full feature set above constitutes both the MVP and the final deliverable. Section 18 (Future Enhancements) contains everything intentionally left out.

---

## 20. Development Roadmap

A suggested single-student timeline, assuming roughly a 10–12 week term:

| Phase | Weeks | Focus |
|-------|-------|-------|
| Phase 1: Setup & Database | Weeks 1–2 | Set up Node.js/Express project structure; design and create the MySQL schema (Users, Trips, ItineraryDays, Activities, Budgets, Expenses) |
| Phase 2: Authentication | Weeks 2–3 | Build register, login, logout, session handling, and route protection middleware |
| Phase 3: Trip Management | Weeks 3–5 | Build Trip CRUD API endpoints and the Trips / Trip Details pages |
| Phase 4: Itinerary Management | Weeks 5–6 | Build itinerary day/activity CRUD endpoints and the itinerary section of the Trip Details page |
| Phase 5: Budget Management | Weeks 6–8 | Build budget creation/update endpoints, category allocation logic, and the Budget page |
| Phase 6: Expense Management | Weeks 8–9 | Build expense CRUD endpoints, automatic budget recalculation, and the Expenses page |
| Phase 7: Dashboard & Profile | Weeks 9–10 | Build the Dashboard aggregation view and the Profile/Change Password functionality |
| Phase 8: Polish, Responsive Styling & Testing | Weeks 10–12 | Apply responsive CSS across all pages, conduct validation/authorization/regression testing, fix bugs, and finalize documentation |

---

*End of Document — Travel Planning & Budget Management System PRD v1.0 (College Project Edition)*
