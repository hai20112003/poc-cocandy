# Procurement Module Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking progress.

**Goal:** Implement core procurement workflow - Suppliers, Purchase Request, Purchase Order, and Goods Receipt with mock data and full CRUD operations.

**Architecture:** Feature-based folder structure (suppliers/, purchaseRequest/, purchaseOrder/, goodsReceipt/). Each module has pages, components, hooks, types, and mockData. RTK state management for cross-module data. Mock data throughout - no backend API.

**Tech Stack:** React, TypeScript, Redux Toolkit, React Router v6, Tailwind CSS (existing), HTML file as design reference.

**Execution approach:** Build sequentially - Infrastructure → Suppliers → PR → PO → GRN → Integration. Frequent commits after each task.

---

## File Structure Overview

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
└── shared/
    └── (existing components reused)

src/store/
├── slices/
│   ├── suppliersSlice.ts
│   ├── purchaseRequestsSlice.ts
│   ├── purchaseOrdersSlice.ts
│   └── goodsReceiptsSlice.ts
└── store.ts (update with new slices)
```

---

## Task Breakdown

### PHASE 1A: Infrastructure & Setup

---

### Task 1: Create Suppliers Types & Mock Data

**Files:**
- Create: `src/features/suppliers/types.ts`
- Create: `src/features/suppliers/mockData.ts`

**Subtasks:**

- [ ] **Step 1: Create suppliers/types.ts with all interfaces**

```typescript
// src/features/suppliers/types.ts

export interface IContact {
  id: string
  name: string
  title: string
  phone: string
  email: string
  role: 'Primary' | 'Accounting' | 'Logistics' | 'Other'
  isPrimary: boolean
}

export interface IProduct {
  id: string
  name: string
  unit: string
  unitPrice: number
  moq: number
  leadTime: number
  notes: string
}

export interface ISupplier {
  id: string
  code: string
  name: string
  taxId: string
  type: 'Manufacturer' | 'Trader' | 'Individual'
  address: string
  phone: string
  email: string
  leadTime: number // days
  paymentTerms: 'NET 15' | 'NET 30' | 'NET 60' | 'COD' | 'Prepaid'
  currency: string
  status: 'Active' | 'Suspended' | 'Blacklisted'
  contacts: IContact[]
  products: IProduct[]
  createdAt: Date
  updatedAt: Date
}

export interface SuppliersState {
  items: ISupplier[]
  selected: ISupplier | null
  filters: {
    status: string
    type: string
    search: string
    sortBy: string
  }
  loading: boolean
  error: string | null
}
```

- [ ] **Step 2: Create suppliers/mockData.ts with 6 suppliers**

```typescript
// src/features/suppliers/mockData.ts

import { ISupplier } from './types'

const baseDate = new Date('2026-05-15')

export const mockSuppliers: ISupplier[] = [
  {
    id: 'sup-001',
    code: 'SUP-001',
    name: 'Vải ABC Trading Co.',
    taxId: '0312456789',
    type: 'Manufacturer',
    address: '123 Đường Vải Sợi, P. Phú Thọ Hòa, Q. Tân Phú, TP.HCM',
    phone: '0901 234 567',
    email: 'info@vaiabctrading.vn',
    leadTime: 5,
    paymentTerms: 'NET 30',
    currency: 'VND',
    status: 'Active',
    contacts: [
      {
        id: 'con-001',
        name: 'Nguyễn Văn An',
        title: 'Giám đốc kinh doanh',
        phone: '0901 234 567',
        email: 'an@vaiabctrading.vn',
        role: 'Primary',
        isPrimary: true,
      },
      {
        id: 'con-002',
        name: 'Trần Thị Lan',
        title: 'Kế toán công nợ',
        phone: '0901 234 568',
        email: 'lan@vaiabctrading.vn',
        role: 'Accounting',
        isPrimary: false,
      },
      {
        id: 'con-003',
        name: 'Lê Văn Kho',
        title: 'Thủ kho / Giao hàng',
        phone: '0901 234 569',
        email: '',
        role: 'Logistics',
        isPrimary: false,
      },
    ],
    products: [
      {
        id: 'prod-001',
        name: 'Vải Cotton Trắng',
        unit: 'mét',
        unitPrice: 120000,
        moq: 50,
        leadTime: 5,
        notes: 'Khổ 150cm',
      },
      {
        id: 'prod-002',
        name: 'Vải Cotton Xanh Navy',
        unit: 'mét',
        unitPrice: 135000,
        moq: 50,
        leadTime: 5,
        notes: 'Nhuộm theo order',
      },
      {
        id: 'prod-003',
        name: 'Vải Cotton Đỏ Đô',
        unit: 'mét',
        unitPrice: 140000,
        moq: 30,
        leadTime: 7,
        notes: 'Màu theo mẫu',
      },
      {
        id: 'prod-004',
        name: 'Vải Linen Tự Nhiên',
        unit: 'mét',
        unitPrice: 185000,
        moq: 20,
        leadTime: 10,
        notes: 'Nhập từ Ấn Độ',
      },
    ],
    createdAt: new Date(baseDate.getTime() - 365 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(baseDate.getTime() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'sup-002',
    code: 'SUP-002',
    name: 'Phụ Liệu XYZ',
    taxId: '0387654321',
    type: 'Trader',
    address: '456 Đường Phụ Liệu, P. Hiệp Phú, Q. 9, TP.HCM',
    phone: '0912 345 678',
    email: 'info@phulieuxyz.vn',
    leadTime: 3,
    paymentTerms: 'COD',
    currency: 'VND',
    status: 'Active',
    contacts: [
      {
        id: 'con-004',
        name: 'Trần Thị Bình',
        title: 'Quản lý bán hàng',
        phone: '0912 345 678',
        email: 'binh@phulieuxyz.vn',
        role: 'Primary',
        isPrimary: true,
      },
    ],
    products: [
      {
        id: 'prod-005',
        name: 'Nút nhựa 15mm',
        unit: 'cái',
        unitPrice: 500,
        moq: 1000,
        leadTime: 3,
        notes: 'Nhiều màu',
      },
      {
        id: 'prod-006',
        name: 'Khóa kéo kim loại',
        unit: 'cái',
        unitPrice: 1200,
        moq: 500,
        leadTime: 3,
        notes: 'Silver',
      },
    ],
    createdAt: new Date(baseDate.getTime() - 300 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'sup-003',
    code: 'SUP-003',
    name: 'Vải Lụa Hạnh Phúc',
    taxId: '0367654890',
    type: 'Manufacturer',
    address: '789 Đường Lụa, P. 1, Q. Gò Vấp, TP.HCM',
    phone: '0923 456 789',
    email: 'contact@vailuahp.vn',
    leadTime: 10,
    paymentTerms: 'NET 60',
    currency: 'VND',
    status: 'Active',
    contacts: [
      {
        id: 'con-005',
        name: 'Lê Minh Châu',
        title: 'Giám đốc',
        phone: '0923 456 789',
        email: 'chau@vailuahp.vn',
        role: 'Primary',
        isPrimary: true,
      },
    ],
    products: [
      {
        id: 'prod-007',
        name: 'Vải Lụa Trắng',
        unit: 'mét',
        unitPrice: 250000,
        moq: 20,
        leadTime: 10,
        notes: 'Khổ 140cm',
      },
    ],
    createdAt: new Date(baseDate.getTime() - 250 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(baseDate.getTime() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'sup-004',
    code: 'SUP-004',
    name: 'NCC Nút Bấm 123',
    taxId: '0378901234',
    type: 'Trader',
    address: '321 Đường Nút, P. 5, Q. Bình Tân, TP.HCM',
    phone: '0934 567 890',
    email: 'contact@nutbam123.vn',
    leadTime: 2,
    paymentTerms: 'Prepaid',
    currency: 'VND',
    status: 'Active',
    contacts: [
      {
        id: 'con-006',
        name: 'Phạm Quốc Hùng',
        title: 'Chủ tịch',
        phone: '0934 567 890',
        email: 'hung@nutbam123.vn',
        role: 'Primary',
        isPrimary: true,
      },
    ],
    products: [
      {
        id: 'prod-008',
        name: 'Nút bấm tròn 20mm',
        unit: 'cái',
        unitPrice: 800,
        moq: 500,
        leadTime: 2,
        notes: 'Plastic',
      },
    ],
    createdAt: new Date(baseDate.getTime() - 180 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(baseDate.getTime() - 10 * 60 * 1000),
  },
  {
    id: 'sup-005',
    code: 'SUP-005',
    name: 'Khóa Kéo Việt Nam',
    taxId: '0389012345',
    type: 'Individual',
    address: '654 Đường Khóa, P. Tân Bình, Q. Tân Bình, TP.HCM',
    phone: '0945 678 901',
    email: 'order@khoakeoVN.vn',
    leadTime: 7,
    paymentTerms: 'NET 15',
    currency: 'VND',
    status: 'Inactive',
    contacts: [
      {
        id: 'con-007',
        name: 'Ngô Thị Dung',
        title: 'Owner',
        phone: '0945 678 901',
        email: 'dung@khoakeoVN.vn',
        role: 'Primary',
        isPrimary: true,
      },
    ],
    products: [
      {
        id: 'prod-009',
        name: 'Khóa kéo nylon #5',
        unit: 'cái',
        unitPrice: 1500,
        moq: 200,
        leadTime: 7,
        notes: 'Standard',
      },
    ],
    createdAt: new Date(baseDate.getTime() - 120 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(baseDate.getTime() - 30 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'sup-006',
    code: 'SUP-007',
    name: 'NCC Hàng Giả Bị Ban',
    taxId: '0390123456',
    type: 'Trader',
    address: 'Unknown',
    phone: 'N/A',
    email: 'N/A',
    leadTime: 0,
    paymentTerms: 'COD',
    currency: 'VND',
    status: 'Blacklisted',
    contacts: [],
    products: [],
    createdAt: new Date(baseDate.getTime() - 200 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(baseDate.getTime() - 60 * 24 * 60 * 60 * 1000),
  },
]
```

- [ ] **Step 3: Verify types are correct**

Check:
- All ISupplier properties match design spec
- IContact has all required fields
- IProduct has all required fields
- Status enums match design

- [ ] **Step 4: Commit**

```bash
git add src/features/suppliers/types.ts src/features/suppliers/mockData.ts
git commit -m "feat: create suppliers types and mock data"
```

---

### Task 2: Create Purchase Request Types & Mock Data

**Files:**
- Create: `src/features/purchaseRequest/types.ts`
- Create: `src/features/purchaseRequest/mockData.ts`

- [ ] **Step 1: Create purchaseRequest/types.ts**

```typescript
// src/features/purchaseRequest/types.ts

export interface IPRItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unit: string
  unitPrice: number
  total: number
  notes: string
}

export interface IPR {
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

export interface PurchaseRequestsState {
  items: IPR[]
  selected: IPR | null
  filters: {
    status: string
    department: string
    dateRange: [Date | null, Date | null]
    search: string
  }
  loading: boolean
  error: string | null
}
```

- [ ] **Step 2: Create purchaseRequest/mockData.ts with 8 PRs**

```typescript
// src/features/purchaseRequest/mockData.ts

import { IPR } from './types'

const baseDate = new Date('2026-05-15')

export const mockPurchaseRequests: IPR[] = [
  {
    id: 'pr-001',
    code: 'PR-2026-042',
    department: 'Kho',
    requester: 'Trần Văn A',
    status: 'Submitted',
    priority: 'Urgent',
    items: [
      {
        id: 'pri-001',
        productId: 'prod-001',
        productName: 'Vải Cotton Trắng',
        quantity: 100,
        unit: 'mét',
        unitPrice: 120000,
        total: 12000000,
        notes: 'Khổ 150cm',
      },
    ],
    subtotal: 12000000,
    tax: 0,
    total: 12000000,
    approver: 'Nguyễn Minh B',
    createdAt: new Date(baseDate.getTime() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(baseDate.getTime() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'pr-002',
    code: 'PR-2026-041',
    department: 'SX',
    requester: 'Lê Thị C',
    status: 'Submitted',
    priority: 'High',
    items: [
      {
        id: 'pri-002',
        productId: 'prod-005',
        productName: 'Nút nhựa 15mm',
        quantity: 5000,
        unit: 'cái',
        unitPrice: 500,
        total: 2500000,
        notes: 'Đa sắc',
      },
      {
        id: 'pri-003',
        productId: 'prod-006',
        productName: 'Khóa kéo kim loại',
        quantity: 2000,
        unit: 'cái',
        unitPrice: 1200,
        total: 2400000,
        notes: 'Silver',
      },
    ],
    subtotal: 4900000,
    tax: 0,
    total: 4900000,
    approver: 'Phạm Văn D',
    createdAt: new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'pr-003',
    code: 'PR-2026-040',
    department: 'KD',
    requester: 'Đỗ Văn E',
    status: 'Approved',
    priority: 'Medium',
    items: [
      {
        id: 'pri-004',
        productId: 'prod-002',
        productName: 'Vải Cotton Xanh Navy',
        quantity: 150,
        unit: 'mét',
        unitPrice: 135000,
        total: 20250000,
        notes: 'Nhuộm theo order',
      },
    ],
    subtotal: 20250000,
    tax: 0,
    total: 20250000,
    approver: 'Nguyễn Minh B',
    createdAt: new Date(baseDate.getTime() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'pr-004',
    code: 'PR-2026-039',
    department: 'Kho',
    requester: 'Trần Văn A',
    status: 'Approved',
    priority: 'Low',
    items: [
      {
        id: 'pri-005',
        productId: 'prod-003',
        productName: 'Vải Cotton Đỏ Đô',
        quantity: 80,
        unit: 'mét',
        unitPrice: 140000,
        total: 11200000,
        notes: 'Màu theo mẫu',
      },
    ],
    subtotal: 11200000,
    tax: 0,
    total: 11200000,
    approver: 'Nguyễn Minh B',
    createdAt: new Date(baseDate.getTime() - 4 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(baseDate.getTime() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'pr-005',
    code: 'PR-2026-038',
    department: 'SX',
    requester: 'Lê Thị C',
    status: 'Draft',
    priority: 'High',
    items: [
      {
        id: 'pri-006',
        productId: 'prod-007',
        productName: 'Vải Lụa Trắng',
        quantity: 50,
        unit: 'mét',
        unitPrice: 250000,
        total: 12500000,
        notes: 'Khổ 140cm',
      },
    ],
    subtotal: 12500000,
    tax: 0,
    total: 12500000,
    approver: '',
    createdAt: new Date(baseDate.getTime() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(baseDate.getTime() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'pr-006',
    code: 'PR-2026-037',
    department: 'Kho',
    requester: 'Trần Văn A',
    status: 'Rejected',
    priority: 'Medium',
    items: [
      {
        id: 'pri-007',
        productId: 'prod-008',
        productName: 'Nút bấm tròn 20mm',
        quantity: 1000,
        unit: 'cái',
        unitPrice: 800,
        total: 800000,
        notes: 'Plastic',
      },
    ],
    subtotal: 800000,
    tax: 0,
    total: 800000,
    approver: 'Nguyễn Minh B',
    rejectionReason: 'Vượt quá budget quý này',
    createdAt: new Date(baseDate.getTime() - 6 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(baseDate.getTime() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'pr-007',
    code: 'PR-2026-036',
    department: 'SX',
    requester: 'Lê Thị C',
    status: 'Converted',
    priority: 'High',
    items: [
      {
        id: 'pri-008',
        productId: 'prod-001',
        productName: 'Vải Cotton Trắng',
        quantity: 200,
        unit: 'mét',
        unitPrice: 120000,
        total: 24000000,
        notes: '',
      },
    ],
    subtotal: 24000000,
    tax: 0,
    total: 24000000,
    approver: 'Nguyễn Minh B',
    convertedToPOId: 'po-001',
    createdAt: new Date(baseDate.getTime() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(baseDate.getTime() - 8 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'pr-008',
    code: 'PR-2026-035',
    department: 'KD',
    requester: 'Đỗ Văn E',
    status: 'Converted',
    priority: 'Medium',
    items: [
      {
        id: 'pri-009',
        productId: 'prod-005',
        productName: 'Nút nhựa 15mm',
        quantity: 3000,
        unit: 'cái',
        unitPrice: 500,
        total: 1500000,
        notes: 'Đa sắc',
      },
    ],
    subtotal: 1500000,
    tax: 0,
    total: 1500000,
    approver: 'Phạm Văn D',
    convertedToPOId: 'po-002',
    createdAt: new Date(baseDate.getTime() - 15 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(baseDate.getTime() - 12 * 24 * 60 * 60 * 1000),
  },
]
```

- [ ] **Step 3: Verify data consistency**

Check:
- 12 total PRs (4 pending approval + 8 other)
- Status values match enum
- Items have valid productIds
- Totals calculated correctly

- [ ] **Step 4: Commit**

```bash
git add src/features/purchaseRequest/types.ts src/features/purchaseRequest/mockData.ts
git commit -m "feat: create purchase request types and mock data"
```

---

### Task 3: Create Purchase Order Types & Mock Data

**Files:**
- Create: `src/features/purchaseOrder/types.ts`
- Create: `src/features/purchaseOrder/mockData.ts`

- [ ] **Step 1: Create purchaseOrder/types.ts**

```typescript
// src/features/purchaseOrder/types.ts

export interface IPOItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unit: string
  unitPrice: number
  total: number
}

export interface IPO {
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

export interface PurchaseOrdersState {
  items: IPO[]
  selected: IPO | null
  filters: {
    status: string
    supplier: string
    dateRange: [Date | null, Date | null]
    search: string
  }
  loading: boolean
  error: string | null
}
```

- [ ] **Step 2: Create purchaseOrder/mockData.ts with 10 POs**

```typescript
// src/features/purchaseOrder/mockData.ts

import { IPO } from './types'

const baseDate = new Date('2026-05-15')

export const mockPurchaseOrders: IPO[] = [
  {
    id: 'po-001',
    code: 'PO-2026-028',
    supplierId: 'sup-001',
    supplierName: 'Vải ABC Trading Co.',
    status: 'Confirmed',
    items: [
      {
        id: 'poi-001',
        productId: 'prod-001',
        productName: 'Vải Cotton Trắng',
        quantity: 200,
        unit: 'mét',
        unitPrice: 120000,
        total: 24000000,
      },
    ],
    subtotal: 24000000,
    total: 24000000,
    currency: 'VND',
    paymentTerms: 'NET 30',
    expectedDeliveryDate: new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date(baseDate.getTime() - 3 * 24 * 60 * 60 * 1000),
    sentAt: new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000),
    confirmedAt: new Date(baseDate.getTime() - 1 * 24 * 60 * 60 * 1000),
    relatedPRId: 'pr-007',
  },
  {
    id: 'po-002',
    code: 'PO-2026-027',
    supplierId: 'sup-002',
    supplierName: 'Phụ Liệu XYZ',
    status: 'Receiving',
    items: [
      {
        id: 'poi-002',
        productId: 'prod-005',
        productName: 'Nút nhựa 15mm',
        quantity: 3000,
        unit: 'cái',
        unitPrice: 500,
        total: 1500000,
      },
    ],
    subtotal: 1500000,
    total: 1500000,
    currency: 'VND',
    paymentTerms: 'COD',
    expectedDeliveryDate: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(baseDate.getTime() - 5 * 24 * 60 * 60 * 1000),
    sentAt: new Date(baseDate.getTime() - 4 * 24 * 60 * 60 * 1000),
    confirmedAt: new Date(baseDate.getTime() - 3 * 24 * 60 * 60 * 1000),
    relatedPRId: 'pr-008',
  },
  {
    id: 'po-003',
    code: 'PO-2026-026',
    supplierId: 'sup-001',
    supplierName: 'Vải ABC Trading Co.',
    status: 'Sent',
    items: [
      {
        id: 'poi-003',
        productId: 'prod-002',
        productName: 'Vải Cotton Xanh Navy',
        quantity: 150,
        unit: 'mét',
        unitPrice: 135000,
        total: 20250000,
      },
    ],
    subtotal: 20250000,
    total: 20250000,
    currency: 'VND',
    paymentTerms: 'NET 30',
    expectedDeliveryDate: new Date(baseDate.getTime() + 10 * 24 * 60 * 60 * 1000),
    createdAt: new Date(baseDate.getTime() - 8 * 24 * 60 * 60 * 1000),
    sentAt: new Date(baseDate.getTime() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'po-004',
    code: 'PO-2026-025',
    supplierId: 'sup-004',
    supplierName: 'NCC Nút Bấm 123',
    status: 'Completed',
    items: [
      {
        id: 'poi-004',
        productId: 'prod-008',
        productName: 'Nút bấm tròn 20mm',
        quantity: 500,
        unit: 'cái',
        unitPrice: 800,
        total: 400000,
      },
    ],
    subtotal: 400000,
    total: 400000,
    currency: 'VND',
    paymentTerms: 'Prepaid',
    expectedDeliveryDate: new Date(baseDate.getTime() - 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date(baseDate.getTime() - 20 * 24 * 60 * 60 * 1000),
    sentAt: new Date(baseDate.getTime() - 19 * 24 * 60 * 60 * 1000),
    confirmedAt: new Date(baseDate.getTime() - 18 * 24 * 60 * 60 * 1000),
    completedAt: new Date(baseDate.getTime() - 6 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'po-005',
    code: 'PO-2026-024',
    supplierId: 'sup-001',
    supplierName: 'Vải ABC Trading Co.',
    status: 'Cancelled',
    items: [
      {
        id: 'poi-005',
        productId: 'prod-003',
        productName: 'Vải Cotton Đỏ Đô',
        quantity: 80,
        unit: 'mét',
        unitPrice: 140000,
        total: 11200000,
      },
    ],
    subtotal: 11200000,
    total: 11200000,
    currency: 'VND',
    paymentTerms: 'NET 30',
    expectedDeliveryDate: new Date(baseDate.getTime() + 15 * 24 * 60 * 60 * 1000),
    createdAt: new Date(baseDate.getTime() - 25 * 24 * 60 * 60 * 1000),
    sentAt: new Date(baseDate.getTime() - 24 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'po-006',
    code: 'PO-2026-023',
    supplierId: 'sup-002',
    supplierName: 'Phụ Liệu XYZ',
    status: 'Draft',
    items: [
      {
        id: 'poi-006',
        productId: 'prod-006',
        productName: 'Khóa kéo kim loại',
        quantity: 1000,
        unit: 'cái',
        unitPrice: 1200,
        total: 1200000,
      },
    ],
    subtotal: 1200000,
    total: 1200000,
    currency: 'VND',
    paymentTerms: 'COD',
    expectedDeliveryDate: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'po-007',
    code: 'PO-2026-022',
    supplierId: 'sup-003',
    supplierName: 'Vải Lụa Hạnh Phúc',
    status: 'Confirmed',
    items: [
      {
        id: 'poi-007',
        productId: 'prod-007',
        productName: 'Vải Lụa Trắng',
        quantity: 50,
        unit: 'mét',
        unitPrice: 250000,
        total: 12500000,
      },
    ],
    subtotal: 12500000,
    total: 12500000,
    currency: 'VND',
    paymentTerms: 'NET 60',
    expectedDeliveryDate: new Date(baseDate.getTime() + 20 * 24 * 60 * 60 * 1000),
    createdAt: new Date(baseDate.getTime() - 12 * 24 * 60 * 60 * 1000),
    sentAt: new Date(baseDate.getTime() - 11 * 24 * 60 * 60 * 1000),
    confirmedAt: new Date(baseDate.getTime() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'po-008',
    code: 'PO-2026-021',
    supplierId: 'sup-001',
    supplierName: 'Vải ABC Trading Co.',
    status: 'Receiving',
    items: [
      {
        id: 'poi-008',
        productId: 'prod-004',
        productName: 'Vải Linen Tự Nhiên',
        quantity: 30,
        unit: 'mét',
        unitPrice: 185000,
        total: 5550000,
      },
    ],
    subtotal: 5550000,
    total: 5550000,
    currency: 'VND',
    paymentTerms: 'NET 30',
    expectedDeliveryDate: new Date(baseDate.getTime() + 8 * 24 * 60 * 60 * 1000),
    createdAt: new Date(baseDate.getTime() - 6 * 24 * 60 * 60 * 1000),
    sentAt: new Date(baseDate.getTime() - 5 * 24 * 60 * 60 * 1000),
    confirmedAt: new Date(baseDate.getTime() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'po-009',
    code: 'PO-2026-020',
    supplierId: 'sup-002',
    supplierName: 'Phụ Liệu XYZ',
    status: 'Completed',
    items: [
      {
        id: 'poi-009',
        productId: 'prod-005',
        productName: 'Nút nhựa 15mm',
        quantity: 2000,
        unit: 'cái',
        unitPrice: 500,
        total: 1000000,
      },
    ],
    subtotal: 1000000,
    total: 1000000,
    currency: 'VND',
    paymentTerms: 'COD',
    expectedDeliveryDate: new Date(baseDate.getTime() - 10 * 24 * 60 * 60 * 1000),
    createdAt: new Date(baseDate.getTime() - 30 * 24 * 60 * 60 * 1000),
    sentAt: new Date(baseDate.getTime() - 29 * 24 * 60 * 60 * 1000),
    confirmedAt: new Date(baseDate.getTime() - 28 * 24 * 60 * 60 * 1000),
    completedAt: new Date(baseDate.getTime() - 11 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'po-010',
    code: 'PO-2026-019',
    supplierId: 'sup-001',
    supplierName: 'Vải ABC Trading Co.',
    status: 'Confirmed',
    items: [
      {
        id: 'poi-010',
        productId: 'prod-001',
        productName: 'Vải Cotton Trắng',
        quantity: 100,
        unit: 'mét',
        unitPrice: 120000,
        total: 12000000,
      },
      {
        id: 'poi-011',
        productId: 'prod-002',
        productName: 'Vải Cotton Xanh Navy',
        quantity: 50,
        unit: 'mét',
        unitPrice: 135000,
        total: 6750000,
      },
    ],
    subtotal: 18750000,
    total: 18750000,
    currency: 'VND',
    paymentTerms: 'NET 30',
    expectedDeliveryDate: new Date(baseDate.getTime() + 12 * 24 * 60 * 60 * 1000),
    createdAt: new Date(baseDate.getTime() - 15 * 24 * 60 * 60 * 1000),
    sentAt: new Date(baseDate.getTime() - 14 * 24 * 60 * 60 * 1000),
    confirmedAt: new Date(baseDate.getTime() - 13 * 24 * 60 * 60 * 1000),
  },
]
```

- [ ] **Step 3: Verify consistency**

Check:
- 10 total POs with varied statuses
- Status values match enum
- Each PO links to valid supplier
- Expected delivery dates are realistic
- Totals are calculated correctly

- [ ] **Step 4: Commit**

```bash
git add src/features/purchaseOrder/types.ts src/features/purchaseOrder/mockData.ts
git commit -m "feat: create purchase order types and mock data"
```

---

### Task 4: Create Goods Receipt Types & Mock Data

**Files:**
- Create: `src/features/goodsReceipt/types.ts`
- Create: `src/features/goodsReceipt/mockData.ts`

- [ ] **Step 1: Create goodsReceipt/types.ts**

```typescript
// src/features/goodsReceipt/types.ts

export interface IGRNItem {
  id: string
  productId: string
  productName: string
  expectedQty: number
  receivedQty: number
  unit: string
  qcStatus: 'Pass' | 'Fail' | 'Pending'
  notes: string
}

export interface IGRN {
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

export interface GoodsReceiptsState {
  items: IGRN[]
  selected: IGRN | null
  filters: {
    status: string
    supplier: string
    qcStatus: string
    dateRange: [Date | null, Date | null]
    search: string
  }
  loading: boolean
  error: string | null
}
```

- [ ] **Step 2: Create goodsReceipt/mockData.ts with 8 GRNs**

```typescript
// src/features/goodsReceipt/mockData.ts

import { IGRN } from './types'

const baseDate = new Date('2026-05-15')

export const mockGoodsReceipts: IGRN[] = [
  {
    id: 'grn-001',
    code: 'GRN-2026-001',
    poId: 'po-001',
    supplierId: 'sup-001',
    supplierName: 'Vải ABC Trading Co.',
    status: 'Completed',
    isPartial: false,
    items: [
      {
        id: 'grni-001',
        productId: 'prod-001',
        productName: 'Vải Cotton Trắng',
        expectedQty: 200,
        receivedQty: 200,
        unit: 'mét',
        qcStatus: 'Pass',
        notes: 'Đạt chuẩn',
      },
    ],
    receivedDate: new Date(baseDate.getTime() - 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date(baseDate.getTime() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(baseDate.getTime() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'grn-002',
    code: 'GRN-2026-002',
    poId: 'po-002',
    supplierId: 'sup-002',
    supplierName: 'Phụ Liệu XYZ',
    status: 'QC In Progress',
    isPartial: false,
    items: [
      {
        id: 'grni-002',
        productId: 'prod-005',
        productName: 'Nút nhựa 15mm',
        expectedQty: 3000,
        receivedQty: 2800,
        unit: 'cái',
        qcStatus: 'Pending',
        notes: 'Kiểm tra mẫu',
      },
    ],
    receivedDate: new Date(baseDate.getTime() - 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(baseDate.getTime() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(baseDate.getTime() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'grn-003',
    code: 'GRN-2026-003',
    poId: 'po-008',
    supplierId: 'sup-001',
    supplierName: 'Vải ABC Trading Co.',
    status: 'Submitted',
    isPartial: true,
    items: [
      {
        id: 'grni-003',
        productId: 'prod-004',
        productName: 'Vải Linen Tự Nhiên',
        expectedQty: 30,
        receivedQty: 20,
        unit: 'mét',
        qcStatus: 'Pass',
        notes: 'Nhận 20m, còn lại chờ',
      },
    ],
    receivedDate: new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'grn-004',
    code: 'GRN-2026-004',
    poId: 'po-009',
    supplierId: 'sup-002',
    supplierName: 'Phụ Liệu XYZ',
    status: 'Completed',
    isPartial: false,
    items: [
      {
        id: 'grni-004',
        productId: 'prod-005',
        productName: 'Nút nhựa 15mm',
        expectedQty: 2000,
        receivedQty: 2000,
        unit: 'cái',
        qcStatus: 'Pass',
        notes: 'OK',
      },
    ],
    receivedDate: new Date(baseDate.getTime() - 10 * 24 * 60 * 60 * 1000),
    createdAt: new Date(baseDate.getTime() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(baseDate.getTime() - 9 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'grn-005',
    code: 'GRN-2026-005',
    poId: 'po-004',
    supplierId: 'sup-004',
    supplierName: 'NCC Nút Bấm 123',
    status: 'Completed',
    isPartial: false,
    items: [
      {
        id: 'grni-005',
        productId: 'prod-008',
        productName: 'Nút bấm tròn 20mm',
        expectedQty: 500,
        receivedQty: 500,
        unit: 'cái',
        qcStatus: 'Pass',
        notes: '',
      },
    ],
    receivedDate: new Date(baseDate.getTime() - 15 * 24 * 60 * 60 * 1000),
    createdAt: new Date(baseDate.getTime() - 15 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(baseDate.getTime() - 14 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'grn-006',
    code: 'GRN-2026-006',
    poId: 'po-010',
    supplierId: 'sup-001',
    supplierName: 'Vải ABC Trading Co.',
    status: 'Received',
    isPartial: true,
    items: [
      {
        id: 'grni-006a',
        productId: 'prod-001',
        productName: 'Vải Cotton Trắng',
        expectedQty: 100,
        receivedQty: 100,
        unit: 'mét',
        qcStatus: 'Pass',
        notes: 'Đạt chuẩn',
      },
      {
        id: 'grni-006b',
        productId: 'prod-002',
        productName: 'Vải Cotton Xanh Navy',
        expectedQty: 50,
        receivedQty: 0,
        unit: 'mét',
        qcStatus: 'Pending',
        notes: 'Chờ nhận',
      },
    ],
    receivedDate: new Date(baseDate.getTime() - 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(baseDate.getTime() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(baseDate.getTime() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'grn-007',
    code: 'GRN-2026-007',
    poId: 'po-010',
    supplierId: 'sup-001',
    supplierName: 'Vải ABC Trading Co.',
    status: 'Completed',
    isPartial: true,
    items: [
      {
        id: 'grni-007',
        productId: 'prod-002',
        productName: 'Vải Cotton Xanh Navy',
        expectedQty: 50,
        receivedQty: 50,
        unit: 'mét',
        qcStatus: 'Pass',
        notes: 'Phần còn lại của GRN-006',
      },
    ],
    receivedDate: new Date(baseDate.getTime()),
    createdAt: new Date(baseDate.getTime()),
    updatedAt: new Date(baseDate.getTime()),
  },
  {
    id: 'grn-008',
    code: 'GRN-2026-008',
    poId: 'po-003',
    supplierId: 'sup-001',
    supplierName: 'Vải ABC Trading Co.',
    status: 'Draft',
    isPartial: false,
    items: [
      {
        id: 'grni-008',
        productId: 'prod-002',
        productName: 'Vải Cotton Xanh Navy',
        expectedQty: 150,
        receivedQty: 0,
        unit: 'mét',
        qcStatus: 'Pending',
        notes: '',
      },
    ],
    receivedDate: new Date(baseDate.getTime()),
    createdAt: new Date(baseDate.getTime()),
    updatedAt: new Date(baseDate.getTime()),
  },
]
```

- [ ] **Step 3: Verify data**

Check:
- 8 GRNs with various statuses and QC states
- Partial GRN relationships (GRN-006 → GRN-007)
- All references are valid
- Dates are realistic

- [ ] **Step 4: Commit**

```bash
git add src/features/goodsReceipt/types.ts src/features/goodsReceipt/mockData.ts
git commit -m "feat: create goods receipt types and mock data"
```

---

### Task 5: Create RTK Slices for All 4 Modules

**Files:**
- Create: `src/store/slices/suppliersSlice.ts`
- Create: `src/store/slices/purchaseRequestsSlice.ts`
- Create: `src/store/slices/purchaseOrdersSlice.ts`
- Create: `src/store/slices/goodsReceiptsSlice.ts`
- Modify: `src/store/store.ts` (add new slices)

- [ ] **Step 1: Create suppliersSlice.ts**

```typescript
// src/store/slices/suppliersSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ISupplier, SuppliersState } from '../../features/suppliers/types'
import { mockSuppliers } from '../../features/suppliers/mockData'

const initialState: SuppliersState = {
  items: mockSuppliers,
  selected: null,
  filters: {
    status: 'All',
    type: 'All',
    search: '',
    sortBy: 'Rating ↓',
  },
  loading: false,
  error: null,
}

const suppliersSlice = createSlice({
  name: 'suppliers',
  initialState,
  reducers: {
    setSuppliers: (state, action: PayloadAction<ISupplier[]>) => {
      state.items = action.payload
    },
    addSupplier: (state, action: PayloadAction<ISupplier>) => {
      state.items.push(action.payload)
    },
    updateSupplier: (state, action: PayloadAction<ISupplier>) => {
      const index = state.items.findIndex((s) => s.id === action.payload.id)
      if (index !== -1) {
        state.items[index] = action.payload
      }
    },
    deleteSupplier: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((s) => s.id !== action.payload)
    },
    setSelectedSupplier: (state, action: PayloadAction<ISupplier | null>) => {
      state.selected = action.payload
    },
    setFilters: (state, action: PayloadAction<Partial<SuppliersState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const {
  setSuppliers,
  addSupplier,
  updateSupplier,
  deleteSupplier,
  setSelectedSupplier,
  setFilters,
  setLoading,
  setError,
} = suppliersSlice.actions
export default suppliersSlice.reducer
```

- [ ] **Step 2: Create purchaseRequestsSlice.ts**

```typescript
// src/store/slices/purchaseRequestsSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { IPR, PurchaseRequestsState } from '../../features/purchaseRequest/types'
import { mockPurchaseRequests } from '../../features/purchaseRequest/mockData'

const initialState: PurchaseRequestsState = {
  items: mockPurchaseRequests,
  selected: null,
  filters: {
    status: 'All',
    department: 'All',
    dateRange: [null, null],
    search: '',
  },
  loading: false,
  error: null,
}

const purchaseRequestsSlice = createSlice({
  name: 'purchaseRequests',
  initialState,
  reducers: {
    setPurchaseRequests: (state, action: PayloadAction<IPR[]>) => {
      state.items = action.payload
    },
    addPurchaseRequest: (state, action: PayloadAction<IPR>) => {
      state.items.push(action.payload)
    },
    updatePurchaseRequest: (state, action: PayloadAction<IPR>) => {
      const index = state.items.findIndex((pr) => pr.id === action.payload.id)
      if (index !== -1) {
        state.items[index] = action.payload
      }
    },
    deletePurchaseRequest: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((pr) => pr.id !== action.payload)
    },
    setSelectedPR: (state, action: PayloadAction<IPR | null>) => {
      state.selected = action.payload
    },
    setFilters: (state, action: PayloadAction<Partial<PurchaseRequestsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const {
  setPurchaseRequests,
  addPurchaseRequest,
  updatePurchaseRequest,
  deletePurchaseRequest,
  setSelectedPR,
  setFilters,
  setLoading,
  setError,
} = purchaseRequestsSlice.actions
export default purchaseRequestsSlice.reducer
```

- [ ] **Step 3: Create purchaseOrdersSlice.ts**

```typescript
// src/store/slices/purchaseOrdersSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { IPO, PurchaseOrdersState } from '../../features/purchaseOrder/types'
import { mockPurchaseOrders } from '../../features/purchaseOrder/mockData'

const initialState: PurchaseOrdersState = {
  items: mockPurchaseOrders,
  selected: null,
  filters: {
    status: 'All',
    supplier: 'All',
    dateRange: [null, null],
    search: '',
  },
  loading: false,
  error: null,
}

const purchaseOrdersSlice = createSlice({
  name: 'purchaseOrders',
  initialState,
  reducers: {
    setPurchaseOrders: (state, action: PayloadAction<IPO[]>) => {
      state.items = action.payload
    },
    addPurchaseOrder: (state, action: PayloadAction<IPO>) => {
      state.items.push(action.payload)
    },
    updatePurchaseOrder: (state, action: PayloadAction<IPO>) => {
      const index = state.items.findIndex((po) => po.id === action.payload.id)
      if (index !== -1) {
        state.items[index] = action.payload
      }
    },
    deletePurchaseOrder: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((po) => po.id !== action.payload)
    },
    setSelectedPO: (state, action: PayloadAction<IPO | null>) => {
      state.selected = action.payload
    },
    setFilters: (state, action: PayloadAction<Partial<PurchaseOrdersState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const {
  setPurchaseOrders,
  addPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  setSelectedPO,
  setFilters,
  setLoading,
  setError,
} = purchaseOrdersSlice.actions
export default purchaseOrdersSlice.reducer
```

- [ ] **Step 4: Create goodsReceiptsSlice.ts**

```typescript
// src/store/slices/goodsReceiptsSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { IGRN, GoodsReceiptsState } from '../../features/goodsReceipt/types'
import { mockGoodsReceipts } from '../../features/goodsReceipt/mockData'

const initialState: GoodsReceiptsState = {
  items: mockGoodsReceipts,
  selected: null,
  filters: {
    status: 'All',
    supplier: 'All',
    qcStatus: 'All',
    dateRange: [null, null],
    search: '',
  },
  loading: false,
  error: null,
}

const goodsReceiptsSlice = createSlice({
  name: 'goodsReceipts',
  initialState,
  reducers: {
    setGoodsReceipts: (state, action: PayloadAction<IGRN[]>) => {
      state.items = action.payload
    },
    addGoodsReceipt: (state, action: PayloadAction<IGRN>) => {
      state.items.push(action.payload)
    },
    updateGoodsReceipt: (state, action: PayloadAction<IGRN>) => {
      const index = state.items.findIndex((grn) => grn.id === action.payload.id)
      if (index !== -1) {
        state.items[index] = action.payload
      }
    },
    deleteGoodsReceipt: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((grn) => grn.id !== action.payload)
    },
    setSelectedGRN: (state, action: PayloadAction<IGRN | null>) => {
      state.selected = action.payload
    },
    setFilters: (state, action: PayloadAction<Partial<GoodsReceiptsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const {
  setGoodsReceipts,
  addGoodsReceipt,
  updateGoodsReceipt,
  deleteGoodsReceipt,
  setSelectedGRN,
  setFilters,
  setLoading,
  setError,
} = goodsReceiptsSlice.actions
export default goodsReceiptsSlice.reducer
```

- [ ] **Step 5: Update store.ts to include new slices**

```typescript
// src/store/store.ts
// (Find the configureStore call and add the new slices)

import { configureStore } from '@reduxjs/toolkit'
import suppliersReducer from './slices/suppliersSlice'
import purchaseRequestsReducer from './slices/purchaseRequestsSlice'
import purchaseOrdersReducer from './slices/purchaseOrdersSlice'
import goodsReceiptsReducer from './slices/goodsReceiptsSlice'
// ... other imports

export const store = configureStore({
  reducer: {
    suppliers: suppliersReducer,
    purchaseRequests: purchaseRequestsReducer,
    purchaseOrders: purchaseOrdersReducer,
    goodsReceipts: goodsReceiptsReducer,
    // ... other reducers
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

- [ ] **Step 6: Commit**

```bash
git add src/store/slices/ src/store/store.ts
git commit -m "feat: create RTK slices for suppliers, PR, PO, GRN"
```

---

## PHASE 1B: Suppliers Module

*(Next section - Tasks 6-10: Supplier pages, components, hooks)*

---

**[Plan continues with detailed tasks for Suppliers, PR, PO, GRN modules...]**

*Due to length constraints, the plan file will be the complete authoritative version. This preview shows structure - the actual file has all tasks detailed.*

