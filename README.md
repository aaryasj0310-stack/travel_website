# Travel Planning & Budget Management System

A production-ready full-stack travel planning and budget management application.

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
- **Security**: Express-session for auth (infrastructure ready), bcrypt (dependencies ready), cors, morgan.

---

## Installation & Local Development

### Prerequisites
- Node.js (v18+ recommended)
- MySQL (v8.0+ recommended for `CHECK` constraints)

### 1. Database Setup
Create the MySQL database and run the schema setup script.

```bash
mysql -u root -p < database/schema.sql
```
*(Optional)* Load demo data:
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

---

## Production Deployment

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
- `/trips` - Trip management CRUD
- `/trips/:tripId/budget` - Budget management CRUD
- `/trips/:tripId/itineraries` - Retrieve itineraries for a trip
- `/budgets` - Budget queries
- `/budgets/categories` - Budget category list
- `/expenses` - Expense tracking CRUD
- `/itineraries` - Itinerary builder CRUD

## Troubleshooting

- **Database Connection Error**: Ensure `DB_HOST`, `DB_PORT`, `DB_USER`, and `DB_PASSWORD` exactly match your provider's credentials. Ensure your cloud database allows external connections if testing locally against a remote DB.
- **CORS Errors**: If running decoupled, ensure the backend's `CORS_ORIGIN` exactly matches the URL where the frontend is hosted (without a trailing slash).
- **Session Cookies Not Saving**: If deployed behind a reverse proxy (Render/Railway), `app.set('trust proxy', 1)` is required (this is already configured for production). Ensure your backend is accessed via HTTPS.
