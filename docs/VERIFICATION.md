# Voyage verification — 2026-10-01

## Result

The application was run against the configured MySQL database and exercised in Chromium through the browser-testing connector. Earlier MySQL and browser availability problems were resolved on the resumed session. They are not outstanding blockers.

No new npm dependency, framework, image asset, PDF, database schema migration, or source-file extension was introduced. Browser screenshots were inspected in memory, not saved as repository image files. Tool-generated console/snapshot artifacts were removed.

## Automated checks actually run

| Command / check | Outcome |
|---|---|
| `npm test` | 8 tests passed, exit 0 |
| `node --check` over backend, frontend/js and tests | 59 JavaScript files passed |
| `node tests/live-mysql.js` | Passed against configured MySQL; two uniquely named test accounts and all their data cleaned up |
| `git diff --check` | Passed; no whitespace errors |
| `git diff --stat` and source diff review | Completed; changes are limited to the requested product, authentication, finance, tests and documentation |
| Extension comparison against `git ls-tree HEAD` | New files use only `.js`, `.html`, `.sql`, `.md`, all present before the task |

`npm test` covers session-required API routes; exact decimal arithmetic; trip ownership; journey calculations before/during/after travel; profile loading; frontend labels, IDs, local assets and tokens; and page script initialization with populated, empty and failed data. The HTTP regression uses real Express middleware/controllers/services with explicit model substitutes. It is complemented by the separate live MySQL test, not presented as a substitute for it.

The live test exercises registration, current-user lookup, password hashing, session cookies, trip create/read/update/delete, budget create/read/update/delete, itinerary create/read/update/delete, expense create/read/update/delete, exact `0.10 + 0.20 = 0.30` totals, negative balances, dashboard calculations, profile changes, password changes, logout, subsequent login and cross-user read/write/delete rejection. Client-supplied owners cannot transfer or expose resources. Setup/cleanup queries remain in a test model. No seed reset was executed.

## Browser verification actually performed

| Area | Outcome |
|---|---|
| Public landing, registration and login | Loaded and rendered correctly; registration and login succeeded against MySQL |
| Empty dashboard / trip library | Correct first-journey guidance and create action |
| Trip creation and editing | Created Jaipur journey, edited destination, opened contextual overview |
| Trip context | Same `tripId` preserved across Overview / Itinerary / Budget / Expenses |
| Budget | Created six category allocations; updated total from ₹24,000 to ₹25,000; correct largest category |
| Itinerary | Created and edited a timed activity; empty days and today's tab displayed; deletion succeeded |
| Expenses | Created ₹850 expense; category remaining became ₹3,150; edited to ₹950 and balance became ₹23,050 on the ₹24,000 plan |
| Expense filtering | An unused category showed its intentional empty state; clearing filter restored the expense |
| Deletion | Expense deletion restored balance; activity, budget and trip deletion completed with confirmation; final library empty |
| Profile | Saved name successfully; controls now wait for the account request before accepting edits |
| Logout / protected page | Logout redirected to login; direct dashboard URL redirected with its return URL preserved |
| Loading and error | Delayed dashboard response showed loading; simulated 503 produced an accessible error; reload recovered after removing the simulation |
| Console | Final page check: zero errors and zero warnings; no application JavaScript exceptions observed |

Earlier browser-console entries were the expected 404 for an absent budget and an absent favicon. The budget page now uses dashboard budget presence before fetching the resource, and favicon requests return 204 without adding an image. A deliberately simulated 503 was used to verify error handling, then removed.

Two additional temporary browser QA accounts were removed after their checks. No QA journey or test account is left intentionally in the database.

## Responsive, visual and accessibility checks

- Tested all nine pages (`index`, `login`, `register`, `trips`, `dashboard`, `itinerary`, `budget`, `expenses`, `profile`) at **360, 390, 768, 1024 and 1440 px**: 45 page/width checks, no horizontal overflow with the tested data.
- Inspected actual desktop landing/expense renders and the mobile itinerary render. The CSS landscapes are deliberate fallback artwork; no photographic assets are needed to render them.
- Tested the maximum supported budget display at 360 px. This exposed overflow, which was fixed with wrapping and retested successfully.
- Desktop Menu button visibility was corrected; mobile menu opens with Enter and closes with Escape.
- Verified the skip link is the first keyboard stop, native-dialog focus enters the dialog, and Escape closes it.
- Emulated reduced motion: hero animation computes to `none`, document scrolling computes to `auto`.
- Source checks verify one H1 per page, associated form labels, unique IDs, and valid local resource paths. Written near/over-budget messages supplement progress-bar colour.
- INR formatting was checked in rendered balances and feedback, including Indian digit grouping and two decimal places.

This is browser viewport emulation and targeted keyboard testing, not a physical-device or full screen-reader certification. Full WCAG conformance has not been claimed.

## Known limits and deliberate scope

- Express MemoryStore and the authentication limiter are single-process. Restarting the server logs users out. Durable sessions and distributed throttling are required before multi-instance production hosting.
- Password changes regenerate the current session; they do not invalidate sessions already open on other devices. No email recovery, verification or OAuth was added.
- The configured remote MySQL connection showed variable latency. Loading states handle it, but hosting/database proximity still affects responsiveness.
- Calendar calculations use Asia/Kolkata and inclusive days. Remaining/day and recorded/day are simple arithmetic, not forecasts; recorded/day includes advance expenses.
- Itinerary displays 14 days at a time for long trips. If dates are shortened, outside-date activities remain visible for correction rather than being silently deleted.
- Custom photographs are pending the user's later asset work. Five ready-to-use briefs and integration points are in `VISUAL_ASSET_BRIEF.md`.
- Monetary API fields now return exact decimal strings; external consumers expecting numbers must adapt. Resource URLs and JSON envelopes are preserved.
- Serve frontend and backend on the same origin for the supported local demonstration. Static-only hosting cannot run the authenticated product.

## Repeat the checks

1. Configure the existing `.env` and MySQL installation. On an existing database, use only `database/categories.sql` if categories are missing; do not run the destructive schema or demo seed.
2. Run `npm test`.
3. Run `node tests/live-mysql.js` to exercise the real database with uniquely named temporary accounts.
4. Run `npm run dev`, open `http://localhost:3000`, register, then create a journey and repeat the browser matrix above.

The live test is intentionally separate from `npm test` because it writes temporary data to the configured database.


## Changed-file manifest

### Frontend

- `frontend/budget.html`
- `frontend/css/animations.css`
- `frontend/css/base.css`
- `frontend/css/budget.css`
- `frontend/css/components.css`
- `frontend/css/expenses.css`
- `frontend/css/itinerary.css`
- `frontend/css/landing.css`
- `frontend/css/layout.css`
- `frontend/css/responsive.css`
- `frontend/css/trips.css`
- `frontend/css/variables.css`
- `frontend/dashboard.html`
- `frontend/expenses.html`
- `frontend/index.html`
- `frontend/itinerary.html`
- `frontend/js/animations.js` (removed)
- `frontend/js/auth.js`
- `frontend/js/budget.js`
- `frontend/js/dashboard.js`
- `frontend/js/expenses.js`
- `frontend/js/itinerary.js`
- `frontend/js/landing.js`
- `frontend/js/navbar.js` (removed)
- `frontend/js/profile.js`
- `frontend/js/scroll.js` (removed)
- `frontend/js/trips.js`
- `frontend/js/voyage.js`
- `frontend/login.html`
- `frontend/profile.html`
- `frontend/register.html`
- `frontend/trips.html`

### Backend

- `backend/app.js`
- `backend/config/database.js`
- `backend/controllers/auth.controller.js`
- `backend/controllers/budget.controller.js`
- `backend/controllers/dashboard.controller.js`
- `backend/controllers/expense.controller.js`
- `backend/controllers/itinerary.controller.js`
- `backend/controllers/trip.controller.js`
- `backend/middleware/auth.middleware.js`
- `backend/middleware/error-handler.middleware.js`
- `backend/models/budget.model.js`
- `backend/models/expense.model.js`
- `backend/models/itinerary.model.js`
- `backend/models/user.model.js`
- `backend/routes/auth.routes.js`
- `backend/routes/dashboard.routes.js`
- `backend/services/auth.service.js`
- `backend/services/budget.service.js`
- `backend/services/expense.service.js`
- `backend/services/itinerary.service.js`
- `backend/services/journey.service.js`
- `backend/services/ownership.service.js`
- `backend/services/trip.service.js`
- `backend/utils/constants.js`
- `backend/utils/date-time.js`
- `backend/utils/money.js`

### Database

- `database/categories.sql`

### Documentation

- `README.md`
- `docs/PRODUCT_AUDIT.md`
- `docs/TECHNICAL_DESIGN_DOCUMENT.md`
- `docs/VERIFICATION.md`
- `docs/VISUAL_ASSET_BRIEF.md`

### Tests

- `tests/api.test.js`
- `tests/frontend.test.js`
- `tests/integration.test.js`
- `tests/journey.test.js`
- `tests/live-mysql.js`
- `tests/live.model.js`
- `tests/money.test.js`
- `tests/ownership.test.js`
- `tests/profile.test.js`

### Project configuration

- `package.json`
