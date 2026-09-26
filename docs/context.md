# StockSense — Hackathon Context & Technical Brief

**Prompt to ChatGPT / LLM:** 
> "I am participating in a hackathon where I built an Inventory Management System called StockSense. Below is the technical context, architecture, and challenges of my codebase. Please read this context. I will then ask you potential questions the judges might ask me, and I want you to help me answer them clearly and technically."

---

## 1. Project Overview
**StockSense** is a centralized, real-time, local-first Inventory Management System (IMS). It replaces manual registers and Excel sheets. It allows Inventory Managers and Warehouse Staff to digitize stock operations, maintain an immutable audit trail, and view live KPIs.

### Tech Stack
* **Backend:** Python + FastAPI (REST API, Pydantic for validation, `psycopg2` for DB connections).
* **Database:** PostgreSQL (Running locally via Docker Compose).
* **Frontend:** React 18, Vite, TypeScript, React Query (TanStack Query), React Hook Form + Zod, Vanilla CSS (CSS Variables for styling).
* **Auth:** Stateless JWT (JSON Web Tokens) with bcrypt password hashing.

---

## 2. Core Architectural Decisions

### Why PostgreSQL instead of NoSQL (MongoDB/Firebase)?
* **ACID Transactions:** Inventory management requires absolute mathematical accuracy. If a receipt is validated, the system must update the `stock_moves` status, increment the `stock_quants` (current stock on hand), and insert an immutable record into the `stock_ledger` at the exact same time. If any of these fail, the entire transaction must roll back. PostgreSQL's relational schema and transactional locks (`FOR UPDATE`) made this possible and safe.

### The "Core Engine" (How stock moves)
Instead of manually editing product quantities, stock is moved via **Operations** (Receipts, Deliveries, Transfers). 
When an operation is `validated`:
1. The backend locks the `stock_moves` row.
2. It loops through `stock_move_lines` to get the quantities.
3. It does an `UPSERT` (Insert on Conflict Update) into `stock_quants` to add stock to the destination location and subtract it from the source location.
4. It inserts two records into `stock_ledger` (one for the source, one for the destination) recording the `quantity_delta` and `balance_after`.
5. The move is marked as `done`.

### Why React Query instead of WebSockets?
* To achieve "Real-time" dashboard KPIs without the overhead and complexity of maintaining WebSocket connections, we used **React Query**. We set a `refetchInterval: 60000` (polling every 60 seconds) and we actively invalidate caches (`queryClient.invalidateQueries`) immediately after a user performs a stock operation. This gives a real-time feel with much simpler REST architecture.

### Local-First & Offline Capable
* The system is designed to run in a warehouse without internet access. Everything runs via a `docker-compose.yml` file (PostgreSQL DB + Mailhog for local SMTP). The frontend and backend run locally. No cloud dependencies like Vercel, Firebase, or AWS are required.

---

## 3. Major Challenges Faced & Overcome

### Challenge 1: The "Negative Stock" Constraint Problem
* **The Issue:** We added a PostgreSQL `CHECK (on_hand_qty >= 0)` constraint to the `stock_quants` table to prevent inventory from ever going below zero. However, when receiving goods from a "Vendor", the vendor's stock technically goes into the negative (because we took stock from them). The database threw a constraint violation.
* **The Solution:** We implemented a location `usage` column (`internal`, `vendor`, `customer`, `loss`). In our FastAPI `operations.py` router, we wrote logic to *only* update `stock_quants` if the location usage is `internal`. Virtual locations (vendors/customers) don't hold physical stock, so they only get an entry in the `stock_ledger`, cleanly bypassing the constraint while keeping our warehouse math perfectly safe.

### Challenge 2: Migrating Auth from Local JSON to PostgreSQL
* **The Issue:** Initially, authentication was built using local flat JSON files (`users.json`), which was insecure and not scalable for the hackathon criteria.
* **The Solution:** We migrated the `login.py` and `signup.py` logic to use PostgreSQL. We introduced `bcrypt` hashing for passwords, generated a secure JWT secret via `.env`, and refactored the routes to use FastAPI's `HTTPException` instead of returning raw dictionaries.

### Challenge 3: Generating Sequential Reference Numbers
* **The Issue:** Warehouse documents need clean, human-readable IDs (like `IN-00001` for incoming receipts), rather than ugly UUIDs.
* **The Solution:** We utilized PostgreSQL `SEQUENCE`s (`CREATE SEQUENCE seq_move_receipt`). In FastAPI, we query `nextval('seq_move_receipt')`, pad it with zeros using `.zfill(5)`, and prepend the prefix (`IN-`) to guarantee unique, incrementing references without race conditions.

### Challenge 4: Styling without TailwindCSS
* **The Issue:** We wanted a premium, highly customized dark-mode UI, but didn't want the bloat or learning curve of Tailwind.
* **The Solution:** We built our own mini design system using Vanilla CSS Custom Properties (CSS variables) in `index.css`. We defined semantic tokens (`--color-primary`, `--space-4`, `--surface-container`) which made building forms and the layout incredibly fast and consistent.

---

## 4. Key API Endpoints
* `/api/auth/register` & `/api/auth/login`: Issues JWTs.
* `/api/dashboard/kpis`: Runs a complex `WITH ProductStock AS (...)` CTE query to aggregate total products, low stock, and pending operations in one fast DB call.
* `/api/operations/{id}/validate`: The core transaction endpoint that handles the warehouse math.
* `/api/ledger`: Returns the immutable audit history.
