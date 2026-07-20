# Technical Design Document

## Project

**Travel Planning & Budget Management System**

This document defines the technical standards for the project. Every future frontend, backend, database, and API implementation must follow this document unless the document is formally updated first.

## 1. Overall Architecture

The project uses a layered full-stack architecture:

```text
Browser
  ↓
Frontend: HTML + CSS + Vanilla JavaScript
  ↓ HTTP / JSON
Backend: Node.js + Express.js
  ↓ SQL
Database: MySQL
```

Responsibilities:

- The frontend renders pages, handles basic UI interactions, and communicates with the backend through APIs.
- The backend owns business logic, authentication/session handling, validation, authorization, and API responses.
- The database stores normalized application data for users, trips, itineraries, budgets, categories, and expenses.
- The frontend must not contain business-critical validation or database logic.
- The backend must not contain presentation-specific styling logic.

## 2. Folder Structure

```text
.
├── frontend/
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── images/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── services/
│   ├── utils/
│   └── public/
├── database/
├── docs/
└── public/
```

Folder purposes:

- `frontend/`: Static frontend pages and browser assets.
- `frontend/css/`: CSS files split by responsibility.
- `frontend/js/`: Vanilla JavaScript modules split by behavior.
- `frontend/images/`: Local images, icons, screenshots, and visual assets.
- `backend/`: Node.js and Express.js source files.
- `backend/config/`: Environment, server, database, and application configuration.
- `backend/controllers/`: HTTP request handlers.
- `backend/routes/`: Express route declarations.
- `backend/models/`: MySQL data access and table-facing logic.
- `backend/middleware/`: Authentication, validation, authorization, logging, and error middleware.
- `backend/services/`: Business logic and workflow orchestration.
- `backend/utils/`: Shared helper functions.
- `backend/public/`: Static assets served by Express, if required.
- `database/`: SQL schema, migrations, seed data, and database documentation.
- `docs/`: Requirements, technical design, API documentation, and project reports.
- `public/`: Root-level deployable static output or shared public assets.

## 3. Naming Conventions

General:

- Use descriptive names over abbreviations.
- Use one concept per file.
- File and folder names must be lowercase.
- Use hyphenated names for frontend assets: `budget-card.css`, `trip-form.js`.
- Use camelCase for JavaScript variables and functions.
- Use PascalCase only for constructor-like classes if classes are introduced.
- Use UPPER_SNAKE_CASE for constants.
- Use snake_case for MySQL table and column names.

Examples:

- HTML section id: `trip-management`
- CSS class: `.trip-card`
- JS function: `calculateRemainingBudget`
- Express route file: `trip.routes.js`
- Controller file: `trip.controller.js`
- Service file: `trip.service.js`
- Model file: `trip.model.js`
- Database table: `trip_expenses`
- Database column: `created_at`

## 4. HTML Conventions

HTML must be semantic, accessible, and valid.

Rules:

- Use `<!DOCTYPE html>` and `lang="en"` on every page.
- Use one clear `<h1>` per page.
- Use semantic landmarks: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`.
- Every major section must have a heading or an accessible label.
- Decorative icons and images must use `aria-hidden="true"` or empty `alt=""`.
- Meaningful images must have descriptive `alt` text.
- Buttons are for actions; links are for navigation.
- Do not use `href="#"` placeholders.
- Do not use inline CSS.
- Do not use inline JavaScript.
- Form inputs must have associated `<label>` elements.
- Use `required`, `min`, `max`, `type`, and `autocomplete` attributes where appropriate.
- Use valid `datetime` attributes for machine-readable dates and times.

## 5. CSS Architecture

CSS is split by responsibility:

- `variables.css`: Design tokens such as colors, fonts, shadows, spacing boundaries, and reusable values.
- `base.css`: Resets, default element styles, accessibility helpers, and global browser behavior.
- `layout.css`: Page layout primitives, grids, containers, and section spacing.
- `components.css`: Reusable UI components such as buttons, cards, glass panels, and progress bars.
- `animations.css`: Keyframes, reveal behavior, motion classes, and reduced-motion support.
- `landing.css`: Landing-page-specific styles.
- `responsive.css`: Media queries and viewport-specific adjustments.

Rules:

- Do not use Tailwind, Bootstrap, or any CSS framework.
- Do not use inline styles.
- Use CSS variables for repeated values.
- Keep reusable styles in `components.css`.
- Keep page-specific styles in the page stylesheet.
- Prefer class selectors over id selectors for styling.
- Avoid overly specific selectors.
- Avoid duplicate color literals outside `variables.css`.
- All animations must respect `prefers-reduced-motion`.
- Responsive behavior must be mobile-first where practical.
- CSS class names should describe purpose, not appearance only.

## 6. JavaScript Architecture

Frontend JavaScript must remain vanilla JavaScript.

Current structure:

- `navbar.js`: Navbar scroll behavior and navigation-related interactions.
- `scroll.js`: Scroll reveal and viewport observation behavior.
- `animations.js`: Animation preference handling and motion-related setup.
- `landing.js`: Landing-page-specific initialization.

Rules:

- Do not use React, Vue, Angular, jQuery, or frontend frameworks.
- Keep files focused on one behavior area.
- Wrap page scripts to avoid leaking variables into global scope.
- Use `const` by default and `let` only when reassignment is required.
- Use event delegation when handling repeated elements.
- Add defensive checks before querying or modifying DOM nodes.
- Use `defer` for page scripts.
- Avoid business-critical validation only in frontend JavaScript; backend validation is mandatory.
- Do not store sensitive data in localStorage or sessionStorage.

## 7. Express Architecture

The backend must follow a route-controller-service-model structure.

Request flow:

```text
route → middleware → controller → service → model → database
```

Responsibilities:

- Routes define URL paths and connect middleware/controllers.
- Middleware handles cross-cutting concerns.
- Controllers parse request data and return HTTP responses.
- Services contain business rules and workflow logic.
- Models contain SQL queries and database mapping logic.
- Config files centralize environment-specific settings.

Rules:

- Controllers must stay thin.
- Services must not directly access `req` or `res`.
- Models must not contain HTTP response logic.
- Routes must not contain business logic.
- All async route handlers must forward errors to centralized error handling.
- API responses must use a consistent JSON format.

## 8. Database Architecture

Database: MySQL.

Core future entities:

- `users`
- `trips`
- `itinerary_days`
- `itinerary_activities`
- `budget_categories`
- `trip_budgets`
- `expenses`
- `sessions` if database-backed sessions are used

Rules:

- Use normalized tables.
- Use snake_case table and column names.
- Every main table must include `id`, `created_at`, and `updated_at`.
- Use foreign keys for relationships.
- Use indexes on foreign keys and frequently searched fields.
- Use `DECIMAL` for money values, not floating-point types.
- Store dates and times using appropriate MySQL date/time types.
- Never build SQL using unsafe string concatenation.
- Use parameterized queries.
- Store schema changes as migration files once migrations are introduced.

## 9. API Naming Conventions

Base path:

```text
/api/v1
```

Resource naming:

- Use plural nouns.
- Use lowercase kebab-case only when multiple words are needed.
- Use nested routes only when the relationship is required.

Examples:

```text
GET    /api/v1/trips
POST   /api/v1/trips
GET    /api/v1/trips/:tripId
PUT    /api/v1/trips/:tripId
DELETE /api/v1/trips/:tripId

GET    /api/v1/trips/:tripId/expenses
POST   /api/v1/trips/:tripId/expenses
```

Response format:

```json
{
  "success": true,
  "message": "Request completed successfully.",
  "data": {}
}
```

Error format:

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": []
}
```

## 10. Session Management

Session management must be handled by the backend.

Rules:

- Use secure, HTTP-only cookies for session identifiers.
- Do not store passwords, tokens, or sensitive user data in frontend storage.
- Session cookies must use `httpOnly`.
- Session cookies must use `secure` in production.
- Session cookies must use `sameSite` protection.
- Session expiration must be defined.
- Logout must destroy the server-side session.
- Authentication checks must be implemented as middleware.
- Authorization checks must verify ownership of user-specific resources.

## 11. Error Handling

Frontend:

- Show user-friendly messages.
- Do not expose technical stack traces to users.
- Handle failed API requests gracefully.

Backend:

- Use centralized error-handling middleware.
- Use consistent HTTP status codes.
- Never leak database errors or stack traces in production responses.
- Log server-side errors for debugging.
- Validation errors must return `400`.
- Authentication failures must return `401`.
- Authorization failures must return `403`.
- Missing resources must return `404`.
- Unexpected server failures must return `500`.

## 12. Validation Rules

Validation must exist on both frontend and backend, but backend validation is authoritative.

General rules:

- Required fields must be checked.
- String lengths must be limited.
- Dates must be valid and logically ordered.
- Money values must be numeric, non-negative, and stored with two decimal precision.
- IDs must be validated before database access.
- Emails must be normalized and validated.
- Password rules must be enforced when authentication is implemented.
- User-owned records must be checked against the authenticated user.

Travel-specific rules:

- Trip end date cannot be before trip start date.
- Itinerary activities must belong to an existing trip/day.
- Expense amount must be greater than zero.
- Expense category must be one of the allowed budget categories.
- Total category budget should not exceed total trip budget unless explicitly supported.

## 13. Security Practices

Required practices:

- Use environment variables for secrets.
- Never commit passwords, API keys, or database credentials.
- Hash passwords before storing them.
- Use parameterized SQL queries.
- Validate and sanitize all user input.
- Escape output where needed.
- Protect authenticated routes.
- Enforce authorization for user-owned resources.
- Use secure session cookies.
- Configure CORS deliberately, not broadly.
- Add rate limiting for authentication and sensitive endpoints.
- Use security headers in production.
- Do not expose internal errors to clients.
- Keep dependencies updated once backend dependencies are introduced.

## 14. Reusable Components

Frontend reusable components should be created through consistent HTML/CSS patterns.

Current reusable concepts:

- Buttons
- Glass panels
- Feature cards
- Budget bars
- Section headings
- Two-column layouts
- Timeline/activity cards
- Info items

Rules:

- Reusable visual patterns belong in `components.css`.
- Page-only styling belongs in the page stylesheet.
- Component classes must be reusable without relying on parent page ids.
- Avoid duplicating component markup patterns without a clear reason.

Backend reusable components:

- Response helpers
- Error classes
- Validation helpers
- Date and currency utilities
- Authentication middleware
- Authorization middleware
- Database query helpers

## 15. Coding Standards

General:

- Keep code simple, explicit, and readable.
- Prefer small focused files.
- Avoid unrelated refactoring during feature work.
- Add comments only when logic is not self-explanatory.
- Keep formatting consistent.

Frontend:

- Use semantic HTML.
- Use modular CSS.
- Use vanilla JavaScript.
- Do not add frameworks without updating this TDD.
- Preserve accessibility with every UI change.
- Preserve responsiveness with every UI change.

Backend:

- Use Express routers for all API modules.
- Keep controllers thin.
- Keep business logic in services.
- Keep database logic in models.
- Use async/await consistently.
- Use centralized error handling.
- Use environment-based configuration.

Database:

- Use migrations once schema work begins.
- Use seed files for predictable demo data.
- Use foreign keys and indexes intentionally.
- Use `DECIMAL` for money.
- Use `created_at` and `updated_at` consistently.

Documentation:

- Update `docs/` when architecture, APIs, database schema, or standards change.
- Future implementation decisions must not silently contradict this document.

## 16. Change Control

This TDD is the project standard.

Before implementing a feature:

1. Confirm the feature fits this architecture.
2. Add or update documentation if the architecture changes.
3. Implement using the prescribed folder responsibilities.
4. Validate accessibility, security, and maintainability.
5. Keep the UI consistent unless a redesign is explicitly approved.

