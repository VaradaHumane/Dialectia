import React from 'react'
import { getDominantSentiment } from '../utils/sentimentAnalysis'

// Wide argument card with policy deliberation style
export default function ArgumentCard({ argument = {}, index = 0, wide = false }) {
  const {
    round = 1,
    side = 'for',
    argument: text = '',
    sentiment = { positive: 50, negative: 50 },
    isClosing = false
  } = argument || {}

  const isFor = side === 'for'
  const accentColor = isFor ? '#22c55e' : '#ef4444'
  const accentBg = isFor ? 'bg-green-500' : 'bg-red-500'
  const badgeBg = isFor ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
  const badgeText = isFor ? 'Supporting' : 'Opposing'
  const sentimentLabel = isFor ? 'positive' : 'negative'

  const safeSentiment = sentiment || { positive: 50, negative: 50 }
  const dominant = getDominantSentiment(safeSentiment)
  const dominantColor = dominant === 'positive' ? '#22c55e' : '#ef4444'

  const roundLabel = isClosing ? 'Closing' : `R${round}`

  return (
    <div
      className="animate-fade-in"
      style={{ animationDelay: `${(index || 0) * 60}ms` }}
    >
      <div
        className={`
          relative
          bg-[#12121b]
          border border-[#22222e]
          rounded-xl
          overflow-hidden
          transition-all duration-300
          hover:border-[#2e2e3e]
          ${wide ? '' : ''}
        `}
      >
        {/* Thin accent edge at top */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: accentColor }}
        ></div>

        <div className="px-6 py-5">
          {/* Top row: badge + round */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${badgeBg}`}>
                {badgeText}
              </span>
              {!isClosing && (
                <span className="text-[11px] text-slate-500 font-medium">Round {round}</span>
              )}
              {isClosing && (
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold uppercase tracking-wider">
                  Closing
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-slate-600 tracking-wide">{roundLabel}</span>
          </div>

          {/* Argument text */}
          <div className="text-[15px] leading-relaxed text-slate-200 mb-5 whitespace-pre-wrap">
            {text}
          </div>

          {/* Sentiment bar */}
          <div className="pt-4 border-t border-slate-800/50">
            <div className="flex items-center justify-between text-[11px] font-medium mb-2">
              <span className="text-green-400">Positive</span>
              <span className="text-slate-500">Emotional Tone</span>
              <span className="text-red-400">Negative</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden relative">
              <div className="absolute inset-0 flex">
                <div
                  className="h-full bg-green-500 transition-all duration-700"
                  style={{ width: `${safeSentiment.positive}%` }}
                ></div>
                <div
                  className="h-full bg-red-500 transition-all duration-700"
                  style={{ width: `${safeSentiment.negative}%` }}
                ></div>
              </div>
              <div className="relative h-full flex">
                <span
                  className="text-[10px] font-bold text-slate-300 absolute -top-5 transition-all duration-700"
                  style={{ left: `${safeSentiment.positive / 2}%`, transform: 'translateX(-50%)' }}
                >
                  {safeSentiment.positive}%
                </span>
                <span
                  className="text-[10px] font-bold text-slate-300 absolute -top-5 transition-all duration-700"
                  style={{ left: `${safeSentiment.positive + safeSentiment.negative / 2}%`, transform: 'translateX(-50%)' }}
                >
                  {safeSentiment.negative}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}