# Goods Receipt & Invoice Detail View Redesign

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor `GoodsReceiptDetailModal` and `InvoiceDetailModal` to display data in form-like section layouts (similar to `PurchaseRequestModal`) while remaining fully read-only, improving visual consistency and information hierarchy.

**Architecture:** Both modals will adopt a grid-based section pattern with labeled field blocks, replacing the current mixed inline-text approach. Sections will be grouped logically (header info, optional details, items table, summary). Optional sections (transportation, approval info, notes) will be hidden when empty. The items table structure remains unchanged. All content sits in a scrollable container with the action buttons fixed outside.

**Tech Stack:** React, Tailwind CSS, existing Modal and Button components

---

## File Structure

**Files to modify:**
- `src/features/goods-receipts/components/GoodsReceiptDetailModal.tsx` - Refactor section layout, add grid-based field display
- `src/features/goods-receipts/components/InvoiceDetailModal.tsx` - Refactor section layout, add grid-based field display

No new files or components needed — changes are layout-only refactoring within existing files.

---

## Task 1: Refactor GoodsReceiptDetailModal to Form-Like Layout

**Files:**
- Modify: `src/features/goods-receipts/components/GoodsReceiptDetailModal.tsx`

- [ ] **Step 1: Read the current GoodsReceiptDetailModal**

Understand the current structure:
- Modal title with GRN code
- Grid of header fields (code, poCode, supplierName, receiveDate, receivedBy, status)
- Optional transportation section (conditionally rendered)
- Items table
- Summary grid (totalReceived, totalAccepted, totalRejected)
- QC Status block
- Optional notes

- [ ] **Step 2: Replace the entire content section with refactored grid-based layout**

Replace the `<div className="space-y-4 max-h-[70vh] overflow-y-auto">` section with the new structure. Keep the modal wrapper, title, and buttons the same.

New structure:

```tsx
export function GoodsReceiptDetailModal({ open, onOpenChange, data }: GoodsReceiptDetailModalProps) {
  return (
    <Modal open={open} onClose={() => onOpenChange(false)} title={`Chi tiết phiếu nhập kho: ${data.code}`}>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Header Info Section */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded border">
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1">Mã GRN</div>
            <div className="font-semibold text-slate-800">{data.code}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1">Liên kết PO</div>
            <div className="font-semibold text-indigo-600">{data.poCode}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1">Nhà cung cấp</div>
            <div className="font-medium text-slate-800">{data.supplierName}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1">Ngày nhận</div>
            <div className="font-medium text-slate-800">{data.receiveDate}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1">Người nhận</div>
            <div className="font-medium text-slate-800">{data.receivedBy || '—'}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1">Trạng thái</div>
            <div className="font-medium text-slate-800">{STATUS_LABEL[data.status]}</div>
          </div>
        </div>

        {/* Transportation Info Section - Conditional */}
        {data.transportationUnit && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded border border-blue-200">
            <div>
              <div className="text-xs font-semibold text-blue-600 mb-1">Đơn vị vận chuyển</div>
              <div className="font-medium text-slate-800">{data.transportationUnit}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-blue-600 mb-1">Mã vận đơn</div>
              <div className="font-medium text-slate-800">{data.trackingNumber || '—'}</div>
            </div>
          </div>
        )}

        {/* Items Section */}
        <div>
          <h4 className="font-semibold text-sm mb-3">Chi tiết hàng nhận ({data.items.length} dòng)</h4>
          <div className="border rounded overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-100 border-b">
                  <th className="px-3 py-2 text-left font-semibold">#</th>
                  <th className="px-3 py-2 text-left font-semibold">Tên hàng</th>
                  <th className="px-3 py-2 text-center font-semibold">SL đặt</th>
                  <th className="px-3 py-2 text-center font-semibold">Nhận</th>
                  <th className="px-3 py-2 text-center font-semibold">Chấp nhận</th>
                  <th className="px-3 py-2 text-center font-semibold">Từ chối</th>
                  <th className="px-3 py-2 text-left font-semibold">Lô / Vị trí</th>
                  <th className="px-3 py-2 text-left font-semibold">QC Note</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, idx) => (
                  <tr key={item.id} className="border-b hover:bg-slate-50">
                    <td className="px-3 py-2 text-slate-600">{idx + 1}</td>
                    <td className="px-3 py-2 font-medium text-slate-800">
                      <div>{item.productName}</div>
                      <div className="text-xs text-slate-500">{item.specification}</div>
                    </td>
                    <td className="px-3 py-2 text-center">{item.orderedQuantity}</td>
                    <td className="px-3 py-2 text-center font-medium">{item.receivedQuantity}</td>
                    <td className="px-3 py-2 text-center font-medium text-green-700">{item.acceptedQuantity}</td>
                    <td className="px-3 py-2 text-center font-medium text-red-700">{item.rejectedQuantity}</td>
                    <td className="px-3 py-2 text-xs text-slate-600">
                      <div>{item.lotNumber}</div>
                      <div>{item.warehouseLocation}</div>
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600">{item.qcNote}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Section */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded border">
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1">Tổng nhận</div>
            <div className="font-bold text-lg text-slate-800">{data.totalReceived}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-green-600 mb-1">Chấp nhận</div>
            <div className="font-bold text-lg text-green-700">{data.totalAccepted}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-red-600 mb-1">Từ chối</div>
            <div className="font-bold text-lg text-red-700">{data.totalRejected}</div>
          </div>
        </div>

        {/* QC Status Section */}
        <div className={`p-4 rounded border ${
          data.qcStatus === 'passed' ? 'bg-green-50 border-green-200' :
          data.qcStatus === 'failed' ? 'bg-red-50 border-red-200' :
          'bg-amber-50 border-amber-200'
        }`}>
          <div className="text-sm font-semibold">
            {data.qcStatus === 'passed' ? '✓' : data.qcStatus === 'failed' ? '✕' : '⏳'} QC: {QC_STATUS_LABEL[data.qcStatus]}
          </div>
        </div>

        {/* Notes Section - Conditional */}
        {data.notes && (
          <div>
            <h4 className="font-semibold text-sm mb-2">Ghi chú</h4>
            <div className="p-4 bg-slate-50 rounded border text-sm text-slate-700">{data.notes}</div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Đóng
        </Button>
      </div>
    </Modal>
  )
}
```

Key changes:
- Header info: Changed from `grid-cols-2 gap-3` to `grid-cols-2 gap-4` with updated label styling (added `font-medium`)
- All field blocks now follow consistent pattern: label with `text-xs font-medium`, then value
- Updated padding from `p-3` to `p-4` for breathing room
- Transportation section: Updated label styling to match
- Items table: Updated header styling from `px-2` to `px-3` for consistency
- Summary: Updated padding and label styling
- Notes: Conditional render only if `data.notes` exists

- [ ] **Step 3: Verify no TypeScript errors**

Run: `npm run build`
Expected: No TypeScript errors in this file

- [ ] **Step 4: Test the modal visually in browser**

1. Run dev server: `npm run dev`
2. Navigate to Goods Receipts page
3. Click on a GRN code to open detail modal
4. Verify:
   - Header info displays in 2-column grid with proper spacing
   - Transportation section appears (if data exists) with blue background
   - Items table displays correctly
   - Summary shows 3 columns with proper colors
   - QC status block is color-coded correctly
   - Notes appear only if they exist
   - All text is readable and properly formatted
   - Modal is scrollable and footer buttons are visible

- [ ] **Step 5: Commit changes**

```bash
git add src/features/goods-receipts/components/GoodsReceiptDetailModal.tsx
git commit -m "refactor: update GoodsReceiptDetailModal to form-like grid layout"
```

---

## Task 2: Refactor InvoiceDetailModal to Form-Like Layout

**Files:**
- Modify: `src/features/goods-receipts/components/InvoiceDetailModal.tsx`

- [ ] **Step 1: Read the current InvoiceDetailModal**

Understand current structure:
- Modal title with invoice code
- Header info grid (code, status, poCode, supplierName, invoiceDate, dueDate, total)
- Items table showing GRN details
- Summary section (total amount)
- Approval info (conditional)
- Notes (conditional)

- [ ] **Step 2: Replace the entire content section with refactored grid-based layout**

Replace the content section with new structure:

```tsx
export function InvoiceDetailModal({ open, onOpenChange, data }: InvoiceDetailModalProps) {
  return (
    <Modal open={open} onClose={() => onOpenChange(false)} title={`Chi tiết hóa đơn: ${data.code}`}>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Header Info Section */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded border">
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1">Mã Hóa đơn</div>
            <div className="font-semibold text-slate-800">{data.code}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1">Trạng thái TT</div>
            <div>
              <StatusBadge variant={data.status?.toLowerCase() === 'paid' ? 'success' : data.status?.toLowerCase() === 'partial' ? 'warning' : 'info'}>
                {data.status === 'paid' ? 'Đã TT' : data.status === 'partial' ? 'Tạm' : 'Chờ TT'}
              </StatusBadge>
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1">Liên kết PO</div>
            <div className="font-medium text-slate-800">{data.poCode}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1">Nhà cung cấp</div>
            <div className="font-medium text-slate-800">{data.supplierName}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1">Ngày xuất</div>
            <div className="font-medium text-slate-800">{data.invoiceDate}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1">Hạn thanh toán</div>
            <div className="font-medium text-slate-800">{data.dueDate}</div>
          </div>
        </div>

        {/* Amounts Section */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded border">
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1">Tổng tiền</div>
            <div className="font-bold text-lg text-slate-800">{data.total.toLocaleString('vi-VN')} ₫</div>
          </div>
          <div>
            <div className="text-xs font-medium text-green-600 mb-1">Đã thanh toán</div>
            <div className="font-bold text-lg text-green-700">{(data.paid || 0).toLocaleString('vi-VN')} ₫</div>
          </div>
          <div>
            <div className="text-xs font-medium text-amber-600 mb-1">Còn lại</div>
            <div className="font-bold text-lg text-amber-700">{(data.total - (data.paid || 0)).toLocaleString('vi-VN')} ₫</div>
          </div>
        </div>

        {/* Items Section - Linked GRNs */}
        <div>
          <h4 className="font-semibold text-sm mb-3">Phiếu nhập kho liên kết ({data.grnCodes?.length || 0})</h4>
          <div className="border rounded overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-100 border-b">
                  <th className="px-3 py-2 text-left font-semibold">Mã GRN</th>
                  <th className="px-3 py-2 text-left font-semibold">Nhà cung cấp</th>
                </tr>
              </thead>
              <tbody>
                {data.grnCodes?.map((code, idx) => (
                  <tr key={idx} className="border-b hover:bg-slate-50">
                    <td className="px-3 py-2 font-medium text-indigo-600">{code}</td>
                    <td className="px-3 py-2 text-slate-600">—</td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan={2} className="px-3 py-2 text-slate-500 text-center">Không có GRN liên kết</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Info Section - Conditional */}
        {data.paid && data.paid > 0 && (
          <div className="p-4 bg-green-50 rounded border border-green-200">
            <div className="text-sm font-semibold text-green-700 mb-2">✓ Đã thanh toán</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs text-green-600 font-medium mb-1">Số tiền</div>
                <div className="font-medium text-slate-800">{data.paid.toLocaleString('vi-VN')} ₫</div>
              </div>
              <div>
                <div className="text-xs text-green-600 font-medium mb-1">Ngày thanh toán</div>
                <div className="font-medium text-slate-800">{data.paidDate || '—'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Notes Section - Conditional */}
        {data.notes && (
          <div>
            <h4 className="font-semibold text-sm mb-2">Ghi chú</h4>
            <div className="p-4 bg-slate-50 rounded border text-sm text-slate-700">{data.notes}</div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Đóng
        </Button>
      </div>
    </Modal>
  )
}
```

Key changes:
- Header info: Now in 2-column grid with updated label styling
- New amounts section: 3-column grid showing total, paid, and remaining amounts with color-coded labels
- GRN items table: Changed header from generic to show linked GRNs (instead of invoice items)
- Payment info: Conditional section with green background that appears only if paid
- Notes: Conditional render only if exists
- All field labels: Consistent `text-xs font-medium` styling
- Padding: Updated to `p-4` for consistency

- [ ] **Step 3: Check if Invoice type needs updates**

Read `src/features/goods-receipts/types.ts` to verify Invoice type has the fields used:
- `code`, `status`, `poCode`, `supplierName`, `invoiceDate`, `dueDate`
- `total`, `paid` (optional), `paidDate` (optional)
- `grnCodes` (array), `notes` (optional)

If any fields are missing, note them but don't add them — they may be optional.

- [ ] **Step 4: Verify no TypeScript errors**

Run: `npm run build`
Expected: No TypeScript errors in this file

- [ ] **Step 5: Test the modal visually in browser**

1. Keep dev server running
2. Navigate to Goods Receipts page, click on "Hóa đơn" tab
3. Click on an invoice code to open detail modal
4. Verify:
   - Header info displays in 2-column grid
   - Amounts section shows total, paid, remaining with proper colors
   - GRN table shows linked receipts correctly
   - Payment info appears only if invoice is paid (with green background)
   - Notes appear only if they exist
   - Status badge displays correctly
   - All formatting and spacing matches GoodsReceiptDetailModal
   - Modal scrolls properly

- [ ] **Step 6: Commit changes**

```bash
git add src/features/goods-receipts/components/InvoiceDetailModal.tsx
git commit -m "refactor: update InvoiceDetailModal to form-like grid layout"
```

---

## Self-Review Checklist

✓ **Spec coverage:** 
- Form-like grid layout for both modals ✓
- 2-3 column grid sections ✓
- Optional sections hidden when empty ✓
- Consistent styling with slate-50 backgrounds ✓
- Color-coded sections (blue for transportation, green for payment) ✓
- Items table structure preserved ✓
- Scrollable containers with fixed buttons ✓

✓ **Placeholder scan:** No TBD, TODO, or incomplete steps

✓ **Type consistency:** All field names match existing data structures

✓ **Scope check:** Focused refactoring of two components, no unrelated changes
