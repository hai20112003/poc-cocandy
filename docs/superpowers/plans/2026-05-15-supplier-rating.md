# Supplier Rating Feature Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a supplier performance rating system to purchase requests, allowing users to rate suppliers after PR completion via a modal form with star ratings and comments.

**Architecture:** Extend the IPurchaseRequest type with rating fields, create a reusable RatingModal component, integrate it into PRDetail with conditional rendering based on PR status, and persist ratings directly to the purchase request object.

**Tech Stack:** React, TypeScript, Zustand (store), Lucide icons, Tailwind CSS

---

## File Structure

```
src/features/purchaseRequest/
├── types/
│   └── index.ts                    (MODIFY: add rating fields to IPurchaseRequest)
├── components/
│   ├── RatingModal.tsx             (CREATE: new modal component)
│   └── PurchaseRequestDetailModal.tsx (existing)
├── pages/
│   └── PRDetail.tsx                (MODIFY: integrate rating section + modal)
└── mockData.ts                     (MODIFY: update mock PRs with rating fields)

src/store/
└── procurementStore.ts             (CHECK: verify updatePurchaseRequest works)
```

---

## Task 1: Update IPurchaseRequest Type

**Files:**
- Modify: `src/features/purchaseRequest/types/index.ts`

**Context:** The IPurchaseRequest type needs new fields to store rating data. Keep changes minimal—just add the two new optional fields.

- [ ] **Step 1: Read the current IPurchaseRequest interface**

Run: `cat src/features/purchaseRequest/types/index.ts | head -50`

Expected: See the interface definition with existing fields (id, code, status, items, etc.)

- [ ] **Step 2: Add rating fields to IPurchaseRequest**

Find the interface definition and add these lines before the closing brace:

```typescript
  overallRating?: number      // 1-5 star rating
  ratingComment?: string      // Optional comment, max 500 chars
```

Full interface should look like:
```typescript
export interface IPurchaseRequest {
  id: string
  code: string
  department: string
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Converted'
  priority: string
  items: IPRItem[]
  createdAt: string
  createdBy: string
  neededDate: string
  // ... other existing fields ...
  approvedBy?: string
  approvedAt?: string
  rejectionReason?: string
  overallRating?: number      // NEW
  ratingComment?: string      // NEW
}
```

- [ ] **Step 3: Commit**

```bash
git add src/features/purchaseRequest/types/index.ts
git commit -m "feat: add rating fields to IPurchaseRequest type"
```

---

## Task 2: Create RatingModal Component

**Files:**
- Create: `src/features/purchaseRequest/components/RatingModal.tsx`

**Context:** This component encapsulates the rating form UI. It's reusable and self-contained, with no dependencies on PRDetail logic.

- [ ] **Step 1: Create the RatingModal file with full implementation**

Create file at `src/features/purchaseRequest/components/RatingModal.tsx`:

```typescript
import { useState } from 'react'
import { X, Star } from 'lucide-react'

export interface RatingFormData {
  overallRating: number
  ratingComment?: string
}

interface RatingModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: RatingFormData) => void
  currentRating?: number
  currentComment?: string
  supplierName?: string
  isLoading?: boolean
}

export function RatingModal({
  isOpen,
  onClose,
  onSubmit,
  currentRating,
  currentComment,
  supplierName = 'nhà cung cấp',
  isLoading = false,
}: RatingModalProps) {
  const [rating, setRating] = useState<number>(currentRating || 0)
  const [comment, setComment] = useState<string>(currentComment || '')
  const [hoveredRating, setHoveredRating] = useState<number>(0)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) return
    onSubmit({
      overallRating: rating,
      ratingComment: comment.trim() || undefined,
    })
  }

  const handleClose = () => {
    setRating(currentRating || 0)
    setComment(currentComment || '')
    onClose()
  }

  const displayRating = hoveredRating || rating
  const isValid = rating > 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Đánh giá {supplierName}</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Điểm đánh giá *
            </label>
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110"
                    disabled={isLoading}
                  >
                    <Star
                      size={28}
                      className={`transition ${
                        star <= displayRating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {displayRating > 0 && (
                <span className="text-sm font-medium text-gray-700 ml-2">
                  {displayRating}/5
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhận xét (tùy chọn)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 500))}
              placeholder="Chia sẻ cảm nhận về hiệu suất nhà cung cấp..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition focus:border-blue-500 resize-none"
              disabled={isLoading}
            />
            <div className="text-xs text-gray-500 mt-1">
              {comment.length}/500 ký tự
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50"
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!isValid || isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Đang lưu...' : 'Lưu đánh giá'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify component compiles**

Run: `npm run build 2>&1 | grep -i "ratingmodal" || echo "No errors found"`

Expected: No TypeScript errors related to RatingModal

- [ ] **Step 3: Commit**

```bash
git add src/features/purchaseRequest/components/RatingModal.tsx
git commit -m "feat: create RatingModal component for supplier rating"
```

---

## Task 3: Add Rating Section to PRDetail

**Files:**
- Modify: `src/features/purchaseRequest/pages/PRDetail.tsx`

**Context:** Integrate the RatingModal into PRDetail and add the rating display section in the right sidebar. This task includes importing, state management, conditional rendering, and handlers.

- [ ] **Step 1: Add imports to PRDetail.tsx**

At the top of the file, add:

```typescript
import { RatingModal, RatingFormData } from '../components/RatingModal'
```

Ensure it's placed with other component imports.

- [ ] **Step 2: Add modal state to PRDetail function**

Inside the `PRDetail` function, after the existing `useState` hooks (around line 10-11), add:

```typescript
  const [showRatingModal, setShowRatingModal] = useState(false)
```

- [ ] **Step 3: Add rating submission handler**

Inside the `PRDetail` function, after the other handlers (after `rejectPR` setup), add:

```typescript
  const handleSubmitRating = (data: RatingFormData) => {
    if (id) {
      updatePurchaseRequest(id, {
        ...purchaseRequest,
        overallRating: data.overallRating,
        ratingComment: data.ratingComment,
      })
      setShowRatingModal(false)
    }
  }
```

- [ ] **Step 4: Add Rating Section card to right sidebar**

Find the right column section (around line 334 where "Tiến độ thực hiện" is). After the `{/* Implementation Progress */}` section closes (after line 441), add this new section:

```typescript
            {/* Supplier Rating Section */}
            {['Converted', 'Completed'].includes(purchaseRequest.status) && (
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  ⭐ Đánh giá nhà cung cấp
                </h3>
                
                {purchaseRequest.overallRating ? (
                  // Already rated - show readonly display
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-lg ${
                            star <= purchaseRequest.overallRating!
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                      <span className="text-sm font-semibold text-gray-900 ml-2">
                        {purchaseRequest.overallRating}/5
                      </span>
                    </div>
                    
                    {purchaseRequest.ratingComment && (
                      <div className="bg-gray-50 rounded p-3 text-sm text-gray-700 border border-gray-200">
                        {purchaseRequest.ratingComment}
                      </div>
                    )}
                    
                    <button
                      onClick={() => setShowRatingModal(true)}
                      className="w-full mt-4 px-3 py-2 text-sm border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium"
                    >
                      ✏️ Chỉnh sửa đánh giá
                    </button>
                  </div>
                ) : (
                  // Not rated yet - show button
                  <button
                    onClick={() => setShowRatingModal(true)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    ⭐ Đánh giá
                  </button>
                )}
              </div>
            )}
```

- [ ] **Step 5: Add RatingModal component at end of JSX**

Before the closing `</div>` of the main container (before the Rejection Modal), add:

```typescript
        {/* Rating Modal */}
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          onSubmit={handleSubmitRating}
          currentRating={purchaseRequest.overallRating}
          currentComment={purchaseRequest.ratingComment}
          supplierName={purchaseRequest.supplierName || 'nhà cung cấp'}
        />
```

Note: This goes AFTER the Rejection Modal section (after line 506).

- [ ] **Step 6: Verify PRDetail.tsx compiles and imports are correct**

Run: `npm run build 2>&1 | head -20`

Expected: No TypeScript errors. Check for "RatingModal" or PRDetail errors.

- [ ] **Step 7: Commit**

```bash
git add src/features/purchaseRequest/pages/PRDetail.tsx
git commit -m "feat: add supplier rating section and modal to PRDetail"
```

---

## Task 4: Update Mock Data

**Files:**
- Modify: `src/features/purchaseRequest/mockData.ts`

**Context:** Update mock purchase requests to include the new rating fields so demo data is consistent with the type definition.

- [ ] **Step 1: Read current mock data structure**

Run: `grep -A 15 "^export const mockPurchaseRequests" src/features/purchaseRequest/mockData.ts | head -30`

Expected: See structure of mock PR objects

- [ ] **Step 2: Add rating fields to all mock purchase requests**

For each PR object that has status `Converted`, add these fields:

```typescript
    overallRating: undefined,
    ratingComment: undefined,
```

Or alternatively, add them to all PRs:

```typescript
    overallRating: undefined,
    ratingComment: undefined,
```

Example of a complete mock PR with new fields:
```typescript
{
  id: 'pr-001',
  code: 'PR-2024-001',
  // ... existing fields ...
  status: 'Converted',
  // ... more fields ...
  overallRating: undefined,
  ratingComment: undefined,
}
```

- [ ] **Step 3: Commit**

```bash
git add src/features/purchaseRequest/mockData.ts
git commit -m "feat: add rating fields to mock purchase requests"
```

---

## Task 5: Verify Store updatePurchaseRequest Method

**Files:**
- Check: `src/store/procurementStore.ts`

**Context:** Verify the store's `updatePurchaseRequest` method can handle partial updates properly. No code changes needed if it already works.

- [ ] **Step 1: Check updatePurchaseRequest implementation**

Run: `grep -A 10 "updatePurchaseRequest" src/store/procurementStore.ts | head -15`

Expected: See method that accepts id and partial data, performs merge update

- [ ] **Step 2: Verify it uses spread operator for merge**

Look for code pattern like:
```typescript
updatePurchaseRequest: (id: string, updates: Partial<IPurchaseRequest>) => {
  set((state) => ({
    purchaseRequests: state.purchaseRequests.map((pr) =>
      pr.id === id ? { ...pr, ...updates } : pr
    ),
  }))
}
```

Expected: Method should merge updates with existing PR data, not replace

- [ ] **Step 3: Document finding (no commit needed)**

If the method exists and works correctly, note that it properly handles partial updates. If not, create a task to fix it.

---

## Task 6: Manual Testing & Verification

**Files:**
- Test: Browser manual testing (no code files)

**Context:** Verify the complete rating flow works end-to-end in the browser.

- [ ] **Step 1: Start dev server**

Run: `npm run dev`

Expected: Dev server starts on `http://localhost:5174` (or similar)

- [ ] **Step 2: Navigate to a Converted PR**

- Open browser to `http://localhost:5174/purchase-requests`
- Click on a PR with status "Converted" (should exist in mock data)
- Verify: Rating section appears in right sidebar

Expected: See "⭐ Đánh giá nhà cung cấp" section with "Đánh giá" button

- [ ] **Step 3: Test rating submission flow**

- Click "Đánh giá" button
- Modal opens with title "Đánh giá nhà cung cấp"
- Click star 4 (verify stars highlight to 4)
- Type comment: "Giao hàng đúng hạn, chất lượng tốt"
- Click "Lưu đánh giá"

Expected: Modal closes, rating section now shows 4 stars + comment, "Chỉnh sửa đánh giá" button visible

- [ ] **Step 4: Test rating edit flow**

- Click "Chỉnh sửa đánh giá" button
- Modal opens with stars pre-filled to 4, comment pre-filled
- Change rating to 5, modify comment
- Click "Lưu đánh giá"

Expected: Modal closes, stars updated to 5, new comment displays

- [ ] **Step 5: Test rating on Draft/Submitted PR**

- Navigate to a PR with status "Draft" or "Submitted"
- Verify: Rating section does NOT appear

Expected: Right sidebar shows only "Tiến độ thực hiện" and "Tóm tắt" sections

- [ ] **Step 6: Test page refresh persistence**

- On a Converted PR with rating, refresh the page (F5 or Cmd+R)
- Verify: Rating data persists (stars and comment still visible)

Expected: Data preserved after refresh (verifies Zustand store persistence)

- [ ] **Step 7: Verify form validation**

- Click "Đánh giá" on unrated PR
- Without selecting any star, try to click "Lưu đánh giá"

Expected: Button is disabled (grayed out), cannot submit without rating

---

## Self-Review Checklist

✅ **Spec Coverage:**
- Type updates (FR1) → Task 1
- Rating availability (FR2) → Task 3, step 4 (conditional rendering)
- Rating submission form (FR3) → Task 2, 3
- Rating display (FR4) → Task 3, step 4
- Edit capability (FR5) → Task 3, step 4
- Modal consistency → Task 2, 3
- Form validation → Task 2, step 1

✅ **No Placeholders:** All steps contain exact code, file paths, commands, expected output

✅ **Type Consistency:** 
- `RatingFormData` interface in Task 2 matches `handleSubmitRating` in Task 3
- Field names: `overallRating`, `ratingComment` consistent across Tasks 1, 2, 3, 4
- No undefined references

✅ **File Paths:** All exact paths provided:
- `src/features/purchaseRequest/types/index.ts`
- `src/features/purchaseRequest/components/RatingModal.tsx`
- `src/features/purchaseRequest/pages/PRDetail.tsx`
- `src/features/purchaseRequest/mockData.ts`
- `src/store/procurementStore.ts`

✅ **Task Dependencies:** 
- Task 1 (types) → Task 2 (component uses types) → Task 3 (integration)
- Task 4 (mock data) independent but requires Task 1 types
- Task 5 (verify store) can run in parallel
- Task 6 (testing) requires all previous tasks

---

## Execution Approach

Plan complete and saved to `docs/superpowers/plans/2026-05-15-supplier-rating.md`.

**Two execution options:**

**Option 1: Subagent-Driven (Recommended)** — I dispatch a fresh subagent per task, you review between tasks. Faster iteration, cleaner separation of concerns.

**Option 2: Inline Execution** — I execute all tasks in this session. Simpler workflow, but heavier on context.

Which approach would you prefer?
