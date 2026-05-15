# Supplier Rating Feature Design

**Date:** 2026-05-15  
**Scope:** Add transaction-based supplier performance rating to purchase request workflow  
**Status:** Design Phase

---

## Overview

Currently, suppliers have a static rating field that's manually edited in the SupplierForm. This design introduces a transaction-level rating system where users can rate supplier performance for each completed purchase request.

### Goals
1. Capture supplier performance feedback tied to specific purchase transactions
2. Provide users an intuitive way to rate supplier performance after purchase completion
3. Store ratings directly on PR objects (demo simplification)
4. Foundation for future supplier performance analytics

### In Scope (v1)
- Add rating modal to PurchaseRequestDetail
- Store overallRating and ratingComment on PR object
- Allow users to submit/edit ratings when PR status is Converted/Completed

### Out of Scope (v1)
- Removing or modifying SupplierForm rating field (keep as-is for demo)
- Average rating calculation from transactions
- Rating history/analytics UI
- Role-based rating permissions
- Multi-dimensional ratings (quality, delivery, support separately)

---

## Requirements

### Functional Requirements

**FR1: Data Model**
- Add `overallRating` (number, 1-5) and `ratingComment` (string, optional) to `IPurchaseRequest` type
- Ratings stored directly on PR object, no separate collection

**FR2: Rating Availability**
- Rating UI appears only when PR status is `Converted` or `Completed`
- Any authenticated user can submit/edit ratings (no role restrictions for demo)

**FR3: Rating Submission**
- Modal form with:
  - 5-star rating selector (clickable, visual feedback)
  - Optional comment textarea (max 500 characters)
  - Save and Cancel buttons
- Form validation: overall rating is required, comment is optional
- After submission, data persists to store and UI updates to read-only view

**FR4: Rating Display**
- If rated: Show read-only star display + comment text + "Chỉnh sửa đánh giá" button
- If not rated: Show "Đánh giá" button to initiate rating
- Display in sidebar section "Đánh giá nhà cung cấp" (Supplier Rating)

**FR5: Edit Capability**
- Users can modify ratings after initial submission
- Same modal opens when clicking edit button
- Pre-fills current values

### Non-Functional Requirements
- Modal consistent with existing rejection modal styling
- Star rating interactive feedback (hover states, selection colors)
- Form validation before submission
- Optimistic updates (immediate UI feedback on submit)

---

## Architecture

### Data Model Changes

**IPurchaseRequest** (extend existing type)
```typescript
interface IPurchaseRequest {
  // ... existing fields
  overallRating?: number      // 1-5, undefined if not rated
  ratingComment?: string      // Optional comment, max 500 chars
}
```

### Component Structure

```
PRDetail.tsx
├── [Existing sections]
├── Right sidebar
│   ├── Implementation Progress (existing)
│   ├── Summary Card (existing)
│   └── ★ Supplier Rating Card
│       ├── Conditional: Show only when status is Converted/Completed
│       ├── If rated:
│       │   ├── Read-only star display
│       │   ├── Read-only comment text
│       │   └── "Chỉnh sửa đánh giá" button
│       └── If not rated:
│           └── "Đánh giá" button
│
└── ★ RatingModal.tsx (new component)
    ├── Modal header: "Đánh giá nhà cung cấp"
    ├── Star rating selector (interactive)
    ├── Comment textarea
    ├── Save button
    └── Cancel button
```

### State Management
- Use existing `procurementStore` with `updatePurchaseRequest` method
- No new store actions needed
- PR object updated directly with rating data

---

## Implementation Details

### 1. Type Updates
**File:** `src/features/purchaseRequest/types/index.ts` (or equivalent)
- Extend `IPurchaseRequest` interface with optional `overallRating` and `ratingComment` fields

### 2. New Component: RatingModal
**File:** `src/features/purchaseRequest/components/RatingModal.tsx`

**Props:**
```typescript
interface RatingModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { overallRating: number; ratingComment?: string }) => void
  currentRating?: number
  currentComment?: string
  supplierName?: string  // For display in modal title
}
```

**Features:**
- Star rating widget: 5 clickable stars, show filled/unfilled state
- Hover effect on stars (show rating preview on hover)
- Comment textarea: placeholder text, character counter (optional)
- Form validation: rating required, comment optional
- Submit button: disabled until rating selected
- Cancel button: closes modal without saving
- Loading state on submit (brief feedback)

### 3. PRDetail.tsx Modifications
**Location:** `src/features/purchaseRequest/pages/PRDetail.tsx`

**Changes:**
1. Import `RatingModal` component
2. Add state for modal visibility:
   ```typescript
   const [showRatingModal, setShowRatingModal] = useState(false)
   ```
3. Add "Supplier Rating" section in right sidebar (after Summary Card)
4. Render conditional UI:
   - If `purchaseRequest.overallRating` exists: show read-only rating + edit button
   - Else: show "Đánh giá" button
5. Handle rating submission:
   ```typescript
   const handleSubmitRating = (data: { overallRating: number; ratingComment?: string }) => {
     updatePurchaseRequest(id!, { ...purchaseRequest, ...data })
     setShowRatingModal(false)
   }
   ```
6. Pass props to `RatingModal` component

### 4. Store Updates (if needed)
**File:** `src/store/procurementStore.ts`

**Check:** Verify `updatePurchaseRequest` method exists and works as expected
- Should accept partial PR object update
- Should merge with existing PR data
- No new methods needed if existing update logic is sufficient

---

## UI/UX Specifications

### Rating Section Card (Sidebar)
- **Title:** "⭐ Đánh giá nhà cung cấp"
- **Background:** White with border, rounded corners (match existing cards)
- **Visibility:** Only show when status is `Converted` or `Completed`
- **Height:** Adaptive (collapsed if not rated, expands to show rating if rated)

### Star Rating Widget (Modal)
- **Display:** 5 stars, left-aligned, medium size (20-24px each)
- **States:**
  - Empty/unselected: ☆ (outline)
  - Hovered: ★ (filled, highlight color - blue/gold)
  - Selected: ★ (filled, solid color - gold/blue)
- **Interaction:** Click to select, hover to preview
- **Feedback:** Number display below stars (e.g., "4/5 sao")

### Comment Textarea
- **Placeholder:** "Nhập nhận xét về hiệu suất nhà cung cấp (tùy chọn)"
- **Max length:** 500 characters
- **Counter:** Show char count if needed (e.g., "120/500")
- **Styling:** Match existing form inputs (border, focus state)

### Modal Layout
- **Width:** 400-500px
- **Padding:** Consistent with rejection modal
- **Actions:** Cancel (left, secondary) | Save (right, primary)
- **Keyboard:** Esc to close, Enter to submit (if all valid)

---

## Testing Strategy

### Unit Tests
- **RatingModal component:** 
  - Star rating selection logic
  - Form validation (rating required, comment optional)
  - Form submission callback
  - Modal open/close states
  - Pre-fill existing values on edit

### Integration Tests
- **PRDetail with RatingModal:**
  - Modal appears/disappears correctly based on state
  - Submitted rating updates PR in store
  - Read-only display shows after submission
  - Edit button reopens modal with current values

### Manual Testing Checklist
- [ ] Modal opens on "Đánh giá" button click
- [ ] Stars respond to hover and click
- [ ] Comment textarea accepts text up to 500 chars
- [ ] Submit disabled until rating selected
- [ ] Submit updates PR in store
- [ ] Modal closes after submission
- [ ] Read-only rating displays correctly with stars + comment
- [ ] "Chỉnh sửa đánh giá" button opens modal with current values
- [ ] Rating section only visible when status is Converted/Completed
- [ ] Cancel button closes modal without saving
- [ ] Navigation away from page preserves rating data

---

## Success Criteria

1. ✓ Rating section appears in PRDetail only when status is `Converted` or `Completed`
2. ✓ Users can submit and view supplier ratings via modal
3. ✓ Ratings persist in store and survive page refresh
4. ✓ Users can edit existing ratings
5. ✓ UI matches existing design patterns (modal, buttons, styling)
6. ✓ Form validation prevents submission without rating
7. ✓ All form fields accept expected data types and constraints

---

## Files to Create/Modify

| File | Type | Change |
|------|------|--------|
| `src/features/purchaseRequest/types/index.ts` | Modify | Add `overallRating` and `ratingComment` to `IPurchaseRequest` |
| `src/features/purchaseRequest/components/RatingModal.tsx` | Create | New modal component for rating submission |
| `src/features/purchaseRequest/pages/PRDetail.tsx` | Modify | Add rating section + modal integration |
| `src/store/procurementStore.ts` | Check | Verify `updatePurchaseRequest` logic |

---

## Future Enhancements

- Calculate and display average supplier rating
- Show rating history/timeline per supplier
- Implement multi-dimensional ratings (quality, delivery, support)
- Add rating analytics dashboard
- Email notifications when PR receives rating
- Export ratings report

