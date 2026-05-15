# Product Category Column Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add product category selection to purchase request form with filtered product list based on selected category.

**Architecture:** Update PurchaseRequestItem type to include productCategory field, restructure PurchaseRequestModal component to show category select first (required), then filtered product select. Products are organized by category in component state.

**Tech Stack:** React, TypeScript, Tailwind CSS, existing UI components (Select, Input, Button)

---

## File Structure

- **Modify:** `src/features/purchase-requests/types.ts` - Add `productCategory` to PurchaseRequestItem interface
- **Modify:** `src/features/purchase-requests/components/PurchaseRequestModal.tsx` - Add product data by category, category select field, product filtering logic, grid restructuring

---

## Task 1: Update PurchaseRequestItem Type

**Files:**
- Modify: `src/features/purchase-requests/types.ts:1-25`

- [ ] **Step 1: Read current types file**

```bash
cat src/features/purchase-requests/types.ts
```

Expected: See PurchaseRequestItem interface with id, productName, specification, quantity, unit, estimatedPrice, suggestedSupplier fields

- [ ] **Step 2: Add productCategory field to PurchaseRequestItem**

In `src/features/purchase-requests/types.ts`, update the PurchaseRequestItem interface:

```typescript
export interface PurchaseRequestItem {
  id: string
  productCategory: 'Nguyên phụ liệu' | 'Thành phẩm'
  productName: string
  specification: string
  quantity: number
  unit: string
  estimatedPrice: number
  suggestedSupplier?: string
}
```

- [ ] **Step 3: Verify types file is valid TypeScript**

```bash
npx tsc --noEmit src/features/purchase-requests/types.ts
```

Expected: No errors

- [ ] **Step 4: Commit the type changes**

```bash
git add src/features/purchase-requests/types.ts
git commit -m "types: add productCategory field to PurchaseRequestItem

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Add Product Data by Category to Component

**Files:**
- Modify: `src/features/purchase-requests/components/PurchaseRequestModal.tsx:1-50`

- [ ] **Step 1: Read current component to find where PRODUCTS is defined**

Look for the PRODUCTS array definition in PurchaseRequestModal.tsx (around line 35-45)

- [ ] **Step 2: Replace PRODUCTS array with PRODUCTS_BY_CATEGORY object**

After the SUPPLIERS array definition, add this before the component function:

```typescript
const PRODUCTS_BY_CATEGORY = {
  'Nguyên phụ liệu': [
    { name: 'Vải Cotton Trắng', unit: 'mét' },
    { name: 'Vải Cotton Xanh Navy', unit: 'mét' },
    { name: 'Vải Cotton Đỏ Đô', unit: 'mét' },
    { name: 'Vải Lụa Kem', unit: 'mét' },
    { name: 'Khóa Kéo 20cm', unit: 'cái' },
    { name: 'Nút Áo 4 Lỗ', unit: 'cái' },
    { name: 'Chỉ May Lụa', unit: 'cuộn' },
    { name: 'Mex Lót Mỏng', unit: 'mét' },
    { name: 'Túi Nilon 10x20', unit: 'cái' },
  ],
  'Thành phẩm': [
    { name: 'Áo Sơ Mi Cotton', unit: 'cái' },
    { name: 'Quần Tây Nam', unit: 'cái' },
    { name: 'Đầm Nữ Công Sở', unit: 'cái' },
    { name: 'Áo Thun In Logo', unit: 'cái' },
    { name: 'Quần Jeans Nam', unit: 'cái' },
    { name: 'Áo Khoác Nữ', unit: 'cái' },
  ],
}
```

- [ ] **Step 3: Remove old PRODUCTS array**

Delete the old PRODUCTS array that was on lines 35-45

- [ ] **Step 4: Update references to PRODUCTS in handleProductChange**

In the `handleProductChange` function (around line 81), update to use the categorized products:

Replace:
```typescript
function handleProductChange(itemId: string, productName: string) {
  const product = PRODUCTS.find((p) => p.name === productName)
  handleItemChange(itemId, 'productName', productName)
  if (product) {
    handleItemChange(itemId, 'unit', product.unit)
  }
}
```

With:
```typescript
function handleProductChange(itemId: string, productName: string) {
  const item = formData.items.find((i) => i.id === itemId)
  const category = item?.productCategory
  if (!category) return
  
  const products = PRODUCTS_BY_CATEGORY[category as 'Nguyên phụ liệu' | 'Thành phẩm']
  const product = products.find((p) => p.name === productName)
  handleItemChange(itemId, 'productName', productName)
  if (product) {
    handleItemChange(itemId, 'unit', product.unit)
  }
}
```

- [ ] **Step 5: Commit these changes**

```bash
git add src/features/purchase-requests/components/PurchaseRequestModal.tsx
git commit -m "feat: add product data organized by category

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Update Initial State to Include Product Category

**Files:**
- Modify: `src/features/purchase-requests/components/PurchaseRequestModal.tsx:16-33`

- [ ] **Step 1: Locate the initial state in the component**

Find the useState hook for formData (around line 17)

- [ ] **Step 2: Update default item structure to include productCategory**

In the initial state where items are defined:

```typescript
const [formData, setFormData] = useState({
  department: data?.department ?? '',
  neededDate: data?.neededDate ?? '',
  priority: data?.priority ?? 'medium',
  items: data?.items ?? [
    {
      id: '1',
      productCategory: '',
      productName: '',
      specification: '',
      quantity: 0,
      unit: 'mét',
      estimatedPrice: 0,
      suggestedSupplier: '',
    },
  ],
  notes: data?.notes ?? '',
})
```

Make sure the default item includes `productCategory: ''`

- [ ] **Step 3: Verify component still builds**

```bash
npm run build 2>&1 | head -30
```

Expected: Build succeeds or shows only type-related warnings that will be fixed by next tasks

- [ ] **Step 4: Commit state changes**

```bash
git add src/features/purchase-requests/components/PurchaseRequestModal.tsx
git commit -m "feat: add productCategory to initial form state

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Add Category Change Handler

**Files:**
- Modify: `src/features/purchase-requests/components/PurchaseRequestModal.tsx:55-90`

- [ ] **Step 1: Add handleCategoryChange function**

Add this function after handleProductChange (around line 88):

```typescript
function handleCategoryChange(itemId: string, category: string) {
  setFormData((prev) => ({
    ...prev,
    items: prev.items.map((item) =>
      item.id === itemId
        ? { ...item, productCategory: category, productName: '' }
        : item
    ),
  }))
}
```

- [ ] **Step 2: Verify function is placed correctly**

Check that the function is defined before the render return statement and can access formData and setFormData

- [ ] **Step 3: Test that component still compiles**

```bash
npx tsc --noEmit src/features/purchase-requests/components/PurchaseRequestModal.tsx
```

Expected: No errors

- [ ] **Step 4: Commit handler function**

```bash
git add src/features/purchase-requests/components/PurchaseRequestModal.tsx
git commit -m "feat: add handleCategoryChange to reset product on category change

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Restructure Item Grid Layout

**Files:**
- Modify: `src/features/purchase-requests/components/PurchaseRequestModal.tsx:153-223`

- [ ] **Step 1: Locate the current items grid structure**

Find the section that starts with `{/* Items Table */}` (around line 153)

- [ ] **Step 2: Replace the first grid (product, specification, quantity) with new structure**

Replace the first grid section (lines 160-189) with:

```typescript
<div className="grid grid-cols-3 gap-2">
  <div>
    <label className="text-xs">Loại sản phẩm</label>
    <Select 
      value={item.productCategory || ''} 
      onValueChange={(val) => handleCategoryChange(item.id, val || '')}
    >
      <option value="">-- Chọn --</option>
      <option value="Nguyên phụ liệu">Nguyên phụ liệu</option>
      <option value="Thành phẩm">Thành phẩm</option>
    </Select>
  </div>
  <div>
    <label className="text-xs">Sản phẩm</label>
    {!item.productCategory ? (
      <div className="w-full px-3 py-2 border rounded text-sm bg-slate-100 text-slate-500">
        -- Chọn loại sản phẩm trước --
      </div>
    ) : (
      <Select 
        value={item.productName || ''} 
        onValueChange={(val) => handleProductChange(item.id, val || '')}
      >
        <option value="">-- Chọn --</option>
        {PRODUCTS_BY_CATEGORY[item.productCategory as 'Nguyên phụ liệu' | 'Thành phẩm'].map((p) => (
          <option key={p.name} value={p.name}>
            {p.name}
          </option>
        ))}
      </Select>
    )}
  </div>
  <div>
    <label className="text-xs">Đặc tả</label>
    <Input
      placeholder="Màu, khổ..."
      value={item.specification}
      onChange={(e) => handleItemChange(item.id, 'specification', e.target.value)}
    />
  </div>
</div>
```

- [ ] **Step 3: Add quantity row with single column**

After the grid above, add:

```typescript
<div className="grid grid-cols-1 gap-2 mt-2">
  <div>
    <label className="text-xs">Số lượng</label>
    <Input
      type="number"
      min="1"
      value={item.quantity}
      onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
    />
  </div>
</div>
```

- [ ] **Step 4: Verify the second grid (unit, price, supplier) remains unchanged**

The existing second grid section should remain as-is (lines 190-215)

- [ ] **Step 5: Remove old quantity input from first grid**

The old quantity input should no longer exist in the first grid - verify it's been replaced

- [ ] **Step 6: Test component renders**

```bash
npm run build 2>&1 | grep -E "error|warning" | head -10
```

Expected: Should build without errors related to these changes

- [ ] **Step 7: Commit layout restructuring**

```bash
git add src/features/purchase-requests/components/PurchaseRequestModal.tsx
git commit -m "feat: restructure item grid with category select and filtered products

- Add category select as first column in row 1
- Add filtered product select as second column in row 1
- Move quantity to separate row 2
- Add conditional disabled state for product select when category not selected

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Update Form Validation

**Files:**
- Modify: `src/features/purchase-requests/components/PurchaseRequestModal.tsx:91-106`

- [ ] **Step 1: Locate handleSubmit function**

Find the handleSubmit function (around line 91)

- [ ] **Step 2: Update validation to check for productCategory**

Replace the validation check:

```typescript
function handleSubmit() {
  if (!formData.department || !formData.neededDate || formData.items.length === 0) {
    alert('Vui lòng điền đầy đủ thông tin')
    return
  }

  // Check each item has required fields
  const hasInvalidItems = formData.items.some(
    (item) => !item.productCategory || !item.productName || item.quantity <= 0
  )
  
  if (hasInvalidItems) {
    alert('Vui lòng điền đầy đủ thông tin cho tất cả dòng hàng (loại sản phẩm, sản phẩm, số lượng)')
    return
  }

  const totalEstimated = formData.items.reduce((sum, item) => sum + item.quantity * item.estimatedPrice, 0)

  onSave({
    code: data?.code ?? `PR-${Date.now()}`,
    ...formData,
    totalEstimated,
    status: data?.status ?? 'draft',
    createdBy: data?.createdBy ?? 'Current User',
  })

  onOpenChange(false)
}
```

- [ ] **Step 3: Test validation works**

Verify component compiles:

```bash
npx tsc --noEmit src/features/purchase-requests/components/PurchaseRequestModal.tsx
```

Expected: No errors

- [ ] **Step 4: Commit validation updates**

```bash
git add src/features/purchase-requests/components/PurchaseRequestModal.tsx
git commit -m "feat: add validation for productCategory field

- Require productCategory to be selected for each item
- Provide clear error message if any item missing required fields

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Handle Backward Compatibility for Existing Data

**Files:**
- Modify: `src/features/purchase-requests/components/PurchaseRequestModal.tsx:16-33`

- [ ] **Step 1: Check how data is passed to component**

When existing purchase request is passed via the `data` prop, the items may not have productCategory

- [ ] **Step 2: Add safety check in initial state**

Modify the items mapping to ensure all items have productCategory:

```typescript
const [formData, setFormData] = useState({
  department: data?.department ?? '',
  neededDate: data?.neededDate ?? '',
  priority: data?.priority ?? 'medium',
  items: (data?.items ?? [
    {
      id: '1',
      productCategory: '',
      productName: '',
      specification: '',
      quantity: 0,
      unit: 'mét',
      estimatedPrice: 0,
      suggestedSupplier: '',
    },
  ]).map((item) => ({
    ...item,
    productCategory: item.productCategory || '',
  })),
  notes: data?.notes ?? '',
})
```

This ensures all items have productCategory field, even if coming from old data

- [ ] **Step 3: Verify component handles missing productCategory gracefully**

Test that opening an existing request without productCategory doesn't break:

```bash
npm run build 2>&1 | head -5
```

Expected: Build succeeds

- [ ] **Step 4: Commit backward compatibility handling**

```bash
git add src/features/purchase-requests/components/PurchaseRequestModal.tsx
git commit -m "feat: add backward compatibility for existing items without productCategory

- Ensure all items have productCategory field (default empty string)
- Prevents errors when loading old purchase requests

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Verify Complete Implementation

**Files:**
- Test: `src/features/purchase-requests/components/PurchaseRequestModal.tsx`

- [ ] **Step 1: Build the entire project**

```bash
npm run build
```

Expected: Build succeeds with no errors

- [ ] **Step 2: Start dev server and test manually**

```bash
npm run dev &
```

Wait for server to start (check localhost:5173 or your configured port)

- [ ] **Step 3: Test creating new purchase request**

- Open the application
- Click "Tạo mới" button to open PurchaseRequestModal
- Verify the form shows:
  - Row 1: Category select, Product select (disabled), Specification input
  - Row 2: Quantity input
  - Row 3: Unit, Price, Supplier

- [ ] **Step 4: Test category selection flow**

- Click on Category select
- Select "Nguyên phụ liệu"
- Verify Product select becomes enabled
- Verify only raw materials products appear in list
- Select a product and verify unit auto-fills

- [ ] **Step 5: Test category change behavior**

- Change Category from "Nguyên phụ liệu" to "Thành phẩm"
- Verify Product field is cleared
- Verify Product select now shows finished products only

- [ ] **Step 6: Test form validation**

- Try to submit without selecting category for any item
- Verify error message: "Vui lòng điền đầy đủ thông tin cho tất cả dòng hàng (loại sản phẩm, sản phẩm, số lượng)"
- Fill all fields and verify form submits

- [ ] **Step 7: Test add row functionality**

Click "Thêm dòng hàng" and verify:
- New row appears with empty category select
- Product select is disabled until category selected
- All handlers work correctly

- [ ] **Step 8: Test edit existing request**

- Create and save a purchase request with category
- Edit it and verify:
  - Category and product values are loaded correctly
  - Can change category and product
  - Form saves correctly

- [ ] **Step 9: Final commit with all changes**

Verify git status shows all changes are committed:

```bash
git status
```

Expected: Working tree clean (or only untracked files)

---

## Summary

✅ **Type Updates** - PurchaseRequestItem now includes productCategory field
✅ **Product Data** - Products organized by category (Nguyên phụ liệu, Thành phẩm)
✅ **UI Restructuring** - Grid layout changed to show category → product → spec on row 1, quantity on row 2
✅ **Product Filtering** - Product select filtered based on selected category
✅ **Conditional Disable** - Product select disabled until category selected
✅ **Category Handler** - Category change resets product selection
✅ **Form Validation** - Requires category selection for all items
✅ **Backward Compatibility** - Old data without category field handled gracefully
✅ **Manual Testing** - All features verified through UI interaction
