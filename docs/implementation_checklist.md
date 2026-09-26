# StockSense — Implementation Checklist & Evaluation Criteria Alignment

> **Version:** 1.0  
> **Last Updated:** 2026-09-26  
> **Reference:** Hackathon Evaluation Criteria

---

## Evaluation Criteria Checklist

### ✅ 1. Real-time / Dynamic Data Sources

| Requirement | How We Fulfill It |
|-------------|------------------|
| No static JSON for live data | All KPIs, product lists, operation feeds fetched from `/api/*` endpoints |
| Dashboard auto-refreshes | React Query `refetchInterval: 60_000` — live every 60 s |
| Stock quants updated atomically | PostgreSQL transactions update `stock_quants` on every operation validation |
| Move history is live | Queries `stock_ledger` table in real time |

**Where to implement:**
- `src/api/dashboard.ts` → `GET /api/dashboard/kpis`
- `src/pages/DashboardPage.tsx` → `useQuery` with `refetchInterval`
- Backend `/api/dashboard/kpis` → runs 6 SQL queries against live DB (see `database.md §5`)

---

### ✅ 2. Responsive & Clean UI

| Requirement | How We Fulfill It |
|-------------|------------------|
| Consistent color scheme | Single source of truth: CSS custom properties in `src/styles/index.css` |
| Consistent layout | `AppLayout.tsx` wraps all protected pages; Sidebar + TopBar always present |
| Responsive | 3 breakpoints: Desktop (≥1024px), Tablet (768–1023px), Mobile (<768px) |
| No mismatched spacing | Spacing scale via `--space-*` tokens only |

**Reference:** `frontend.md §2` (Design System) and `frontend.md §8` (Breakpoints)

---

### ✅ 3. Robust Input Validation

| Requirement | How We Fulfill It |
|-------------|------------------|
| Frontend validation | React Hook Form + Zod schemas per form |
| Real-time inline errors | Validated on blur (per field) + on submit (full form) |
| Backend validation | Express-validator / Pydantic on every API endpoint |
| Prevent bad data | SKU uniqueness → 409 from API; negative stock → blocked by DB CHECK + API |
| Auth validation | Email regex, password strength, OTP format — all validated front + back |

**Reference:** `Auth.md §6`, `frontend.md §5`, `PRD.md §4`

---

### ✅ 4. Intuitive Navigation

| Requirement | How We Fulfill It |
|-------------|------------------|
| Clear menu structure | Left sidebar with grouped sections (Products / Operations / Move History / Settings) |
| Proper spacing | 48px per nav item, 24px section gaps, 16px icon-label gap |
| Active state | Primary color left-border + light background on active route |
| Profile menu | Fixed at sidebar bottom with avatar, name, role |
| Breadcrumbs | TopBar shows current section > page path |

**Reference:** `frontend.md §4`

---

### ✅ 5. Git / Version Control (Team Discipline)

**Current State:** Only one person managing the repo — this must change.

**Required Actions:**
1. **Branch per feature:** Every team member works on a named branch
   ```
   git checkout -b feature/auth-api       # backend auth endpoints
   git checkout -b feature/products-ui    # product management pages
   git checkout -b feature/receipts       # receipt operations
   git checkout -b feature/dashboard      # dashboard KPIs
   ```
2. **Pull Requests:** No direct pushes to `main`. All merges via PR + peer review.
3. **Commit conventions:**
   ```
   feat(auth): add OTP password reset endpoint
   fix(products): validate SKU uniqueness before insert
   docs(database): add stock_quants schema
   test(api): add receipt validation unit tests
   ```
4. **Assign ownership by module:**
   - Member A → Backend API (auth, products, operations)
   - Member B → Frontend (UI components, pages, React Query hooks)
   - Member C → Database schema, migrations, seed data
   - Member D → Testing, CI, documentation

**Branch protection rules:**
- `main` branch: require PR review from ≥ 1 team member
- Run lint + tests before merge

---

### ✅ 6. Backend APIs & Data Modelling

**Backend Stack:** Node.js (Express) or Python (FastAPI) — local, no cloud

**API Modules:**
```
/api/auth/          → register, login, logout, forgot-password, reset-password, refresh
/api/products/      → CRUD + stock availability per location
/api/categories/    → CRUD
/api/warehouses/    → CRUD
/api/locations/     → CRUD (hierarchical)
/api/operations/    → receipts, deliveries, transfers, adjustments (CRUD + validate)
/api/ledger/        → read-only, filterable move history
/api/dashboard/     → live KPI aggregates
```

**Data models:** Fully defined in `database.md` with PostgreSQL DDL, indexes, and constraints.

**Reference:** `database.md`, `Auth.md §4`

---

### ✅ 7. Understand Code Before Using It

**Rules for the team:**
- Every AI-generated snippet must be reviewed and adapted to our schema, naming conventions, and error handling patterns before committing.
- No copy-paste of generic CRUD boilerplate — adapt it to use our `UUID` PKs, `stock_quants` logic, and atomic transactions.
- All database queries must use parameterised statements (never string interpolation).
- React Query hooks must match our API response shapes — not generic tutorials.

**Code review checklist (per PR):**
- [ ] Does this code reference our actual table/column names?
- [ ] Are all inputs validated server-side?
- [ ] Does any stock mutation use a transaction?
- [ ] Are error responses consistent with our API error format?

---

### ✅ 8. Offline / Local Solutions

| Concern | Solution |
|---------|----------|
| Database | PostgreSQL running locally via Docker; no cloud DB |
| Email / OTP | Mailhog local SMTP server (Docker); no SendGrid/Mailgun needed |
| Frontend | Vite dev server runs locally; no Vercel/Netlify dependency |
| Assets | Inter font self-hosted as fallback (`system-ui`) if no internet |
| No API keys required | No cloud service credentials needed to run the app |

**Setup:** Single `docker-compose.yml` starts PostgreSQL + Mailhog.

---

### ✅ 9. Trendy Technologies — Only Where They Add Value

| Technology | Used? | Why |
|-----------|-------|-----|
| React 18 + Vite | ✅ | Fast dev experience, HMR, real-world standard |
| React Query | ✅ | Solves live-data caching without manual `useEffect` + `fetch` |
| React Hook Form + Zod | ✅ | Type-safe validation, eliminates custom validation boilerplate |
| PostgreSQL | ✅ | ACID transactions critical for stock accuracy |
| JWT | ✅ | Stateless auth, no session store needed |
| Docker Compose | ✅ | Reproducible local setup for entire team |
| Recharts | ✅ | Lightweight, no D3 learning curve, works offline |
| Tailwind CSS | ❌ | Not needed — vanilla CSS with tokens is sufficient and faster to iterate |
| GraphQL | ❌ | Overkill for this CRUD-heavy app; REST is simpler and faster |
| Redis | ❌ | Not needed at this scale; PostgreSQL queries are fast enough |
| WebSockets | ❌ | React Query polling is sufficient; real-time sockets add unnecessary complexity |

---

## Summary — What Each Doc Covers

| File | Contents |
|------|----------|
| [`StockSense.md`](./StockSense.md) | Problem statement, features, navigation, flow |
| [`PRD.md`](./PRD.md) | Functional requirements, user stories, success metrics |
| [`Auth.md`](./Auth.md) | Auth API contracts, DB schema, RBAC matrix, security checklist |
| [`database.md`](./database.md) | Full PostgreSQL DDL, transactions, KPI queries, seed data |
| [`frontend.md`](./frontend.md) | Design system, layout, validation, React Query patterns, file structure |
| **This file** | Evaluation criteria alignment, Git discipline, team ownership |

---

## Quick Start (Full Local Setup)

```bash
# 1. Clone and branch
git clone <repo-url>
git checkout -b feature/your-module

# 2. Start local services
docker-compose up -d    # starts PostgreSQL + Mailhog

# 3. Run DB migrations
npm run db:migrate
npm run db:seed

# 4. Start backend
cd backend && npm run dev   # http://localhost:3000

# 5. Start frontend
cd frontend && npm run dev  # http://localhost:5173

# 6. View test emails (OTP)
open http://localhost:8025  # Mailhog UI
```

---

## docker-compose.yml (Reference)

```yaml
version: '3.9'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: stocksense
      POSTGRES_USER: stocksense
      POSTGRES_PASSWORD: localpass
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  mailhog:
    image: mailhog/mailhog
    ports:
      - "1025:1025"   # SMTP
      - "8025:8025"   # Web UI

volumes:
  pgdata:
```
