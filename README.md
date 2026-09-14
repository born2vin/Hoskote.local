# Supra Enclave Community Hub

A residential community platform for a small housing enclave — residents share ideas, report safety
alerts, lend/borrow items, log maintenance issues, and (for admins) track shared income/expenses,
all behind proper authentication with role-based access control.

**Live**: backend at `https://supra-enclave-community-hub.onrender.com` (API docs at `/docs`),
frontend at `https://supra-enclave-community.onrender.com`.

## Features

- **Ideas Hub** — propose, browse, and vote on community improvement ideas. Admins approve/reject.
- **Safety Alerts** — report incidents with location and severity; authors resolve their own alerts.
- **Marketplace** — lend and borrow items with other residents, with per-day pricing and duration limits.
- **Issues** — report maintenance problems (electricity, water supply, gardening, etc.); admins update status.
- **Budgeting** (Admin / Delegated Admin only) — track community income and expenses in one unified ledger.
- **Profile** — view/update your name, phone, address; villa number is shown (set at registration).
- **Auth** — register, login, forgot/reset password (emailed time-limited link), all JWT-based.
- **Internationalization** — English, Kannada (ಕನ್ನಡ), and Telugu (తెలుగు); see
  [INTERNATIONALIZATION_GUIDE.md](INTERNATIONALIZATION_GUIDE.md) for how translations are organized and
  which pages are fully covered.
- **Light/dark theme** — auto-follows system preference, with a manual toggle.

## Tech Stack

**Backend**: FastAPI, SQLAlchemy 1.4 (ORM), Pydantic v2 (validation), `python-jose` (JWT), `bcrypt`
(password hashing), SQLite for local dev / PostgreSQL in production (`psycopg2-binary`), `smtplib` for
transactional email.

**Frontend**: React 18, Material UI v5, React Router v7, React Query (server state), React Hook Form
(forms + validation), `react-i18next` (translations).

## Project Structure

```
.
├── backend/
│   ├── main.py                    # FastAPI app, CORS, router registration
│   ├── requirements.txt
│   └── app/
│       ├── database.py            # SQLAlchemy engine/session (reads DATABASE_URL)
│       ├── models.py               # ORM models (User, Idea, Alert, MarketplaceItem, Issue,
│       │                           #   BudgetTransaction, PasswordResetToken, ...)
│       ├── schemas.py              # Pydantic request/response schemas
│       ├── auth.py                 # JWT creation/verification, password hashing, role checks
│       ├── email_utils.py          # Password reset email template + SMTP dispatch
│       └── routers/                # One file per feature area, mounted under /api/<name>
│           ├── auth.py             # register, login, login-json, forgot/reset-password, check-villa
│           ├── users.py            # profile read/update, user listing
│           ├── ideas.py
│           ├── alerts.py
│           ├── marketplace.py
│           ├── issues.py
│           └── budgeting.py
├── frontend/
│   └── src/
│       ├── App.js                  # Route table
│       ├── components/             # Navbar, LanguageSelector, AuthLayout, PageHeader
│       ├── contexts/AuthContext.js # Login/logout, token storage, current user
│       ├── pages/                  # One component per route
│       ├── services/api.js         # Axios instance + grouped API call helpers
│       ├── theme/theme.js          # MUI theme (light/dark tokens)
│       └── i18n/                   # i18next config + locale JSON files
├── start_dev.sh / start_dev.ps1     # One-command local dev startup (macOS/Linux and Windows)
└── INTERNATIONALIZATION_GUIDE.md
```

Two backend router files (`expenses.py`, `maintenance.py`) and two frontend pages
(`Expenses.js`, `MaintenancePayments.js`) still exist on disk but are **not wired into the app** —
they predate the unified Budgeting feature and are dead code kept only because they couldn't be
deleted in this environment. Don't extend them; they reference a DB relationship
(`Expense.participants`) that no longer exists and will crash if re-registered.

## User Roles & Permissions

The `role` column is a plain string with no DB-level enum — checks are exact, **case-sensitive**
string comparisons in both the backend and frontend. Only these three values mean anything to the code:

| Role | Granted by | Access |
|---|---|---|
| `Resident` | Default for every self-registration | Standard access: Ideas, Alerts, Marketplace, Issues, own Profile |
| `Admin` | Direct DB update only (no in-app UI for this) | Everything a Resident has, plus: create/update/delete Budgeting transactions, approve/reject Ideas, update Issue status |
| `Delegated Admin` | Direct DB update only | Identical permissions to `Admin` — the two are treated as fully equivalent everywhere in the code |

To promote a user, connect to the database (see **Database access** below) and run:
```sql
UPDATE users SET role = 'Admin' WHERE username = 'someuser';
```
Any other string (including different casing like `admin`) is accepted by the column but grants no
special access — it behaves identically to `Resident`.

## Getting Started (Local Development)

### Prerequisites
- Python 3.11 (the pinned `sqlalchemy==1.4.49` has known friction on 3.12+)
- Node.js 18+
- npm

### Quick start
```bash
# macOS/Linux
./start_dev.sh

# Windows (PowerShell)
.\start_dev.ps1
```
Both scripts create the backend venv if missing, install dependencies, start the FastAPI server on
port 8000, install frontend dependencies, and start the React dev server on port 3000. They also set
a **local-only placeholder** `SECRET_KEY` if you haven't set your own, since the backend refuses to
start without one (see **Security Notes**).

### Manual setup
```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
export SECRET_KEY="some-local-dev-value"   # Windows: $env:SECRET_KEY = "..."
python main.py                  # http://localhost:8000, docs at /docs

# Frontend (separate terminal)
cd frontend
npm install
npm start                       # http://localhost:3000
```

Local dev uses a SQLite file (`backend/community_app.db`) by default — no database setup needed.

## Environment Variables

### Backend

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `SECRET_KEY` | **Yes** | none — app refuses to start without it | Signs JWT access tokens |
| `DATABASE_URL` | No | `sqlite:///./community_app.db` | SQLAlchemy connection string; set to a `postgresql://...` URL in production |
| `CORS_ORIGINS` | No | `http://localhost:3000` | Comma-separated list of allowed frontend origins |
| `FRONTEND_URL` | No | `http://localhost:3000` | Used to build the link inside password reset emails |
| `SMTP_HOST` | No | none — logs the reset link instead of emailing | SMTP relay host for password reset emails |
| `SMTP_PORT` | No | `587` | SMTP port (use an alternate port like `2525` on hosts that block 25/465/587, e.g. Render) |
| `SMTP_USERNAME` | No | none | SMTP auth username |
| `SMTP_PASSWORD` | No | none | SMTP auth password/API key |
| `SMTP_FROM_EMAIL` | No | falls back to `SMTP_USERNAME` | Must be a sender/domain verified with your SMTP provider |
| `SMTP_FROM_NAME` | No | `Supra Enclave Community Hub` | Display name on outgoing email |

### Frontend

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `REACT_APP_API_URL` | No | `http://localhost:8000` | Backend base URL — must be set at **build time** (CRA bakes it into the static bundle) |

## API Reference

All routes except registration, login, forgot-password, reset-password, and check-villa require a
`Bearer` JWT (`Authorization: Bearer <token>`), obtained from `/api/auth/login-json`.

**Auth** (`/api/auth`)
- `POST /register` — create an account (role always defaults to `Resident`, regardless of what's sent)
- `POST /login` — OAuth2 form-encoded login, returns a JWT
- `POST /login-json` — same, but JSON body `{username, password}`
- `GET /check-villa/{villa_number}` — `{"exists": bool}`, used during registration
- `POST /forgot-password` — `{email}`, always returns the same generic message (no account enumeration)
- `POST /reset-password` — `{token, new_password}`; token is single-use and expires after 15 minutes

**Users** (`/api/users`)
- `GET /me`, `PUT /me` (full_name, phone, address only — **not** role or villa_number)
- `GET /`, `GET /{id}`

**Ideas** (`/api/ideas`) — CRUD + `POST /{id}/vote?vote_type=up|down` + `PATCH /{id}/status` (Admin only)

**Alerts** (`/api/alerts`) — CRUD + `GET /active` + `POST /{id}/resolve` (author only)

**Marketplace** (`/api/marketplace`) — CRUD + `GET /my-items`, `GET /borrowed`, `POST /{id}/borrow`,
`POST /{id}/return`

**Issues** (`/api/issues`) — `GET /`, `POST /`, `PATCH /{id}/status` (Admin only)

**Budgeting** (`/api/budgeting`, Admin only for writes) — `GET /` (any authenticated user can read),
`POST /`, `PUT /{id}`, `DELETE /{id}`

Full interactive documentation (request/response schemas, try-it-out) is auto-generated by FastAPI at
`/docs` on any running backend instance.

## Security Notes

- Passwords are hashed with `bcrypt`; JWTs are signed with `HS256` using `SECRET_KEY`, verified with an
  explicit algorithm allowlist (prevents algorithm-confusion attacks).
- Password reset tokens are generated with `secrets.token_urlsafe(32)`; only their **SHA-256 hash** is
  stored, expire after 15 minutes, are single-use, and requesting a new one invalidates any earlier
  unused token for that account. `/forgot-password` always returns an identical response whether or
  not the email is registered.
- `PUT /api/users/me` only accepts `full_name`, `phone`, `address` — it used to also accept `role`,
  which let any authenticated user grant themselves Admin in one request. That's fixed; there is
  currently **no API endpoint at all** for changing a user's role — it's DB-only (see **User Roles**).
- There is **no rate limiting** on any endpoint, including login and forgot-password. Fine for a small
  known community, but a real risk if this is ever exposed more broadly — consider adding `slowapi` or
  similar before that happens.
- Registration's password minimum (6 characters) is weaker than Reset Password's (8 characters, letter
  + number required). Worth aligning if you revisit either.

## Deployment

Currently deployed on **Render**: the backend as a Web Service (`uvicorn main:app --host 0.0.0.0 --port
$PORT`, Python 3.11, Postgres via `DATABASE_URL`), the frontend as a Render Static Site (`npm run
build`, publish directory `build`, root directory `frontend`). Both are connected to this GitHub repo
for auto-deploy on push to `main`.

To redeploy manually or set up a fresh environment, set the backend environment variables above in the
Render dashboard, and `REACT_APP_API_URL` on the Static Site (rebuild required if it changes, since
it's baked in at build time). `CORS_ORIGINS` on the backend must include the frontend's exact origin
(no trailing slash) or every API call from the browser will fail with a CORS error.

## Known Limitations

- No Alembic migrations — schema changes apply via `Base.metadata.create_all()`, which creates missing
  tables but never alters existing ones. A real schema change on a live database needs a manual `ALTER
  TABLE` or introducing Alembic properly.
- No rate limiting anywhere (see **Security Notes**).
- No admin-only endpoint to change a user's role — direct DB access only.
- `expenses.py`/`maintenance.py` (backend) and `Expenses.js`/`MaintenancePayments.js` (frontend) are
  dead code left on disk (see **Project Structure**).
- Several pages (Ideas, Alerts, Marketplace, Issues, Budgeting, Profile) are only partially translated —
  see [INTERNATIONALIZATION_GUIDE.md](INTERNATIONALIZATION_GUIDE.md) for the current coverage status.

## License

MIT.
