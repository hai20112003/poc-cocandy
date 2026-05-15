# Procurement Module — Complete Design & Requirements

**Version:** 2026-05-15  
**Status:** Approved  
**Scope:** Phase 1 (Core Workflow) + Phase 2 (Enhanced Features) — Full Business Logic

---

## Executive Summary

Complete ERP Procurement Module with:
- **11 UI screens** from design mockup (`erp-full-v4_1.html`)
- **4 core entities**: Suppliers, PR, PO, GRN with full workflows
- **Business logic**: Multi-level approvals, status tracking, partial receipts, returns handling
- **Phase 1**: MVP ready-to-use (CRUD + workflows)
- **Phase 2**: Ratings, contracts, evaluations (deferred)

---

# PHASE 1: CORE WORKFLOW

## 1. Supplier Management (Quản lý NCC)

### Purpose
Store & manage supplier information, contacts, product catalogs for sourcing decisions.

### Screens
- **Screen 02**: Supplier List (48 NCC, filters, stats)
- **Screen 03**: Supplier Detail (tabs: info, products, PO history, notes)
- **Screen 04**: Supplier Form (create/edit)

### Key Entities

**ISupplier**
```typescript
{
  id: string
  code: string                  // SUP-001
  name: string                  // Vải ABC Trading Co.
  taxId: string                 // 0312456789
  type: 'Manufacturer' | 'Trader' | 'Individual'
  address: string
  phone: string
  email: string
  leadTime: number              // days (trung bình)
  paymentTerms: 'NET 15' | 'NET 30' | 'NET 60' | 'COD' | 'Prepaid'
  currency: string              // VND, USD
  status: 'Active' | 'Suspended' | 'Blacklisted'
  blacklistReason?: string      // hàng giả, giao trễ liên tục
  rating: number                // 0-5 (Phase 2)
  contacts: IContact[]
  products: IProduct[]
  createdAt: Date
  updatedAt: Date
}

IContact {
  id: string
  name: string
  title: string
  phone: string
  email: string
  role: 'Primary' | 'Accounting' | 'Logistics' | 'Other'
  isPrimary: boolean
}

IProduct {
  id: string
  name: string
  unit: string
  unitPrice: number
  moq: number                   // minimum order qty
  leadTime: number              // can override supplier leadTime
  notes: string
}
```

### Features
- ✅ CRUD suppliers
- ✅ Manage contacts (add/edit/set primary)
- ✅ Manage product catalog (add/edit/delete)
- ✅ View PO history (last 24 POs)
- ✅ Status filters (Active/Inactive/Blacklist)
- ✅ Search, sort by rating
- ✅ Stats: Active count | Suspended | Blacklisted | With contracts
- ⏳ Ratings tab (Phase 2)
- ⏳ Contracts tab (Phase 2)

### Business Rules
- Each supplier can have multiple contacts
- Primary contact used for PO communication by default
- Multiple product categories per supplier
- Product lead time can override supplier average
- Status: Active ↔ Suspended (reversible), Active → Blacklisted (one-way, irreversible)
- Cannot delete supplier (set to Suspended/Blacklisted instead)

---

## 2. Purchase Request (PR) — Yêu cầu Mua hàng

### Purpose
Internal departments (warehouse, production, sales) request purchases. PR is informal → goes to approval → becomes PO.

### Screens
- **Screen 07**: PR List (36 requests, status filters, stats, pending approvals sidebar)
- **Screen 08**: PR Form (create/edit, pick supplier products, validate before submit)

### Key Entities

**IPR**
```typescript
{
  id: string
  code: string                  // PR-2026-001
  department: string            // warehouse | production | sales
  requester: string
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Converted'
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  items: IPRItem[]
  subtotal: number
  tax: number
  total: number
  neededByDate: Date            // ⚠️ CRITICAL for PO deadline
  approver: string
  rejectionReason?: string
  createdAt: Date
  updatedAt: Date
  convertedToPOId?: string
}

IPRItem {
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

### Approval Workflow

```
DRAFT (người tạo)
  │
  ├─ Save draft (không submit)
  │
  ▼
SUBMITTED (chờ duyệt)
  │
  ├──► Approve ──► APPROVED ──► Convert to PO
  │
  └──► Reject + reason ──► [người tạo nhận thông báo]
                             (có thể sửa và submit lại)
```

### Approval Authorization
| Total Value | Approver |
|---|---|
| < 5M | Department Manager |
| 5M – 50M | Department Head |
| > 50M | Director |

### Features
- ✅ Create PR with items from supplier catalogs
- ✅ Auto-fill unit price from supplier catalog
- ✅ Calculate totals automatically
- ✅ Submit for approval (Submitted status)
- ✅ Approval dashboard (pending approvals, approve/reject buttons)
- ✅ Rejection with reason
- ✅ Convert to PO (from Approved status)
- ✅ Status filters: All | Draft | Submitted | Approved | Rejected | Converted
- ✅ Search, sort, filter by department

### Business Rules
- `neededByDate` = deadline for **having goods** (work backward for PO send date)
- Can reject & request correction (e.g., "Budget này chưa duyệt, thử tháng sau")
- One PR can create multiple POs (split across suppliers)
- Multiple PRs can combine into one PO (consolidate for volume)
- Cannot edit submitted/approved/rejected PR — must draft new one

---

## 3. Purchase Order (PO) — Đơn Đặt hàng

### Purpose
Official purchase document sent to supplier. Confirms qty, price, delivery terms.

### Screens
- **Screen 09**: PO Detail (overview, items, timeline, GRN history, actions)

### Key Entities

**IPO**
```typescript
{
  id: string
  code: string                  // PO-2026-001
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
  createdBy: string
  sentAt?: Date
  confirmedAt?: Date
  completedAt?: Date
  relatedPRIds?: string[]
  cancellationReason?: string
}

IPOItem {
  id: string
  prItemId?: string             // link to source PR
  productId: string
  productName: string
  quantity: number
  quantityReceived: number      // updated by GRN
  unit: string
  unitPrice: number
  discountRate: number
  taxRate: number
  total: number
  notes: string
}
```

### Status Lifecycle

```
DRAFT (chưa gửi)
  │
  ▼
SENT (gửi NCC, chờ xác nhận)
  │
  ├─► CANCELLED (NCC từ chối / lỗi)
  │
  ▼
CONFIRMED (NCC xác nhận)
  │
  ▼
RECEIVING (hàng về một phần)
  │
  ▼
COMPLETED (all GRNs confirmed)
```

### Features
- ✅ Create from approved PR (auto-fill supplier, items, quantities)
- ✅ Edit quantities, dates before sending
- ✅ Send to supplier (Sent status, record `sentAt`)
- ✅ Mark confirmed (Confirmed status, record `confirmedAt`)
- ✅ Create GRN from this PO
- ✅ View linked GRNs (partial/full receipts)
- ✅ Timeline visualization (status + dates)
- ✅ Cancel with reason
- ⏳ PO amendments (adjust qty/price after sent, Phase 2)
- ⏳ Supplier confirmation tracking (email/ZalO acknowledgement)

### Business Rules
- Can **NOT** delete sent PO — must formally cancel
- If supplier quotes different price → **must adjust PO before GRN**
- `expected_delivery_date` is reminder — alert if > 5 days delayed
- Track `sentAt`, `confirmedAt` for performance analytics (on-time delivery %)
- Multiple PRs can be consolidated into one PO (for volume discount)
- One PO can be partially received multiple times (Receiving status)

---

## 4. Goods Receipt Note (GRN) — Phiếu Nhập hàng

### Purpose
Record actual goods received: qty, quality, discrepancies vs. PO. Handle partial/full receipts, returns.

### Screens
- **Screen 10**: GRN & Invoice (GRN list, form, QC status, return tracking)
- **Screen 11**: Partial GRN (multi-step receipt handling)

### Key Entities

**IGRN**
```typescript
{
  id: string
  code: string                  // GRN-2026-001
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

IGRNItem {
  id: string
  productId: string
  productName: string
  expectedQty: number
  receivedQty: number
  unit: string
  qcStatus: 'Pass' | 'Fail' | 'Pending'
  batchNo?: string
  expiryDate?: Date
  storageLocation?: string
  notes: string
}

IReturn {
  id: string
  grnId: string
  returnDate: Date
  reason: 'wrong_item' | 'damaged' | 'quality_fail' | 'over_delivery'
  items: IReturnItem[]
  status: 'pending' | 'in_transit' | 'completed' | 'credited'
  creditNoteNo?: string
}
```

### Receipt Scenarios

| Situation | Handling |
|-----------|----------|
| **Hàng đúng, đủ** | GRN → Received → QC Pass → nhập kho toàn bộ |
| **Hàng về thiếu** | GRN partial → PO vẫn Receiving, chờ phần còn lại |
| **Hàng về thừa** | Nhận đúng theo PO, tạo Return cho phần thừa |
| **Hàng lỗi 1 phần** | Nhận phần tốt, tạo Return cho phần lỗi |
| **Hàng lỗi toàn bộ** | Reject GRN, tạo Return toàn bộ |

### Features
- ✅ Create GRN from PO (auto-populate items with expected qty)
- ✅ Enter received qty (can < expected for partial)
- ✅ Mark QC status per item (Pass/Fail/Pending)
- ✅ Add batch no, expiry date, storage location
- ✅ QC notes (damage, color mismatch, etc.)
- ✅ Create follow-up GRN for remaining items (partial receipt)
- ✅ Create Return to Supplier (items, reason, qty rejected)
- ✅ Track PO outstanding qty (expected - all GRNs received)
- ✅ Return status: pending → in_transit → completed → credited (credit note)

### Quality Check (QC) Rules
- **Color**: Match sample? Fade detection?
- **Dimensions**: Correct width? Shrinkage acceptable?
- **Defects**: Weaving errors? Dye issues?
- **Count**: Actual qty correct?
- **Batch**: Store correctly, expiry tracked

### Business Rules
- Partial GRN updates PO to "Receiving" status
- Last GRN (remaining qty = 0) updates PO to "Completed"
- Cannot create GRN from Draft/Cancelled PO
- Return items must be from same GRN
- Return qty ≤ received qty
- Return reason required (for supplier communication)
- QC Fail items go to Return automatically (optional manual approval)

---

# PHASE 2: ENHANCED FEATURES (Deferred)

## 1. Supplier Ratings & Quarterly Evaluations (Screen 05)

**Components:**
- EvaluationForm (4 criteria with 5-star input + notes)
- OverallScoreCard (weighted calculation: Quality 35% + Delivery 30% + Price 20% + Service 15%)
- EvaluationHistory (past quarters)
- Recommendations (extend contract, increase limit, expand catalog, warning)

**Data:**
```typescript
IEvaluationCriterion {
  name: string          // "Chất lượng", "Giao hàng", "Giá cả", "Dịch vụ"
  weight: number        // 0.35, 0.30, 0.20, 0.15
  score: number         // 1-5
  notes: string
}

IEvaluation {
  supplierId: string
  quarter: string       // Q1/2026
  evaluator: string
  criteria: IEvaluationCriterion[]
  overallScore: number  // weighted sum
  recommendations: { extendContract, increaseLimit, expandCatalog, warning }
  createdAt: Date
}
```

---

## 2. Supplier Contracts (Screen 06)

**Components:**
- ContractList (active + expired sections)
- ContractDetail (full terms, price history timeline, progress bar)
- ContractForm (create/renew/terminate)

**Data:**
```typescript
IContract {
  id: string
  code: string                  // CON-2026-003
  supplierId: string
  status: 'Active' | 'Expired' | 'Terminated'
  effectiveDate: Date
  expiryDate: Date
  paymentTerms: string          // NET 30
  discount: { percentage: number, minimumOrder: number }
  minOrderValue: number
  coveredProducts: IContractProduct[]
  priceHistory: IPriceHistory[] // adjustments over time
  createdAt: Date
}

IPriceHistory {
  effectiveDate: Date
  oldPrice: number
  newPrice: number
  reason: string                // "Market adj", "Volume", etc
  changedBy: string
}
```

---

## 3. Invoice & Payment Tracking

Deferred — will design when mockup available.

---

# IMPLEMENTATION APPROACH

## Folder Structure (Feature-Based)
```
src/features/
├── suppliers/ (Screen 02-04)
├── purchaseRequest/ (Screen 07-08)
├── purchaseOrder/ (Screen 09)
├── goodsReceipt/ (Screen 10-11)
└── shared/ (DataTable, modals, utilities)

src/store/
├── slices/ (suppliersSlice, prSlice, poSlice, grnSlice)
└── store.ts
```

## RTK State Management
- `suppliersSlice`: items[], selected, filters, loading
- `purchaseRequestsSlice`: items[], selected, filters, loading
- `purchaseOrdersSlice`: items[], selected, filters, loading
- `goodsReceiptsSlice`: items[], selected, filters, loading

## Mock Data Strategy
- Real-world scenarios: mix of all statuses
- Dates: relative to 2026-05-15
- Relationships: PRs link to suppliers, POs link to PRs, GRNs link to POs

---

# SUCCESS CRITERIA (Phase 1)

- [ ] All CRUD operations work (mock data)
- [ ] Status workflows functional (PR approval, PO sending, GRN partial receipt)
- [ ] Forms validate correctly
- [ ] Filters & search working
- [ ] All cross-module links working (PR → PO, PO → GRN)
- [ ] Responsive design (desktop 1440px+)
- [ ] No console errors
- [ ] Demo-ready

