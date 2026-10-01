# System Technical Description

## Voyage — Travel Planning & Budget Management System

---

### 1. Executive Summary

**Voyage** is a full-stack, multi-tier web application designed to simplify trip planning, itinerary management, and budget tracking. Built with a focus on simplicity, responsiveness, data integrity, and strict separation of concerns, the system enables travelers to organize journeys, schedule day-by-day activities, allocate categorical budgets, and log real-time expenses with currency accuracy.

---

### 2. High-Level System Architecture

The application implements a classic **Layered Model-View-Controller (MVC) Architecture** with strict directional flow:

```
[ Web Browser ]
      │  (HTTP / REST / JSON)
      ▼
[ Express Router ] ───► [ Middleware ] (Auth Session, CSRF, Input Validation)
      │
      ▼
[ Controllers ] (Thin HTTP translation, status codes, payload delivery)
      │
      ▼
[ Services ] (Pure business logic, financial math, status calculations)
      │
      ▼
[ Models ] (Data access layer, parameterized SQL queries)
      │
      ▼
[ MySQL Database ] (3NF Relational Schema)
```

#### Architectural Invariants
- **Thin Controllers:** Controllers only unpack requests, invoke services, and return standardized JSON responses.
- **Service-Bound Logic:** All domain logic, calculations, date derivations, and business rules reside exclusively in services.
- **Model-Bound Data Access:** Raw SQL queries are strictly confined to model files. No SQL exists in controllers or services.
- **Zero Heavy Frameworks:** The frontend uses clean, semantic Vanilla HTML5, modular CSS3, and vanilla ES6+ JavaScript—ensuring high performance, zero build-step overhead, and maximum longevity.

---

### 3. Technology Stack

| Layer | Technology | Version / Spec | Purpose & Rationale |
|---|---|---|---|
| **Frontend UI** | HTML5 Semantic Markup | Living Standard | High accessibility, screen-reader support, SEO-friendly semantic structure. |
| **Styling** | Modular Native CSS3 | CSS Grid / Flexbox | Zero external CSS frameworks (no Tailwind/Bootstrap); design tokens via CSS custom properties (`variables.css`). |
| **Client Scripting** | Vanilla JavaScript | ECMAScript 2022+ | Centralized `Voyage` namespace for API calls, CSRF management, currency formatting, and state sync. |
| **Backend Runtime** | Node.js | v18+ LTS | Event-driven, asynchronous I/O engine for handling concurrent REST requests. |
| **Application Framework** | Express.js | v4.18+ | Minimalist, robust routing and middleware pipeline. |
| **Database** | MySQL | v8.0 / Railway Cloud | Relational DBMS ensuring ACID transactions, foreign key constraints, and 3NF normalization. |
| **Database Driver** | `mysql2/promise` | v3.6+ | Connection pooling and prepared statements for high throughput and SQL-injection defense. |
| **Session & Auth** | `express-session` + `bcrypt` | Current | Secure HTTP-only cookie sessions; salted password hashing (10 salt rounds). |
| **Automated Testing** | Node.js Native Test Runner | `node:test` + `node:assert` | Fast, dependency-free test execution for API, authentication, finance math, and UI contracts. |

---

### 4. Core System Modules

#### 4.1 Authentication & Session Management
- **Mechanism:** Stateful server-side session management utilizing secure, HTTP-only cookies.
- **Security:** CSRF token verification on all state-mutating requests (`POST`, `PUT`, `DELETE`).
- **Isolation:** Strict tenant/user data isolation. Every query enforces `user_id` ownership verification derived directly from the authenticated session—client-supplied user IDs are never trusted.

#### 4.2 Trip Management Module
- **Capabilities:** Create, view, edit, and delete trips with destination, start date, end date, traveler count, and notes.
- **Dynamic Status Derivation:** Trips automatically compute operational states based on the Indian Standard Time (`Asia/Kolkata`) calendar:
  - `upcoming` (`today < startDate`)
  - `ongoing` (`startDate <= today <= endDate`)
  - `completed` (`today > endDate`)

#### 4.3 Itinerary Scheduling Module
- **Capabilities:** Schedule day-by-day travel activities linked to trips.
- **Attributes:** Day number, activity title, time, location, category accent tags (`sightseeing`, `food`, `transit`, `rest`), and notes.
- **Sorting:** Chronologically sorted by day and time for seamless travel execution.

#### 4.4 Budget & Financial Precision Engine
- **Integer Currency Representation:** To eliminate IEEE-754 binary floating-point rounding errors common in monetary systems, all currency is calculated and validated down to the exact **paise** (`1 INR = 100 paise`).
- **Category Allocation:** Supports customizable spending buckets (Stay, Transit, Food, Activities, Miscellaneous).
- **Real-Time Health Monitoring:** Automatically computes:
  - Spent vs. Allocated per category.
  - Consumed percentage and overall trip burn rate.
  - Category status tags: `safe`, `near` (within 15% of limit), and `over` (budget exceeded).
- **Negative Balance Handling:** Properly tracks and visually signals budget overruns.

#### 4.5 Cinematic Visual Asset & Cover Engine
- **Deterministic Matcher:** Automatically resolves destination cover photography in trip cards and the journey header banner:
  - Goa destinations → `trip-goa.png`
  - Jaipur destinations → `trip-jaipur.png`
  - Munnar destinations → `journey-header.png` / `trip-munnar.png`
  - Completed generic trips → `trip-completed.png`
  - Other cities (e.g., Delhi, Mumbai, international) → Elegant fallback to native CSS geometric landscape gradients.

---

### 5. Relational Database Schema

The database consists of 6 core normalized relational tables:

```text
┌──────────────┐       ┌──────────────┐       ┌──────────────────┐
│    users     │───<───│    trips     │───<───│   itineraries    │
└──────────────┘       └──────────────┘       └──────────────────┘
       │                      │
       │                      │
       │                      ▼
       │               ┌──────────────┐       ┌──────────────────┐
       │               │   budgets    │───<───│budget_categories │
       │               └──────────────┘       └──────────────────┘
       │                      │                         │
       │                      ▼                         ▼
       │               ┌─────────────────────────────────┐
       └───────<───────│            expenses             │
                       └─────────────────────────────────┘
```

1. **`users`**: `id`, `name`, `email` (unique), `password_hash`, `created_at`, `updated_at`.
2. **`trips`**: `id`, `user_id` (FK), `destination`, `start_date`, `end_date`, `num_travelers`, `description`, `created_at`, `updated_at`.
3. **`itineraries`**: `id`, `trip_id` (FK), `day_number`, `activity_title`, `activity_time`, `location`, `category`, `notes`.
4. **`budgets`**: `id`, `trip_id` (FK, unique), `total_budget` (DECIMAL 12,2), `currency` (default 'INR').
5. **`budget_categories`**: `id`, `budget_id` (FK), `name`, `allocated_amount` (DECIMAL 12,2).
6. **`expenses`**: `id`, `trip_id` (FK), `category_id` (FK), `user_id` (FK), `amount` (DECIMAL 12,2), `expense_date`, `description`, `receipt_url`.

**Foreign Key Integrity:** All child records enforce `ON DELETE CASCADE` constraints to prevent orphaned financial or itinerary records.

---

### 6. Security & Quality Assurance

- **SQL Injection Defense:** 100% of database interactions use parameterized queries via prepared statements.
- **Cross-Site Scripting (XSS):** Contextual HTML escaping function (`escape()`) sanitizes all dynamic user inputs before DOM rendering.
- **CSRF Protection:** Anti-CSRF token verification required for all state-changing API operations.
- **Session Protection:** Session cookies are configured with `httpOnly: true`, `sameSite: 'lax'`, and configurable `secure` flags.
- **Automated Regression Suite:** 8 end-to-end integration and regression test suites covering:
  1. Private API session gating.
  2. Accessibility, single H1 hierarchy, and asset integrity.
  3. UI operational scripts under empty, success, and error states.
  4. Authentication, profile modification, and CRUD ownership isolation.
  5. Journey metrics and timeline logic.
  6. Financial paise precision and IEEE-754 loss prevention.
  7. Ownership boundary enforcement.
  8. Concurrent profile state protection.

---

### 7. Deployment & Local Execution

- **Runtime:** Node.js 18+
- **Database:** Local MySQL instance or cloud-hosted MySQL (e.g., Railway).
- **Environment Configuration:** Managed via `.env` with `.env.example` template.
- **Start Command:** `npm start` (launches server on `http://localhost:3000`).
- **Test Command:** `npm test` (executes native test runner).
- **VS Code Integration:** Pre-configured `.vscode/launch.json` enables 1-click execution via **F5**.
