# StockSense

**StockSense** is a smart, real-time inventory management system built for speed and precision. It allows warehouse operators and managers to easily track stock, manage deliveries and receipts, view moving history, and orchestrate internal transfers all in one intuitive interface.

##  Features

- **Telemetry Overview (Dashboard)**: High-level analytics and real-time insights into inventory levels.
- **Stock / Catalog**: Manage products, check stock levels across different warehouse locations, and view low/out-of-stock items.
- **Operations**:
  - **Receipts (Incoming)**: Log incoming shipments from vendors.
  - **Delivery Orders (Outgoing)**: Fulfill outbound orders to customers.
  - **Internal Transfers**: Move stock between internal warehouse locations.
  - **Inventory Adjustments**: Make manual count corrections.
- **Move History (Ledger)**: A comprehensive, immutable audit log of all stock movements.
- **Warehouse Config**: Setup locations, categories, and system parameters.
- **Authentication**: JWT-based secure access for various operator roles.

##  Tech Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3)
- **Database**: PostgreSQL (using `psycopg2`)
- **Authentication**: JWT (JSON Web Tokens) with `PyJWT` and `bcrypt`
- **Rate Limiting**: `slowapi`

### Frontend
- **Framework**: [React](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/)
- **Bundler**: [Vite](https://vitejs.dev/)
- **State Management / Data Fetching**: React Query (`@tanstack/react-query`), Axios
- **Form Handling & Validation**: React Hook Form with Zod
- **Icons**: Lucide React

##  Project Structure

```text
odoohackathon/
├── .env.example          # Example environment variables
├── docker-compose.yml    # Docker setup for services (e.g. Postgres)
├── main.py               # FastAPI application entry point
├── requirements.txt      # Python backend dependencies
├── auth/                 # Backend auth logic
├── db/                   # Database connection and seeding scripts
├── routers/              # FastAPI route handlers
├── modules/              # Core business logic modules
└── frontend/             # React (Vite) frontend application
    ├── src/
    │   ├── components/   # Reusable UI components & layouts
    │   ├── pages/        # Route pages (Auth, Dashboard, Products, etc.)
    │   └── assets/       # Static assets (SVGs, images)
    ├── package.json      # Node.js frontend dependencies
    └── vite.config.ts    # Vite configuration
```

##  Quick Start

### 1. Prerequisites
- **Python 3.9+**
- **Node.js 18+**
- **PostgreSQL** database (can be run via Docker)

### 2. Setup the Database
Use the provided `docker-compose.yml` to spin up a PostgreSQL instance, or use your own local Postgres.
```bash
docker-compose up -d
```

### 3. Backend Setup
Create a virtual environment, install the dependencies, and set up your `.env` file based on `.env.example`.
```bash
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

Seed the database with dummy data for testing:
```bash
python db/seed_dummy_data.py
```

Run the backend server:
```bash
uvicorn main:app --reload
# Runs on http://localhost:8000
```

### 4. Frontend Setup
In a new terminal window, navigate to the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

##  Contributing
Contributions are welcome. Please open an issue or submit a pull request with any improvements.
