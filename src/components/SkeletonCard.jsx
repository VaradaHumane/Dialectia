import React from 'react'

// Pulsing placeholder shown while API fetches
export default function SkeletonCard({ side }) {
  const borderColor = side === 'for' ? '#22c55e' : '#ef4444'
  const labelText = side === 'for' ? 'FOR' : 'AGAINST'
  const labelBg = side === 'for' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'

  return (
    <div
      className="animate-pulse-slow"
      style={{
        backgroundColor: '#1a1a24',
        border: '1px solid #2a2a3a',
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: '1rem',
        padding: '1.5rem',
        minHeight: '200px',
      }}
    >
      {/* Agent label + round placeholder */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`px-2 py-0.5 text-xs font-medium rounded ${labelBg}`}
        >
          {labelText} — Round —
        </span>
      </div>

      {/* Argument text skeleton lines */}
      <div className="space-y-3">
        <div className="h-4 bg-slate-700/50 rounded w-3/4"></div>
        <div className="h-4 bg-slate-700/50 rounded w-full"></div>
        <div className="h-4 bg-slate-700/50 rounded w-5/6"></div>
        <div className="h-4 bg-slate-700/50 rounded w-2/3"></div>
      </div>

      {/* Sentiment bar skeleton */}
      <div className="mt-4 pt-4 border-t border-slate-700/30">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span>Positive</span>
          <span>Neutral</span>
          <span>Negative</span>
        </div>
        <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"></div>
        </div>
      </div>
    </div>
  )
}