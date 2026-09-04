'use client'

import { useId } from 'react'

export type FractionalStarRatingProps = {
  rating: number
  maxStars?: number
  size?: number
  className?: string
  gapClass?: string
}

/**
 * Dynamic Fractional Star Rating component.
 * Renders fractional stars smoothly via vector SVG linear gradients.
 * Formula per star: clamp(rating - index, 0, 1) * 100%
 * Left-to-right fill: e.g. 4.9 has 4 full yellow stars + 1 star with 90% yellow and 10% gray on the right tip.
 */
export function FractionalStarRating({
  rating,
  maxStars = 5,
  size = 28,
  className = 'flex items-center justify-center',
  gapClass = 'gap-1.5',
}: FractionalStarRatingProps) {
  const instanceId = useId().replace(/[^a-zA-Z0-9]/g, '')
  const safeRating = Math.max(0, Math.min(maxStars, Number(rating) || 0))

  return (
    <div
      className={`${className} ${gapClass}`}
      role="img"
      aria-label={`Rating ${safeRating.toFixed(1)} dari ${maxStars}`}
    >
      {Array.from({ length: maxStars }, (_, index) => {
        // Formula fill per star: clamp(rating - index, 0, 1) * 100%
        const fillFraction = Math.max(0, Math.min(1, safeRating - index))
        const fillPercent = Math.round(fillFraction * 1000) / 10
        const gradId = `star-grad-${instanceId}-${index}`

        return (
          <svg
            key={index}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            className="shrink-0 select-none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset={`${fillPercent}%`} stopColor="#fbbf24" />
                <stop offset={`${fillPercent}%`} stopColor="#cbd5e1" />
              </linearGradient>
            </defs>
            <polygon
              points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
              fill={`url(#${gradId})`}
              stroke={`url(#${gradId})`}
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )
      })}
    </div>
  )
}


