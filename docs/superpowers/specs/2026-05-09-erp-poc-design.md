# ERP Procurement POC — Design Spec
**Date:** 2026-05-09  
**Status:** Approved

---

## Overview

React-based POC for a procurement/sourcing ERP system. Goal is UI mockup + architecture demo for stakeholder validation — no real backend, no auth, no complex business logic. Serves as base architecture for the real system later.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript + Vite |
| Styling | TailwindCSS + shadcn/ui |
| Routing | React Router v6 |
| State | Zustand |
| Tables | TanStack Table v8 |
| Icons | Lucide React |
| Mock data | Static arrays with artificial delay hooks |

---

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Color theme | White + Indigo (light-first) | Jira Cloud/Stripe vibe, clean for daytime demos |
| Dark mode | Supported via Tailwind `dark:` classes | Required but not primary |
| Sidebar | Linear-style, fixed 220px, no collapse | Group labels + icon + text. No collapse = no context loss during long sessions |
| Table density | Compact (~32px rows) | Power-user density, maximum data visible |
| State manager | Zustand | Better for ERP complexity vs Context API |

---

## Modules

4 modules total. No Dashboard.

### 1. Orders
Main module. Full list view with search, filter tabs, compact table, row click → detail drawer. Create order form (mock).

**Order statuses:** `draft` | `pending` | `confirmed` | `in_transit` | `delivered` | `overdue`

### 2. Suppliers
Reference/lookup list only. Simple table: Code + Name. Can be selected in Order form.

### 3. Brands
Reference/lookup list only. Simple table: Code + Name. Can be selected in Order form.

### 4. Supplier Sources
Source channels management. Slightly richer than Suppliers/Brands — tracks channel, country/region, status, onboarding stage.

---

## Data Models

```ts
type Supplier = {
  id: string
  code: string   // e.g. "SUP-001"
  name: string
}

type Brand = {
  id: string
  code: string   // e.g. "BRD-001"
  name: string
}

type Order = {
  id: string           // "PO-2401"
  supplierId: string
  brandId: string
  amount: number
  currency: string     // "USD"
  status: 'draft' | 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'overdue'
  createdAt: string    // ISO date string
  expectedDate: string // ISO date string
  items: OrderItem[]
}

type OrderItem = {
  id: string
  productName: string
  quantity: number
  unitPrice: number
}

type SupplierSource = {
  id: string
  supplierId: string
  channel: 'direct' | 'agent' | 'marketplace' | 'referral'
  country: string
  region: string
  status: 'active' | 'pipeline' | 'inactive'
  onboardingStage?: 'contacted' | 'negotiating' | 'sampling' | 'approved'
}
```

---

## Routing

```
/                    → redirect to /orders
/orders              → OrdersPage (list)
/orders/:id          → OrderDetailPage (or drawer from list)
/suppliers           → SuppliersPage (list)
/brands              → BrandsPage (list)
/sources             → SourcesPage (list)
```

---

## Folder Structure

```
src/
├── app/
│   └── App.tsx
├── routes/
│   └── index.tsx
├── layouts/
│   ├── AppLayout.tsx        # Sidebar + Header shell
│   └── PageLayout.tsx       # Title + breadcrumb + actions wrapper
├── features/
│   ├── orders/
│   │   ├── components/
│   │   │   ├── OrderTable.tsx
│   │   │   ├── OrderDrawer.tsx
│   │   │   ├── OrderForm.tsx
│   │   │   └── OrderStatusBadge.tsx
│   │   ├── hooks/
│   │   │   └── useOrders.ts
│   │   ├── types.ts
│   │   └── OrdersPage.tsx
│   ├── suppliers/
│   │   ├── components/
│   │   │   └── SupplierTable.tsx
│   │   ├── hooks/
│   │   │   └── useSuppliers.ts
│   │   ├── types.ts
│   │   └── SuppliersPage.tsx
│   ├── brands/
│   │   ├── components/
│   │   │   └── BrandTable.tsx
│   │   ├── hooks/
│   │   │   └── useBrands.ts
│   │   ├── types.ts
│   │   └── BrandsPage.tsx
│   └── sources/
│       ├── components/
│       │   ├── SourceTable.tsx
│       │   └── SourceStatusBadge.tsx
│       ├── hooks/
│       │   └── useSources.ts
│       ├── types.ts
│       └── SourcesPage.tsx
├── components/
│   ├── ui/                   # shadcn re-exports (Button, Dialog, Sheet, etc.)
│   ├── shared/
│   │   ├── DataTable.tsx     # TanStack Table wrapper — columns + data + loading
│   │   ├── StatusBadge.tsx   # Color-coded badge component
│   │   ├── PageHeader.tsx    # Title + subtitle + action slot
│   │   ├── EmptyState.tsx    # Empty list state
│   │   └── LoadingSkeleton.tsx
│   └── sidebar/
│       ├── Sidebar.tsx
│       ├── SidebarNav.tsx
│       └── SidebarNavItem.tsx
├── mock/
│   ├── orders.ts
│   ├── suppliers.ts
│   ├── brands.ts
│   └── sources.ts
├── store/
│   ├── uiStore.ts            # theme toggle
│   └── filtersStore.ts       # search/filter state per module
├── hooks/
│   └── useDebounce.ts
├── types/
│   └── common.ts
└── utils/
    ├── formatters.ts         # formatCurrency, formatDate
    └── cn.ts                 # clsx + tailwind-merge helper
```

---

## Layout System

### AppLayout
- Left: Sidebar 220px fixed
  - Logo/brand header
  - Nav groups: **Procurement** (Orders, Suppliers, Brands) · **Sourcing** (Sources)
  - User footer (avatar + name + role)
- Right: flex-col, top Header + page content

### Header (48px)
- Left: Breadcrumb (group → page)
- Center: Global search bar with ⌘K hint
- Right: Notification bell (badge count) + user menu

### PageLayout
Wraps each page content with consistent padding and a `PageHeader` slot.

---

## Shared Components

### DataTable
TanStack Table v8 wrapper. Accepts `columns` (ColumnDef[]), `data`, `isLoading`. Renders compact rows, column headers with sort indicators, pagination footer. Skeleton rows when loading.

### StatusBadge
Pill badge. Variant drives color: `success` (green), `warning` (yellow), `danger` (red), `info` (blue), `default` (gray). Used for Order status and Source status.

### PageHeader
`title` + optional `subtitle` + `actions` slot (right-aligned buttons). Consistent across all pages.

### EmptyState
Centered icon + heading + description + optional CTA button. Shown when filtered results = 0.

---

## UX Decisions

1. **Compact table density** — 32px rows, 10px font headers, 11px body. ERP users scan hundreds of rows; vertical density is a feature.
2. **Status tabs above table** — Tab strip (All / Pending / Confirmed / Overdue / ...) for instant status filter without dropdown friction.
3. **Order ID as indigo link** — Clear clickable affordance, opens detail drawer (Sheet) without navigation.
4. **Order detail as Sheet drawer** — Slides in from right, keeps list context visible. No full-page navigation for detail.
5. **Search + filter bar** — Inline search + Filter button (opens filter popover). Debounced at 300ms.
6. **Suppliers/Brands** — Read-only list, no detail page. Only used as lookup in Order form selects.
7. **Sources onboarding stage** — Visual pipeline stages (Contacted → Negotiating → Sampling → Approved) shown as badge progression.

---

## Mock Data Volume

| Entity | Count |
|---|---|
| Suppliers | 20 |
| Brands | 15 |
| Orders | 50 (varied statuses) |
| Sources | 25 |

Hooks simulate 400ms loading delay via `setTimeout` wrapped in a `useMemo`/`useEffect` pattern.

---

## Scalability Path

This POC is designed so that:
- Each `features/` folder maps 1:1 to a backend domain — easy to wire real API calls by replacing mock hooks
- `DataTable` is generic — add columns without touching table logic
- `StatusBadge` variants are config-driven — add new statuses in one place
- Zustand stores are isolated — no global state sprawl
- Route structure matches REST resource paths — `/orders/:id` is ready for real data fetching
