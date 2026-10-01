# Quick Start Guide

Follow these simple steps to run the Voyage website on your machine.

---

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher)
- A web browser (Chrome, Edge, Firefox, Safari)

---

### 1. Install Dependencies
Open a terminal in the project folder and run:
```bash
npm install
```

---

### 2. Environment Configuration
- If you received the project with a pre-configured `.env` file, **no changes are needed**—it connects directly to the cloud Railway MySQL database.
- If you need to use a local MySQL database, copy `.env.example` to `.env` and update your MySQL username/password:
  ```bash
  cp .env.example .env
  ```

---

### 3. Start the Website

You can start the server in any of these ways:

#### Option A: Terminal (Recommended)
```bash
npm start
```
*(For development with auto-reload, you can run `npm run dev`)*

#### Option B: VS Code (1-Click)
Open the project in **VS Code** and press **F5** (or click **Run & Debug** > **Launch Voyage Server**).

---

### 4. Open in Your Browser
Visit:
```
http://localhost:3000
```

- Click **Start planning ↗** or go to `http://localhost:3000/register.html` to create an account.
- Once registered, you can create trips (try typing **Goa**, **Jaipur**, or **Munnar** for destination photography, or any other city like **Delhi**), add itinerary schedules, set budgets, and record expenses.

---

### Optional: Run Automated Tests
To verify all 8 test suites:
```bash
npm test
```
