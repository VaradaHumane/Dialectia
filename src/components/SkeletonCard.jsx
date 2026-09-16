import React from 'react'

// Pulsing placeholder matching ArgumentCard shape
export default function SkeletonCard({ side }) {
  const isFor = side === 'for'
  const accentColor = isFor ? '#22c55e' : '#ef4444'
  const badgeBg = isFor ? 'bg-green-500/20' : 'bg-red-500/20'
  const labelText = isFor ? 'Supporting' : 'Opposing'

  return (
    <div className="animate-pulse-slow">
      <div
        className="relative bg-[#12121b] border border-[#22222e] rounded-xl overflow-hidden"
      >
        {/* Accent edge */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: accentColor }}
        ></div>

        <div className="px-6 py-5">
          {/* Badge + round */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${badgeBg} text-slate-400`}>
                {labelText}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Loading...</span>
            </div>
            <span className="text-xs font-bold text-slate-600 tracking-wide">—</span>
          </div>

          {/* Skeleton lines */}
          <div className="space-y-2.5 mb-5">
            <div className="h-3.5 bg-slate-800 rounded w-full"></div>
            <div className="h-3.5 bg-slate-800 rounded w-5/6"></div>
            <div className="h-3.5 bg-slate-800 rounded w-4/5"></div>
            <div className="h-3.5 bg-slate-800 rounded w-3/4"></div>
          </div>

          {/* Sentiment bar skeleton */}
          <div className="pt-4 border-t border-slate-800/50">
            <div className="flex items-center justify-between text-[11px] font-medium mb-2">
              <span className="text-slate-600">Positive</span>
              <span className="text-slate-600">Emotional Tone</span>
              <span className="text-slate-600">Negative</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500/40 via-slate-700 to-red-500/40 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}