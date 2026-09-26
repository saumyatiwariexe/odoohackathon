# StockSense — Frontend Design Guide

> **Version:** 1.0  
> **Last Updated:** 2026-09-26  
> **Framework:** React 18 + Vite | **Styling:** Vanilla CSS (CSS custom properties)

---

## 1. Tech Stack

| Concern | Choice | Rationale |
|---------|--------|-----------|
| Framework | React 18 + Vite | Fast HMR, no build-server overhead |
| Styling | Vanilla CSS (CSS variables) | Full control, no TailwindCSS bloat, works offline |
| State Management | React Query (TanStack Query) | Live server-state, auto-refresh, no static JSON |
| Routing | React Router v6 | Nested routes for sidebar layout |
| HTTP Client | Axios with interceptors | Central auth header + 401 redirect handling |
| Forms | React Hook Form + Zod | Type-safe, real-time field validation |
| Charts | Recharts | Lightweight, composable, works offline |
| Icons | Lucide React | Modern, consistent icon set |
| Notifications | React Hot Toast | Non-blocking toast alerts |
| Date Picker | React Day Picker | Local, no CDN dependency |

---

## 2. Design System

### 2.1 Color Palette (CSS Custom Properties)

```css
:root {
  /* Brand */
  --color-primary:        #4F6AF5;   /* Indigo — main actions */
  --color-primary-dark:   #3A52D4;
  --color-primary-light:  #EEF1FE;

  /* Semantic */
  --color-success:        #22C55E;
  --color-warning:        #F59E0B;
  --color-danger:         #EF4444;
  --color-info:           #0EA5E9;

  /* Neutrals (dark-mode ready) */
  --color-bg:             #0F1117;   /* page background */
  --color-surface:        #1A1D27;   /* cards, sidebar */
  --color-surface-raised: #252836;   /* modals, dropdowns */
  --color-border:         #2E3147;
  --color-text-primary:   #F1F3F9;
  --color-text-secondary: #8B8FA8;
  --color-text-muted:     #555870;

  /* Status badges */
  --color-draft:      #6B7280;
  --color-waiting:    #F59E0B;
  --color-ready:      #0EA5E9;
  --color-done:       #22C55E;
  --color-cancelled:  #EF4444;
}
```

### 2.2 Typography

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
/* Fallback if offline: */
font-family: 'Inter', system-ui, -apple-system, sans-serif;

--font-size-xs:   0.75rem;   /* 12px */
--font-size-sm:   0.875rem;  /* 14px */
--font-size-base: 1rem;      /* 16px */
--font-size-lg:   1.125rem;  /* 18px */
--font-size-xl:   1.25rem;   /* 20px */
--font-size-2xl:  1.5rem;    /* 24px */
--font-size-3xl:  1.875rem;  /* 30px */
```

### 2.3 Spacing Scale

```css
--space-1:  0.25rem;   /* 4px */
--space-2:  0.5rem;    /* 8px */
--space-3:  0.75rem;   /* 12px */
--space-4:  1rem;      /* 16px */
--space-5:  1.25rem;   /* 20px */
--space-6:  1.5rem;    /* 24px */
--space-8:  2rem;      /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
```

### 2.4 Border Radius & Shadows

```css
--radius-sm:  4px;
--radius-md:  8px;
--radius-lg:  12px;
--radius-xl:  16px;
--radius-full: 9999px;

--shadow-sm:  0 1px 3px rgba(0,0,0,0.4);
--shadow-md:  0 4px 12px rgba(0,0,0,0.5);
--shadow-lg:  0 8px 24px rgba(0,0,0,0.6);
```

---

## 3. Layout Architecture

```
App
├── AuthLayout (public — no sidebar)
│   ├── /login
│   ├── /register
│   └── /forgot-password
│       └── /reset-password
│
└── AppLayout (protected — with sidebar)
    ├── Sidebar (fixed left, 240px)
    │   ├── Logo + app name
    │   ├── Nav links (Dashboard, Products, Operations...)
    │   └── Profile menu (bottom)
    ├── TopBar (sticky, 64px)
    │   ├── Page title / breadcrumb
    │   ├── Search (global SKU search)
    │   └── Notification bell + user avatar
    └── MainContent (scrollable)
        ├── /dashboard
        ├── /products
        │   ├── /products/new
        │   └── /products/:id/edit
        ├── /operations/receipts
        │   ├── /operations/receipts/new
        │   └── /operations/receipts/:id
        ├── /operations/deliveries
        ├── /operations/transfers
        ├── /operations/adjustments
        ├── /move-history
        └── /settings/warehouses
```

---

## 4. Navigation Specification

### 4.1 Sidebar Links

```
📊  Dashboard
📦  Products
    ├── All Products
    ├── Categories
    └── Reordering Rules
🔄  Operations
    ├── Receipts
    ├── Deliveries
    ├── Internal Transfers
    └── Adjustments
📋  Move History
⚙️  Settings
    └── Warehouses & Locations
```

- Active link is highlighted with `--color-primary` left border + light background.
- Sidebar collapses to icon-only on tablets (768–1024 px).
- On mobile (< 768 px): sidebar becomes a bottom sheet drawer.

### 4.2 Profile Menu (Sidebar Bottom)

- Shows avatar initials + full name + role badge
- Options: My Profile, Change Password, Logout
- Clicking Logout calls `POST /api/auth/logout` before clearing local state

---

## 5. Input Validation (Frontend)

Every form uses **React Hook Form + Zod** for schema-based real-time validation.

### General Rules

| Behaviour | Specification |
|-----------|--------------|
| Trigger | Validate on **blur** per field; full form on **submit** |
| Display | Inline error message below input, colour `--color-danger` |
| Success state | Green border on valid field after blur |
| Submit button | Disabled while form is invalid or submitting |
| Loading state | Button shows spinner + "Saving…" text during API call |
| Server errors | Displayed as a banner alert at the top of the form |

### Example — Product Form Zod Schema

```ts
const productSchema = z.object({
  name:              z.string().min(2, "Name must be at least 2 characters").max(255),
  sku:               z.string().min(1, "SKU is required").max(100).regex(/^[A-Z0-9\-_]+$/, "SKU: uppercase letters, digits, hyphens only"),
  category_id:       z.string().uuid("Select a category"),
  uom_id:            z.string().uuid("Select a unit of measure"),
  description:       z.string().max(1000).optional(),
  reorder_threshold: z.number({ invalid_type_error: "Must be a number" }).min(0),
});
```

### Example — Login Form Zod Schema

```ts
const loginSchema = z.object({
  email:    z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
```

### Quantity Fields

- Accept only non-negative numbers
- Show red border + error if typed value is negative
- Decimal allowed up to 3 places (matching DB `NUMERIC(12,3)`)

---

## 6. Dynamic Data Fetching (React Query)

**No static JSON is used for real data.** All data comes from the backend API.

```ts
// Example: Dashboard KPIs auto-refresh every 60 seconds
const { data: kpis, isLoading } = useQuery({
  queryKey: ['dashboard-kpis'],
  queryFn: () => api.get('/dashboard/kpis').then(r => r.data),
  refetchInterval: 60_000,          // live refresh
  staleTime: 30_000,
});

// Example: Products list with search/filter params
const { data: products } = useQuery({
  queryKey: ['products', { search, categoryId, page }],
  queryFn: () => api.get('/products', { params: { search, categoryId, page } }).then(r => r.data),
  keepPreviousData: true,           // smooth pagination
});
```

Mutations invalidate relevant query caches immediately:

```ts
const validateReceipt = useMutation({
  mutationFn: (id) => api.post(`/operations/receipts/${id}/validate`),
  onSuccess: () => {
    queryClient.invalidateQueries(['dashboard-kpis']);
    queryClient.invalidateQueries(['receipts']);
    toast.success('Receipt validated — stock updated.');
  },
  onError: (err) => {
    toast.error(err.response?.data?.message ?? 'Validation failed.');
  },
});
```

---

## 7. Page Specifications

### 7.1 Dashboard

| Element | Detail |
|---------|--------|
| KPI Cards (6) | Total Products, Low Stock, Out of Stock, Pending Receipts, Pending Deliveries, Scheduled Transfers |
| Low stock card | Red accent if any items; links to filtered product list |
| Activity Feed | Paginated list of recent operations; filterable by type, status, warehouse, category |
| Filter bar | Dropdowns with chips for applied filters; "Clear all" button |
| Auto-refresh | Badge pulses on refresh; last-updated timestamp shown |

### 7.2 Products List

- Search bar (debounced 300 ms) — searches name and SKU
- Filters: Category dropdown, Stock status (In Stock / Low / Out)
- Table columns: SKU | Name | Category | UoM | On Hand | Status | Actions
- Inline low-stock badge (yellow) and out-of-stock badge (red)
- "New Product" button (Manager only)

### 7.3 Operations List (Receipts / Deliveries / Transfers)

- Status filter chips: All | Draft | Waiting | Ready | Done | Cancelled
- Date range picker for scheduled date
- Table columns: Reference | Partner | Scheduled Date | Status | Actions
- "New" button opens a slide-in form panel

### 7.4 Operation Detail / Validate Page

- Header: reference, status badge, partner, scheduled date
- Lines table: Product | UoM | Expected Qty | Done Qty (editable input)
- "Validate" button (Manager only) — confirms with a modal dialog
- Status timeline at the top of the page

### 7.5 Stock Adjustments

- Product selector (searchable dropdown)
- Location selector
- "Current Stock" displayed dynamically when product + location is chosen
- "Counted Quantity" input
- Delta shown: `+X` (green) or `-X` (red)
- Required reason text area

### 7.6 Move History

- Full-width table: Date | Reference | Type | Product | From | To | Qty | Performed By
- Filters: product search, operation type, date range, location
- Export to CSV button

---

## 8. Responsive Breakpoints

| Breakpoint | Width | Layout Change |
|------------|-------|---------------|
| Desktop | ≥ 1024 px | Full sidebar (240 px) + main content |
| Tablet | 768–1023 px | Collapsed sidebar (icons only, 64 px) |
| Mobile | < 768 px | Hidden sidebar; bottom navigation bar |

---

## 9. Micro-Animations & UX Polish

- KPI card numbers count up on load (0 → value, 600 ms ease-out)
- Status badges fade in when status changes
- Sidebar nav items have 150 ms ease hover transitions
- Table rows have a subtle hover background shift
- Skeleton loaders (not spinners) for table/card loading states
- Toast notifications slide in from top-right, auto-dismiss in 4 s
- Form submit button has a 200 ms scale-down press effect
- Error shake animation on failed form submission

---

## 10. Accessibility

- All interactive elements have unique, descriptive `id` attributes
- ARIA labels on icon-only buttons
- Keyboard navigable: tab order follows visual order
- Color is never the only indicator (badges use icon + text, not just color)
- Focus ring visible on all focusable elements
- Minimum contrast ratio: 4.5:1 for body text (WCAG AA)

---

## 11. Project File Structure

```
src/
├── api/
│   ├── axios.ts          # Axios instance with interceptors
│   ├── auth.ts
│   ├── products.ts
│   ├── operations.ts
│   └── dashboard.ts
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── TopBar.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   ├── KpiCard.tsx
│   │   └── SkeletonLoader.tsx
│   └── forms/
│       ├── ProductForm.tsx
│       ├── OperationForm.tsx
│       └── AdjustmentForm.tsx
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── ForgotPasswordPage.tsx
│   ├── DashboardPage.tsx
│   ├── ProductsPage.tsx
│   ├── operations/
│   │   ├── ReceiptsPage.tsx
│   │   ├── DeliveriesPage.tsx
│   │   ├── TransfersPage.tsx
│   │   └── AdjustmentsPage.tsx
│   ├── MoveHistoryPage.tsx
│   └── settings/
│       └── WarehousesPage.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useDebounce.ts
├── stores/
│   └── authStore.ts       # Zustand for auth user state
├── schemas/
│   ├── productSchema.ts
│   ├── operationSchema.ts
│   └── authSchema.ts
├── styles/
│   ├── index.css          # Design tokens, resets, base styles
│   ├── components.css     # Reusable component classes
│   └── pages.css          # Page-specific styles
└── main.tsx
```

---

## 12. Environment Variables

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

No API keys or cloud tokens are required — the app runs fully locally.
