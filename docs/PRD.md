# StockSense — Product Requirements Document (PRD)

> **Version:** 1.0  
> **Last Updated:** 2026-09-26  
> **Project:** Odoo Hackathon — Inventory Management System  

---

## 1. Problem Statement

Businesses today rely on manual registers, Excel sheets, and disconnected tools to track inventory — leading to stockouts, oversupply, and operational inefficiency. **StockSense** replaces these with a centralized, real-time Inventory Management System (IMS) accessible to all stakeholders.

---

## 2. Objectives

| # | Objective |
|---|-----------|
| 1 | Digitize all stock operations (receipts, deliveries, transfers, adjustments) |
| 2 | Provide real-time stock visibility across all warehouses and locations |
| 3 | Enable role-based access for Inventory Managers and Warehouse Staff |
| 4 | Maintain a full audit trail (Stock Ledger) for every movement |
| 5 | Support offline-capable local operation without cloud dependency |

---

## 3. Target Users

### 3.1 Inventory Manager
- Views KPI dashboard
- Creates and validates receipts, deliveries, and adjustments
- Manages products, categories, and reorder rules
- Configures warehouses and locations

### 3.2 Warehouse Staff
- Performs stock picking and packing for delivery orders
- Executes internal transfers (rack-to-rack, warehouse-to-warehouse)
- Conducts physical stock counts and submits adjustments

---

## 4. Functional Requirements

### 4.1 Authentication & Authorization
| ID | Requirement |
|----|-------------|
| AUTH-01 | Users can register with email, full name, and a strong password |
| AUTH-02 | Users can log in with email + password (JWT-based session) |
| AUTH-03 | OTP sent to registered email for password reset |
| AUTH-04 | Role-based access control: `manager` and `staff` roles |
| AUTH-05 | Input validation on all auth forms (email format, min password length 8, required fields) |
| AUTH-06 | Passwords stored as bcrypt hashes — never in plaintext |
| AUTH-07 | JWT tokens expire after 24 h; refresh token flow supported |

### 4.2 Dashboard
| ID | Requirement |
|----|-------------|
| DASH-01 | KPI cards: Total Products, Low Stock Items, Out-of-Stock, Pending Receipts, Pending Deliveries, Scheduled Transfers |
| DASH-02 | KPIs are fetched live from the backend API — never from static JSON |
| DASH-03 | Filterable activity feed: by document type (Receipt/Delivery/Transfer/Adjustment), status (Draft/Waiting/Ready/Done/Cancelled), warehouse, product category |
| DASH-04 | Dashboard auto-refreshes every 60 seconds or on any stock operation |

### 4.3 Product Management
| ID | Requirement |
|----|-------------|
| PROD-01 | Create, read, update, and soft-delete products |
| PROD-02 | Each product has: Name, SKU/Code (unique), Category, Unit of Measure, Description (optional), reorder threshold |
| PROD-03 | SKU must be unique; API returns a 409 Conflict if duplicate |
| PROD-04 | Product categories are user-defined (CRUD) |
| PROD-05 | Stock availability shown per location/warehouse |
| PROD-06 | Search by name, SKU, or category with debounced input |

### 4.4 Receipts (Incoming Goods)
| ID | Requirement |
|----|-------------|
| REC-01 | Create a receipt with: supplier name, scheduled date, reference number |
| REC-02 | Add one or more product lines (product, expected qty, received qty, UoM) |
| REC-03 | Validate receipt → stock quantity at destination location increases atomically |
| REC-04 | Partial receipts allowed (received qty < expected qty creates a backorder) |
| REC-05 | Status flow: Draft → Waiting → Ready → Done / Cancelled |
| REC-06 | Each validated receipt writes entries to the Stock Ledger |

### 4.5 Delivery Orders (Outgoing Goods)
| ID | Requirement |
|----|-------------|
| DEL-01 | Create a delivery order with: customer name, destination, scheduled date |
| DEL-02 | Pick → Pack → Validate workflow |
| DEL-03 | Validate delivery → stock decreases atomically at source location |
| DEL-04 | System prevents delivery if available stock < demanded qty (with validation error) |
| DEL-05 | Status flow: Draft → Waiting → Ready → Done / Cancelled |
| DEL-06 | Each validated delivery writes entries to the Stock Ledger |

### 4.6 Internal Transfers
| ID | Requirement |
|----|-------------|
| INT-01 | Move stock between any two locations (warehouse, rack, floor, etc.) |
| INT-02 | Source and destination locations must differ — API enforces this |
| INT-03 | Validate transfer → stock decreases at source and increases at destination atomically |
| INT-04 | Total system-wide stock remains unchanged after a transfer |
| INT-05 | All movements logged in the Stock Ledger |

### 4.7 Stock Adjustments
| ID | Requirement |
|----|-------------|
| ADJ-01 | Select product and location, enter physically counted quantity |
| ADJ-02 | System computes delta (counted − recorded) and updates stock |
| ADJ-03 | Reason/note is required for any adjustment |
| ADJ-04 | Negative adjustments (e.g., damaged goods) are supported |
| ADJ-05 | Adjustment logged in the Stock Ledger with reason |

### 4.8 Move History / Stock Ledger
| ID | Requirement |
|----|-------------|
| LED-01 | Immutable log of every stock movement |
| LED-02 | Searchable and filterable by product, location, date range, operation type |
| LED-03 | Each entry contains: date, operation type, product, qty, source location, destination, reference, performed-by user |

### 4.9 Warehouse & Location Management
| ID | Requirement |
|----|-------------|
| WH-01 | Create and manage multiple warehouses |
| WH-02 | Each warehouse has sub-locations (Input, Quality, Stock, Output, etc.) |
| WH-03 | Locations are hierarchical (Warehouse → Zone → Rack → Bin) |

### 4.10 Alerts & Notifications
| ID | Requirement |
|----|-------------|
| ALERT-01 | In-app alerts when product stock ≤ reorder threshold |
| ALERT-02 | Low-stock items highlighted on dashboard KPI and product list |

---

## 5. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-01 | **Performance:** API responses < 300 ms for typical reads (indexed queries) |
| NFR-02 | **Local-first:** App must run fully offline on a local machine (no cloud dependency) |
| NFR-03 | **Security:** All passwords hashed (bcrypt), JWTs signed with a secret key, no sensitive data in localStorage |
| NFR-04 | **Validation:** All user inputs validated on both frontend (real-time) and backend (server-side) |
| NFR-05 | **Responsive UI:** Works on desktop (1024 px+) and tablet (768 px+); consistent color scheme and layout |
| NFR-06 | **Atomic Transactions:** Stock mutations use database transactions — partial writes are rolled back |
| NFR-07 | **Auditability:** Every stock movement is traceable to a user, timestamp, and operation |
| NFR-08 | **Extensibility:** Modular backend so new operation types can be added without reworking core logic |

---

## 6. User Stories

### Authentication
- As a **new user**, I want to register with my email so I can access the system.
- As a **returning user**, I want to log in and be taken directly to my dashboard.
- As a **user who forgot their password**, I want to receive an OTP by email to reset it securely.

### Dashboard
- As an **inventory manager**, I want to see live KPI cards so I can instantly gauge stock health.
- As a **manager**, I want to filter the activity feed by status or warehouse so I can focus on what matters.

### Products
- As a **manager**, I want to create products with SKU and category so I can organise my catalog.
- As a **staff member**, I want to search products by name or SKU so I can quickly find what I need.

### Operations
- As a **manager**, I want to validate a receipt so that stock is updated automatically without manual entry.
- As a **staff member**, I want to create an internal transfer from Rack A to Rack B so the system always reflects actual locations.
- As a **manager**, I want to adjust stock with a reason note so any discrepancy is audited.

### Alerts
- As a **manager**, I want to be alerted when a product falls below its reorder threshold so I can act before a stockout.

---

## 7. Out of Scope (v1)

- Barcode / QR scanning (planned for v2)
- Supplier portal / external integrations
- E-commerce integration
- Mobile native app

---

## 8. Success Metrics

| Metric | Target |
|--------|--------|
| Dashboard KPI load time | < 1 s |
| Stock mutation accuracy | 100% (zero double-writes via atomic transactions) |
| Input validation coverage | 100% of form fields |
| API endpoint test coverage | >= 80% |
