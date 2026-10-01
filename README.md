# Travel Planning & Budget Management System

A trip-centered full-stack travel planning and budget management application for a college project. See `docs/VERIFICATION.md` for verified checks and outstanding environment limitations.

## Project Overview

Voyage helps users plan trips, manage day-by-day itineraries, track expenses, and ensure they stay within their defined category budgets.

### Features
- **Trip Management**: Create, edit, and track the status of upcoming, ongoing, and past trips.
- **Budgeting**: Set total trip budgets and allocate funds across categories (Transport, Lodging, Food, etc.).
- **Expense Tracking**: Log expenses against specific budgets and categories.
- **Itinerary Builder**: Plan activities with dates, times, locations, and descriptions.
- **Real-time Summaries**: Visual budget bars and summary statistics indicate remaining budget and overspending.

### Technology Stack
- **Frontend**: Vanilla HTML5, CSS3 (variables, flexbox/grid), and JavaScript (ES6+).
- **Backend**: Node.js, Express.js.
- **Database**: MySQL 8.0+ (using `mysql2` with promises).
- **Security**: bcrypt passwords, authenticated sessions, CSRF tokens, ownership checks, authentication throttling, and basic security headers.

### The product flow

Register → Dashboard → My Trips → Open Trip → Overview / Itinerary / Budget / Expenses.
`tripId` in the URL keeps the same journey selected across views. The dashboard contains real trip, planning and financial data. Profile editing and password changes are available from Account. Amounts are consistently INR.

---

## Installation & Local Development

### Prerequisites
- Node.js (v18+ recommended)
- MySQL (v8.0+ recommended for `CHECK` constraints)

### 1. Database Setup
Create the MySQL database and run the schema setup script.

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/categories.sql
```
**Fresh databases only:** `schema.sql` rebuilds tables. For an existing installation, run only the non-destructive `categories.sql` if categories are missing. No schema migration is required for this upgrade.

*(Optional, destructive)* Load demo data only into a disposable database:
```bash
mysql -u root -p < database/seed.sql
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Copy the `.env.example` file to a new file named `.env` in the project root:
```bash
cp .env.example .env
```
Update the `.env` file with your local MySQL credentials.

### 4. Run the Server
Start the development server with live-reloading:
```bash
npm run dev
```

Access the application in your browser at `http://localhost:3000`.

Create a new account at `/register.html`; there is no hard-coded demo-user identity. Existing seed records remain private to their original accounts.

### Tests

```bash
npm test
```

Uses Node's built-in test runner and no added dependencies. HTTP tests exercise real middleware/controllers/services with explicit in-memory model substitutes. Frontend unit checks validate source structure and script initialization with a minimal DOM substitute. The separate `node tests/live-mysql.js` command exercises the configured MySQL database with temporary accounts and cleans them up. Real browser and database checks were also performed; see `docs/VERIFICATION.md` for outcomes and repeatable steps.

### Visual assets

The site ships polished CSS landscapes, without image files or runtime image services. `docs/VISUAL_ASSET_BRIEF.md` contains five detailed photography prompts, crop guidance and the exact CSS token integration points.

---

## Production Deployment

The current session store and authentication limiter are in process and designed for a single-server local demonstration. Sessions are lost on restart; multiple replicas are unsupported. Add a durable session store and deployment-specific security review before public production use. The preferred supported setup is Express serving the frontend and API from the same origin. Static-only GitHub Pages cannot run the authenticated application. A separately hosted frontend must proxy `/api/v1` to the backend under the frontend origin so cookies and CSRF checks remain effective.

This application can be deployed as a monolith (backend serving frontend) or in a decoupled architecture (frontend hosted separately).

### Recommended Architecture: Monolith on Render or Railway

Since the frontend and backend are tightly coupled in this repository, deploying both together as a monolithic Node.js app is the easiest approach.

#### Backend & Frontend (Render / Railway)
1. Push this repository to GitHub.
2. In Render/Railway, create a new **Web Service**.
3. Connect your GitHub repository.
4. Set the build command to `npm install`.
5. Set the start command to `npm start`.
6. Add all required **Environment Variables** (see below).

#### Database (Railway MySQL / Aiven)
1. Create a MySQL database instance.
2. Retrieve the host, port, username, password, and database name.
3. Add these credentials to your Web Service's environment variables.
4. Connect to your production database using a tool like DBeaver or MySQL Workbench and run `database/schema.sql`.

### Alternative: Decoupled Architecture (Netlify / Vercel)

If you prefer to host the frontend on a CDN:
1. Deploy the backend to Render/Railway as described above.
2. Deploy the `frontend/` folder to Netlify or Vercel.
3. Update the `CORS_ORIGIN` on your backend to match your Vercel/Netlify URL.
4. **Proxy Setup**:
   - For **Vercel**: The `frontend/vercel.json` file is already configured. Just update the destination URL inside it to point to your backend.
   - For **Netlify**: The `frontend/_redirects` file is already configured. Update the URL inside it to point to your backend.

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `NODE_ENV` | Environment mode (`development`, `production`). | `production` |
| `PORT` | Port the server runs on. Cloud providers often set this automatically. | `3000` |
| `DB_HOST` | MySQL database host. | `mysql.railway.internal` |
| `DB_PORT` | MySQL database port. | `3306` |
| `DB_USER` | MySQL database user. | `admin` |
| `DB_PASSWORD` | MySQL database password. | `super_secret_pass` |
| `DB_NAME` | MySQL database name. | `travel_planner` |
| `SESSION_SECRET` | Secret key for signing session cookies. | `a_long_random_string` |
| `SESSION_NAME` | Name of the session cookie. | `voyage_sid` |
| `SESSION_MAX_AGE_MS` | Session expiry in milliseconds. | `86400000` |
| `CORS_ORIGIN` | Allowed origin for frontend requests. | `https://voyage-app.vercel.app` |

---

## Folder Structure

```text
.
├── frontend/         # Browser-facing HTML, CSS, JS
│   ├── css/
│   ├── js/
│   ├── _redirects    # Netlify proxy config
│   └── vercel.json   # Vercel proxy config
├── backend/          # Node.js Express server
│   ├── config/       # Environment & DB config
│   ├── controllers/  # Request handlers
│   ├── routes/       # API route definitions
│   ├── models/       # MySQL queries
│   ├── middleware/   # Express middleware
│   ├── services/     # Business logic
│   ├── utils/        # Shared helpers
│   └── server.js     # Entry point
├── database/         # MySQL schema and seeds
├── docs/             # Technical specifications
└── public/           # Shared static assets
```

## API Overview

Base URL: `/api/v1`

- `GET /health` - Server health check
- `GET /auth/csrf` - Obtain a session CSRF token before registration/login
- `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`
- `GET /auth/me`, `PUT /auth/profile`, `PUT /auth/password`
- `GET /dashboard?tripId=...` - Owned journey overview and deterministic financial/planning metrics
- `/trips` - Trip management CRUD
- `/trips/:tripId/budget` - Budget management CRUD
- `/trips/:tripId/itineraries` - Retrieve itineraries for a trip
- `/budgets` - Budget queries
- `/budgets/categories` - Budget category list
- `/expenses` - Expense tracking CRUD
- `/itineraries` - Itinerary builder CRUD

All resource endpoints require a session. Mutations require `X-CSRF-Token`; login/register/password change return a new token after session regeneration. Client-supplied `userId` is ignored. The `{ success, message, data }` / `{ success, message, errors }` envelope is unchanged. Monetary response fields now use exact decimal strings instead of floating-point numbers; clients should format them with INR and perform arithmetic in paise. Recording an expense over allocation or total budget is allowed and shown as an explicit negative balance.

## Troubleshooting

- **Database Connection Error**: Ensure `DB_HOST`, `DB_PORT`, `DB_USER`, and `DB_PASSWORD` exactly match your provider's credentials. Ensure your cloud database allows external connections if testing locally against a remote DB.
- **CORS Errors**: If running decoupled, ensure the backend's `CORS_ORIGIN` exactly matches the URL where the frontend is hosted (without a trailing slash).
- **Session Cookies Not Saving**: If deployed behind a reverse proxy (Render/Railway), `app.set('trust proxy', 1)` is required (this is already configured for production). Ensure your backend is accessed via HTTPS.
