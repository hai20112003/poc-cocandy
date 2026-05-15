# Procurement Module Design (Phase 1 & 2)

**Date:** 2026-05-15  
**Status:** Approved  
**Phase 1 Target:** Core workflow (Suppliers, PR, PO, GRN)  
**Phase 2 Target:** Advanced features (Ratings, Contracts, Evaluations)

---

## Overview

Complete implementation of Cocandy ERP's Procurement Module with full business logic support, built from:
- Design file `erp-full-v4_1.html` (11 screens, UI/UX)
- Detailed requirements document (business workflows, entities, rules)

**Phase 1 (MVP - Core Workflow):** 
- Suppliers (CRUD + multi-contacts + product catalog)
- Purchase Request (creation + approval workflow + multi-level authorization)
- Purchase Order (from PR + status tracking + PO amendments)
- Goods Receipt (full/partial receipt + QC + returns handling)

**Phase 2 (Enhanced Features):** 
- Supplier ratings & quarterly evaluations (4 criteria + weighted scoring)
- Supplier contracts (framework agreements + price history + renewals)
- Invoice & Payment tracking (công nợ NCC + reconciliation)

---

## Architecture

### Folder Structure (Feature-Based)

```
src/features/
├── suppliers/
│   ├── pages/
│   │   ├── SupplierList.tsx
│   │   ├── SupplierDetail.tsx
│   │   └── SupplierForm.tsx
│   ├── components/
│   │   ├── ProductCatalog.tsx
│   │   ├── ContactsTable.tsx
│   │   └── POHistory.tsx
│   ├── hooks/
│   │   ├── useSuppliers.ts
│   │   └── useSupplierForm.ts
│   ├── types.ts
│   └── mockData.ts
│
├── purchaseRequest/
│   ├── pages/
│   │   ├── PRList.tsx
│   │   └── PRForm.tsx
│   ├── components/
│   │   ├── ItemSelector.tsx
│   │   └── ApprovalTimeline.tsx
│   ├── hooks/
│   │   ├── usePurchaseRequests.ts
│   │   └── usePRForm.ts
│   ├── types.ts
│   └── mockData.ts
│
├── purchaseOrder/
│   ├── pages/
│   │   ├── POList.tsx
│   │   └── PODetail.tsx
│   ├── components/
│   │   └── POTimeline.tsx
│   ├── hooks/
│   │   ├── usePurchaseOrders.ts
│   │   └── usePOForm.ts
│   ├── types.ts
│   └── mockData.ts
│
├── goodsReceipt/
│   ├── pages/
│   │   ├── GRNList.tsx
│   │   ├── GRNForm.tsx
│   │   └── PartialGRN.tsx
│   ├── components/
│   │   ├── ReceiptTable.tsx
│   │   └── QCStatus.tsx
│   ├── hooks/
│   │   ├── useGoodsReceipts.ts
│   │   └── useGRNForm.ts
│   ├── types.ts
│   └── mockData.ts
│
└── shared/
    └── (existing DataTable, modals, utilities)
```

### RTK State Structure

**Slices:**
- `suppliersSlice.ts` - Supplier CRUD, filters, search
- `purchaseRequestsSlice.ts` - PR CRUD, approval workflow
- `purchaseOrdersSlice.ts` - PO CRUD, timeline tracking
- `goodsReceiptsSlice.ts` - GRN CRUD, QC status, partial receipt tracking

**State shape:**
```typescript
{
  suppliers: {
    items: ISupplier[]
    selected: ISupplier | null
    filters: { status, type, search, sortBy }
    loading: boolean
  }
  purchaseRequests: {
    items: IPR[]
    selected: IPR | null
    filters: { status, department, dateRange }
    loading: boolean
  }
  // ... similar for PO and GRN
}
```

---

## Phase 1 Modules

### 1. Suppliers (NCC)

**SupplierList:**
- Responsive table with 9 columns: Mã NCC | Tên | Loại | Lead time | Điều khoản TT | Tổng PO | Rating | Status | Actions
- Status filters: Tất cả / Active / Inactive / Blacklist
- Search by name, code, contact
- Sort by: Rating ↓, Name A-Z, Newest, Most POs
- Type filter: All / Manufacturer / Trader / Individual
- Stats cards: Active count | Suspended | Blacklisted | With contracts
- Buttons: Export, Configure rating, + Add Supplier
- Pagination: 10 items/page

**SupplierDetail:**
- Header with avatar, name, status badge, action buttons (View, Edit, Rating, Contract)
- Sub-tabs: Basic info | Product catalog (8) | PO history (24) | Evaluation (4 quarters) | Contracts (2) | Internal notes
- KPI cards (Phase 1): Total PO | Cumulative value | Average lead time | Overall rating
- Cards:
  - Basic info: Company name, tax ID, type, address, lead time, payment terms, currency
  - Contacts: Table with add button, columns: Name | Title | Phone | Email | Role
  - Product catalog: Table with add button, columns: Product | Unit | Unit price | MOQ | Lead time | Notes
  - Recent PO history: Link to PO detail, columns: PO code | Date | Total | Status | On-time?
- Right sidebar (Phase 1): Empty placeholder for ratings & contracts (added Phase 2)

**SupplierForm:**
- Fields: Company name (required) | Tax ID | Supplier type (dropdown) | Address (textarea) | Phone | Email
- Lead time (number, days) | Payment terms (NET 15/30/60, COD, Prepaid) | Currency
- Status (Active / Suspended / Blacklisted)
- Validation: Required fields, tax ID format, lead time >= 1
- Actions: Save | Cancel
- Modal-based or inline form (reuse existing modal pattern)

**Actions:**
- Add/Edit contact: Modal with name, title, phone, email, role, primary contact checkbox
- Add/Edit product: Modal with product, unit, unit price, MOQ, lead time, notes
- Bulk status change: Select multiple → change status

**Business Rules:**
- Each supplier can have multiple contacts (primary, accounting, logistics)
- Primary contact auto-selected for communication
- Multiple products/categories per supplier (danh mục hàng)
- Lead time can differ per product (override from supplier average)
- Status transitions: Active ↔ Suspended, Active → Blacklisted (one-way)
- Blacklist reason must be recorded (hàng giả, giao trễ liên tục, etc.)
- Rating auto-calculated from quarterly evaluations (Phase 2)

**Data types:**
```typescript
interface IContact {
  id: string
  name: string
  title: string
  phone: string
  email: string
  role: 'Primary' | 'Accounting' | 'Logistics' | 'Other'
  isPrimary: boolean
}

interface IProduct {
  id: string
  name: string
  unit: string
  unitPrice: number
  moq: number
  leadTime: number
  notes: string
}

interface ISupplier {
  id: string
  code: string
  name: string
  taxId: string
  type: 'Manufacturer' | 'Trader' | 'Individual'
  address: string
  phone: string
  email: string
  leadTime: number // days (average)
  paymentTerms: 'NET 15' | 'NET 30' | 'NET 60' | 'COD' | 'Prepaid'
  currency: string
  status: 'Active' | 'Suspended' | 'Blacklisted'
  blacklistReason?: string
  rating: number // 0-5 (from evaluations, Phase 2)
  contacts: IContact[]
  products: IProduct[]
  createdAt: Date
  updatedAt: Date
}
```

---

### 2. Purchase Request (PR)

**PRList:**
- Table columns: Mã PR | Department | Requester | Amount | Status | Created | Actions
- Filters: All | Draft | Submitted | Approved | Rejected | Converted to PO
- Search by PR number, requester name, department
- Stats cards: 12 Pending approval | 8 Approved | 4 Rejected
- Buttons: Export, + Create PR
- Pending approvals sidebar (right, width 280px)
- Approval items show: PR code | department | amount | priority badge

**PRForm:**
- Section 1: Department (dropdown) | Requester (auto-filled) | Date | Priority (Low/Medium/High/Urgent)
- Section 2: Items table
  - Product (searchable dropdown - loads from all supplier catalogs)
  - Quantity | Unit (auto from product)
  - Unit price | Total (calculated)
  - Notes | Remove row
  - + Add row button
- Section 3: Totals (Subtotal | Tax | Grand total - right aligned)
- Section 4: Approver field (suggest based on department)
- Buttons: Save as Draft | Submit for Approval | Cancel

**PRDetail (View/Approve):**
- Header: PR code | Department | Status badge | Created date | Requester
- If pending approval:
  - Show Approve button (green) + Reject button (red)
  - Reject opens modal for reason
- Items table: Product | Quantity | Unit price | Total
- Totals section
- Timeline (visual): Submitted → Approval in progress → Approved/Rejected
- Actions: Convert to PO (if approved) | Edit (if draft) | Delete (if draft)

**Status Workflow:**
```
Draft ──Submit──> Submitted ──Approve──> Approved ──Convert──> PO created
                       ↑
                    Reject (→ Draft + reason)
```

**Approval Authorization Levels (based on total PR value):**
| PR Value | Approver |
|----------|----------|
| < 5M | Department Manager |
| 5M – 50M | Department Head |
| > 50M | Director |

**Business Rules:**
- `needed_by_date` is critical for PO deadline calculation (PO must be sent before this date)
- PR can be converted to multiple POs (split across suppliers)
- Multiple PRs can be combined into one PO (consolidate for volume discount)
- If rejected, reason must explain issues (budget, timing, specs) for requester to adjust
- Rejection can suggest alternative suppliers or timing

**Data types:**
```typescript
interface IPR {
  id: string
  code: string
  department: string
  requester: string
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Converted'
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  items: IPRItem[]
  subtotal: number
  tax: number
  total: number
  approver: string
  rejectionReason?: string
  createdAt: Date
  updatedAt: Date
  convertedToPOId?: string
}

interface IPRItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unit: string
  unitPrice: number
  total: number
  notes: string
}
```

---

### 3. Purchase Order (PO)

**POList:**
- Table columns: Mã PO | Supplier | Date | Amount | Status | On-time? | Actions
- Filters: All | Draft | Sent | Confirmed | Receiving | Completed | Cancelled
- Stats cards: 28 Active | 8 Awaiting confirmation | 5 Receiving today
- Buttons: Export, + Create PO (or only from approved PR)

**POForm (Create from PR):**
- Pre-filled from approved PR: Supplier, items, quantities
- Can edit: Quantities (increase/decrease) | Delivery date | Notes
- Buttons: Save as Draft | Send to Supplier | Cancel
- Status flow: Draft → Sent (triggers supplier confirmation step)

**PODetail:**
- Header: PO code | Supplier name + avatar | Status badge | Expected delivery date
- Sub-tabs: Overview | Items | Timeline | GRN history
- Overview:
  - Info grid (2 columns): PO number | Supplier | Created date | Expected delivery | Payment terms | Currency
  - Items table: Product | Unit | Qty | Unit price | Total | Lead time
  - Totals: Subtotal | Total | Currency
- Timeline tab:
  - Visual timeline with steps: Draft → Sent → Confirmed → Receiving → Completed
  - Each step shows date & time when status changed
- GRN history tab:
  - Table of linked GRNs: GRN code | Date | Items received | QC status | Actions
- Actions (right buttons): Send to supplier | Mark confirmed | Create GRN | Cancel order

**Data types:**
```typescript
interface IPO {
  id: string
  code: string
  supplierId: string
  supplierName: string
  status: 'Draft' | 'Sent' | 'Confirmed' | 'Receiving' | 'Completed' | 'Cancelled'
  items: IPOItem[]
  subtotal: number
  total: number
  currency: string
  paymentTerms: string
  expectedDeliveryDate: Date
  createdAt: Date
  sentAt?: Date
  confirmedAt?: Date
  completedAt?: Date
  relatedPRId?: string
}

interface IPOItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unit: string
  unitPrice: number
  total: number
}
```

---

### 4. Goods Receipt Note (GRN)

**GRNList:**
- Table columns: Mã GRN | PO | Supplier | Date | Status | QC Status | Actions
- Filters: All | Full receipt | Partial | QC Pass | QC Failed | QC Pending
- Stats cards: 5 GRN today | 2 QC pending | 1 Quality issue
- Buttons: Export, + Create GRN

**GRNForm (Create from PO):**
- Step 1: Select PO (dropdown or search)
- Step 2: Items received table
  - For each PO item: Product | Expected qty | Received qty (input) | Unit
  - Quality status (dropdown): Pass | Fail | Pending QC
  - Notes (batch/serial/damage/expiry)
  - Variance shows: Expected - Received
- Step 3: Receiving date & time picker
- Step 4: Partial receipt checkbox (if any qty < expected, check this)
- Buttons: Save as Draft | Submit GRN | Cancel
- Validation: Received qty <= Expected qty for each item

**GRNDetail:**
- Header: GRN code | From PO code | Supplier name | Receiving date | Status badge
- Items received table: Product | Expected | Received | Variance | QC Status | Notes
- QC Status indicator: Pass (green) | Fail (red) | Pending (yellow)
- Timeline visual:
  - Received (date/time) ✓
  - QC in progress / QC passed / QC failed
  - Link to invoice (Phase 2)
- Right sidebar: Outstanding items (if partial)
  - "Remaining 40/100 units" with option to create another GRN
- Actions: Edit QC status | Link invoice (Phase 2) | Print receipt | Create follow-up GRN

**Partial GRN:**
- When received qty < expected qty:
  - GRN marked as "Partial"
  - Outstanding qty tracked
  - Button to "Create follow-up GRN" for remaining items
- Example: PO 100 units
  - GRN 1: 60 units received → Outstanding 40
  - GRN 2: 40 units received (from same PO)
  - Both linked to same PO

**Data types:**
```typescript
interface IGRN {
  id: string
  code: string
  poId: string
  supplierId: string
  supplierName: string
  status: 'Draft' | 'Submitted' | 'Received' | 'QC In Progress' | 'Completed' | 'Rejected'
  isPartial: boolean
  items: IGRNItem[]
  receivedDate: Date
  createdAt: Date
  updatedAt: Date
}

interface IGRNItem {
  id: string
  productId: string
  productName: string
  expectedQty: number
  receivedQty: number
  unit: string
  qcStatus: 'Pass' | 'Fail' | 'Pending'
  notes: string
}
```

---

## Data Flow & Integration

### Workflow Sequence

```
1. Supplier Management
   └─ Create supplier
      ├─ Add products to catalog
      └─ Add contacts

2. Purchase Request
   └─ Create PR from supplier products
      ├─ Submit for approval
      └─ Approval workflow (Approve / Reject)

3. Purchase Order
   └─ Convert approved PR to PO
      ├─ Save as draft
      └─ Send to supplier (status = Sent)

4. Goods Receipt
   └─ Create GRN from PO
      ├─ Receive items (full or partial)
      ├─ Mark QC status
      └─ If partial → option to create follow-up GRN

5. Invoice & Payment (Phase 2)
   └─ Link GRN to invoice
      ├─ Record payment
      └─ Update supplier debt
```

### Cross-Module Dependencies

- **Supplier → PR:** PR items sourced from supplier catalogs (product + price)
- **PR → PO:** Approved PR converts to PO (items, quantities, supplier)
- **PO → GRN:** GRN references PO (expected quantities, supplier)
- **GRN → Invoice (Phase 2):** GRN links to invoice for payment

---

## Phase 2 Features (Deferred)

Not in Phase 1, will add after core workflow works:

### 1. Supplier Ratings & Evaluation (Screen 05)

**SupplierRatingForm:**
- Header: Supplier name | Evaluation quarter (Q1/Q2/Q3/Q4/2026)
- 4 Rating Criteria sections (each has):
  - Criterion title + description
  - 5-star rating input (interactive)
  - Relevant metrics (e.g., "On-time: 5/6 PO (83%)")
  - Notes textarea for detailed feedback
- Overall Score card (right sidebar, sticky):
  - Weighted calculation: Quality(35%) + Delivery(30%) + Price(20%) + Service(15%)
  - Visual display with breakdown
- Recommendations checkboxes:
  - Extend contract
  - Increase order limit
  - Expand product catalog
  - Improve delivery
  - Warning — monitor closely
- Submit button

**SupplierRatingHistory:**
- Sub-tab in SupplierDetail: "Đánh giá (4 kỳ)"
- Table of past evaluations: Quarter | Evaluator | Date | Score | Stars
- Clickable to view full evaluation details

**Data types:**
```typescript
interface IEvaluationCriterion {
  id: string
  name: string // "Chất lượng", "Giao hàng", etc
  description: string
  weight: number // 0.35, 0.30, etc
  score: number // 1-5
  notes: string
}

interface IEvaluation {
  id: string
  supplierId: string
  quarter: string // Q1/2026, Q2/2026, etc
  evaluator: string
  criteria: IEvaluationCriterion[]
  overallScore: number
  recommendations: {
    extendContract: boolean
    increaseLimit: boolean
    expandCatalog: boolean
    improveDelivery: boolean
    warning: boolean
  }
  createdAt: Date
  updatedAt: Date
}
```

---

### 2. Supplier Contracts (Screen 06)

**SupplierContractList:**
- Header: Supplier name | "X hợp đồng tổng cộng"
- Sections: "Đang hiệu lực" | "Đã hết hạn"
- Active contracts display:
  - Contract card with icon + details
  - Contract number (link to detail)
  - Status badge (Active/Expired)
  - Key info: Effective → Expiry | Payment terms | Discount | Min order value
  - Covered products (tags)
  - Progress bar (days elapsed / total days)
  - Price history timeline (visual)
  - Actions: View PDF | Edit terms | Renew | Terminate

**SupplierContractDetail:**
- Full contract view with all terms
- Price history timeline (visual):
  - Signature → Price start
  - Price adjustments (with date, old → new price, reason)
  - Expiry warning (if < 60 days)
- Edit form: Payment terms, discount, min order, product list
- Renewal flow: Extend period, update prices, renegotiate terms

**Data types:**
```typescript
interface IContractProduct {
  productId: string
  productName: string
  appliedPrice: number
}

interface IPriceHistory {
  id: string
  effectiveDate: Date
  oldPrice: number
  newPrice: number
  reason: string // "Market adjustment", "Volume discount", etc
  changedBy: string
}

interface IContract {
  id: string
  code: string // CON-2026-003
  supplierId: string
  supplierName: string
  status: 'Active' | 'Expired' | 'Terminated'
  effectiveDate: Date
  expiryDate: Date
  paymentTerms: string // NET 30/60, COD, etc
  discount: {
    percentage: number
    minimumOrder: number // minimum order amount to qualify
  }
  minOrderValue: number
  coveredProducts: IContractProduct[]
  priceHistory: IPriceHistory[]
  createdAt: Date
  updatedAt: Date
}
```

---

### 3. Invoice & Payment Management

Not yet in HTML mockup, but needed for complete procurement loop:
- Link GRN to invoice
- Track supplier payables (công nợ NCC)
- Payment status tracking
- Overdue alerts
- *(Design specs to follow when mockup is ready)*

---

### 4. Quality Metrics & On-time Tracking (Supplier Dashboard)

Dashboard showing:
- On-time delivery rate (%) by supplier
- Quality pass rate (%) by supplier
- Price trend analysis
- Performance history charts
- *(Detailed specs when dashboard mockup created)*

---

## Design Consistency

- Follow existing design from `erp-full-v4_1.html`
- Use Cocandy ERP color scheme & typography
- Reuse DataTable, Modal, Badge components
- Status badges: success (green) | warning (yellow) | danger (red) | info (blue) | muted (gray)
- Icons from existing IconSVG system

---

## Success Criteria (Phase 1)

- [ ] All CRUD operations work with mock data
- [ ] Status workflows (PR approval, PO status, GRN partial receipt) functional
- [ ] Forms validate correctly
- [ ] Filters & search work
- [ ] Responsive layout on desktop (1440px+)
- [ ] No console errors
- [ ] All links between modules working (PR → PO, PO → GRN)
