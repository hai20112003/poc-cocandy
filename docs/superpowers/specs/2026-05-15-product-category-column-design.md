---
name: Product Category Column in Purchase Request Form
description: Add product category/type selection before product selection with filtered product list
type: spec
date: 2026-05-15
---

# Product Category Column Design

## Overview

Add a product category selection field to the purchase request form that enables filtering of available products by type. Users must select a product category ("Nguyên phụ liệu" or "Thành phẩm") before selecting a specific product.

## Requirements

### Functional Requirements

1. **Product Category Field**
   - Add a select field for product category before the product field
   - Two fixed options: "Nguyên phụ liệu" (Raw Materials) and "Thành phẩm" (Finished Products)
   - Field is mandatory - must be selected before selecting a product
   - Position: First column in the first row of each item

2. **Product Field Behavior**
   - Product select is disabled until a category is selected
   - When category is selected, product list is filtered to show only products in that category
   - When category is changed, product selection is reset (clear the product field)
   - Product select remains populated when switching between categories, but updates available options

3. **Product Data Organization**
   - Organize existing products into appropriate categories
   - Add new products to ensure both categories have sufficient options
   - Each product maintains its unit mapping

4. **Data Persistence**
   - Store `productCategory` in the `PurchaseRequestItem` data structure
   - Category is saved and displayed when viewing/editing a request

### UI Layout

**Current Layout (before changes):**
```
Row 1 (3 cols): [Product] [Specification] [Quantity]
Row 2 (3 cols): [Unit (readonly)] [EstimatedPrice] [SuggestedSupplier]
```

**New Layout:**
```
Row 1 (3 cols): [ProductCategory▼] [Product▼] [Specification]
Row 2 (1 col):  [Quantity]
Row 3 (3 cols): [Unit (readonly)] [EstimatedPrice] [SuggestedSupplier▼]
```

## Data Structure Changes

### PurchaseRequestItem Interface Update

```typescript
export interface PurchaseRequestItem {
  id: string
  productCategory: 'Nguyên phụ liệu' | 'Thành phẩm'  // NEW
  productName: string
  specification: string
  quantity: number
  unit: string
  estimatedPrice: number
  suggestedSupplier?: string
}
```

### Product Data Structure

```typescript
interface Product {
  name: string
  unit: string
}

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
    // Add more raw materials as needed
  ],
  'Thành phẩm': [
    { name: 'Áo Sơ Mi Cotton', unit: 'cái' },
    { name: 'Quần Tây Nam', unit: 'cái' },
    { name: 'Đầm Nữ Công Sở', unit: 'cái' },
    { name: 'Áo Thun In Logo', unit: 'cái' },
    { name: 'Quần Jeans Nam', unit: 'cái' },
    { name: 'Áo Khoác Nữ', unit: 'cái' },
    // Add more finished products as needed
  ]
}
```

## Implementation Details

### Component Changes

**PurchaseRequestModal.tsx**

1. Update initial state to include `productCategory` with empty string default:
```typescript
items: data?.items ?? [
  {
    id: '1',
    productCategory: '',  // NEW
    productName: '',
    // ... rest of fields
  }
]
```

2. Add new handler for category changes:
```typescript
function handleCategoryChange(itemId: string, category: string) {
  setFormData((prev) => ({
    ...prev,
    items: prev.items.map((item) =>
      item.id === itemId
        ? { ...item, productCategory: category, productName: '' }  // Reset product when category changes
        : item
    ),
  }))
}
```

3. Update `handleProductChange` to accept category as context for filtering

4. Restructure the items grid:
   - First grid (cols-3): ProductCategory, ProductName, Specification
   - Second grid (cols-1): Quantity
   - Third grid (cols-3): Unit, EstimatedPrice, SuggestedSupplier

### State Management

No changes needed to store or hooks - only component-level state changes.

## Interaction Flow

1. **New Item Added**
   - Default `productCategory` is empty string
   - Product select is disabled with placeholder "-- Chọn loại sản phẩm trước --"

2. **User Selects Category**
   - Product list filters to show only products in selected category
   - Product select becomes enabled
   - Product field is cleared (reset to empty)

3. **User Selects Product**
   - Unit field auto-fills based on product's unit
   - Form is ready for quantity and other fields

4. **User Changes Category**
   - Product field is reset
   - Product list updates to new category's products

## Validation

- Category must be selected before product can be selected
- On form submit, validate that all items have:
  - Valid `productCategory` (not empty)
  - Valid `productName` (not empty)
  - Valid `quantity` (> 0)

## Error Handling

- If category is not selected and user tries to select product: show disabled state with hint
- If category selection fails: display error message

## Testing Considerations

1. **Happy Path**
   - User selects category → product list filters correctly
   - User selects product → unit auto-fills
   - Form submits successfully with category data

2. **Edge Cases**
   - Switching between categories with different products
   - Product data is loaded correctly for both categories
   - Adding multiple items with different categories

3. **Data Validation**
   - Category is saved in item data
   - Category is displayed when viewing/editing existing request

## Files to Modify

- `src/features/purchase-requests/components/PurchaseRequestModal.tsx` - Main form component
- `src/features/purchase-requests/types.ts` - Update PurchaseRequestItem interface

## Files to Add

- None (using existing component structure)

## Backward Compatibility

- Existing purchase requests without `productCategory` field should handle gracefully
- UI displays category field but doesn't break if missing from old data
- Consider migration strategy if needed

## Future Enhancements

- Load product categories and products from API instead of hardcoded data
- Add product category management page
- Filter products by multiple criteria (category + supplier + etc)
