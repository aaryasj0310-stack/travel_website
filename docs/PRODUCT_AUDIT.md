# Voyage product audit and implementation decisions

## Baseline

Inspected AGENTS.md, README, the TDD and PRD, all frontend HTML/CSS/JS, backend routes/controllers/services/models/utilities, schema and seed. Graph: D-website-project-Travel-website, generation 2026-09-30T14:49:28Z, Tier 2. SQL and landing HTML have recorded parser gaps; direct source was read. Documentation is excluded from indexing and was read directly. The working tree was clean.

| Area | Existing implementation | Gap / decision |
|---|---|---|
| Architecture | Express route → controller → service → model; MySQL; static vanilla pages | Preserve layers, URL structure and JSON envelope |
| Trips | Full CRUD, validation, cascading relationships | Replace demo user with session ownership; destination-first library |
| Itinerary | Activities create their containing day; edit/delete; date validation | Chronological order before sequence; show empty calendar days and today |
| Budget | Six normalized categories, transactional allocations, SQL spending sums | Exact decimal handling; clear allocated/unallocated/remaining; warnings |
| Expenses | CRUD, category filters, newest-first, summaries | Remove total-budget spending block; actual spending must remain recordable |
| Authentication / profile | Users table, bcrypt/session installed | Registration, login/logout, current user, profile/password and ownership missing |
| Dashboard | Marketing mockup only | Real selected-trip cockpit using existing data |
| Navigation | Inconsistent nav markup; repeated selectors | One shell, Overview / Itinerary / Budget / Expenses with tripId |
| Repeated code | Four copies of request, escaping and formatting helpers | Small browser utility namespace, no bundler |
| Accessibility | Some labels, skip links and live regions | Mobile nav hidden without alternative; novalidate; keyboard-inert budget cards; inconsistent focus/live errors |
| Responsive | Some grids collapse | Budget shell lacks width constraint; forms precede content; large amounts and nav need verification |
| Static UI | Fake login/dashboard links, obsolete sample dates, placeholder footer links | Real auth and operational home; marketing examples explicitly labelled |
| Derived information | Trip dates, travelers, allocations, expenses, activities available | Countdown, duration, per-person/day, category health, calendar progress, next activity, unplanned days |

## Scope and decisions

- College-scale, single-process Node server with local MySQL; no new dependencies or frontend framework.
- Keep normalized implemented schema (the TDD takes precedence over the PRD's older fixed-column sketch).
- Existing sessions use MemoryStore: suitable for local demonstration, not durable multi-process hosting. Document this explicitly.
- Use INR decimal strings at API boundaries, integer paise arithmetic in services, MySQL DECIMAL storage.
- Authenticated user identity comes only from the session. Check the owning trip for all nested resources.
- Date status and calendar metrics use Asia/Kolkata. Calendar-day metrics include today; they are not financial forecasts.
- Normal HTML navigation preserves tripId. No SPA, cloud identity, AI, travel API, chart library, generated image or new file extension.
- Calendar days are derived from the trip's date range; adding an activity persists its day using the existing model. No redundant day-management workflow is needed for empty days.
- Implement auth before binding the redesigned operational views so private data never relies on frontend filtering.

## PRD mapping

FR-1–5 (auth/profile), FR-12 (dashboard), FR-14 (ownership) are missing at baseline. FR-6–11 have working CRUD foundations. FR-13 is partial: server validation exists, but ownership, decimal precision and time ordering require reinforcement. See VERIFICATION.md for actual final test outcomes and remaining limitations.
