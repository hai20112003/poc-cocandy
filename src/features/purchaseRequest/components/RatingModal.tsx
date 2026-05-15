import { useState, useEffect } from 'react'
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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, handleClose])

  const displayRating = hoveredRating || rating
  const isValid = rating > 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Đánh giá {supplierName}</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition"
            disabled={isLoading}
            aria-label="Đóng"
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
                    aria-label={`Đánh giá ${star} sao`}
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
              aria-describedby="comment-counter"
            />
            <div className="text-xs text-gray-500 mt-1" id="comment-counter">
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
