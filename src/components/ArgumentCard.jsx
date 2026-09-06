import React from 'react'
import { getDominantSentiment } from '../utils/sentimentAnalysis'

// Single argument card with positive/negative sentiment bar
export default function ArgumentCard({ argument = {}, index = 0 }) {
  const { round = 1, side = 'for', argument: text = '', sentiment = { positive: 50, negative: 50 }, isClosing = false } = argument || {}
  const isFor = side === 'for'
  const borderColor = isFor ? '#22c55e' : '#ef4444'
  const labelBg = isFor ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
  const labelText = isFor ? 'FOR' : 'AGAINST'

  // Guard against missing sentiment
  const safeSentiment = sentiment || { positive: 50, negative: 50 }

  // Determine dominant sentiment for color coding
  const dominant = getDominantSentiment(safeSentiment)

  const dominantColor = dominant === 'positive' ? '#22c55e' : '#ef4444'
  const dominantLabel = dominant.charAt(0).toUpperCase() + dominant.slice(1)

  const roundLabel = isClosing ? 'Closing' : `Round ${round}`

  return (
    <div
      className="animate-fade-in"
      style={{
        backgroundColor: '#1a1a24',
        border: '1px solid #2a2a3a',
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: '1rem',
        padding: '1.5rem',
        minHeight: '200px',
        animationDelay: `${index * 50}ms`,
      }}
    >
      {/* Agent label + round number */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`px-2 py-0.5 text-xs font-medium rounded ${labelBg}`}
        >
          {labelText} — {roundLabel}
        </span>
        <span className="text-xs text-slate-500 ml-auto">
          Tone: <span className="font-medium" style={{ color: dominantColor }}>{dominantLabel}</span>
        </span>
      </div>

      {/* Argument text */}
      <div className="text-sm leading-relaxed text-slate-300 mb-4 whitespace-pre-wrap">
        {text}
      </div>

      {/* Positive/Negative sentiment bar */}
      <div className="pt-4 border-t border-slate-700/30">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span className="text-green-400">Positive</span>
          <span className="text-red-400">Negative</span>
        </div>
        <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden relative">
          <div
            className="absolute inset-0 flex"
            role="progressbar"
            aria-valuenow={100}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full bg-green-500"
              style={{ width: `${safeSentiment.positive}%` }}
            ></div>
            <div
              className="h-full bg-red-500"
              style={{ width: `${safeSentiment.negative}%` }}
            ></div>
          </div>
          {/* Percentage labels */}
          <div className="relative h-full flex">
            <span
              className="text-[10px] font-medium text-slate-200 absolute top-[-20px] left-0 transform -translate-x-1/2"
              style={{ left: `${safeSentiment.positive / 2}%` }}
            >
              {safeSentiment.positive}%
            </span>
            <span
              className="text-[10px] font-medium text-slate-200 absolute top-[-20px] left-0 transform -translate-x-1/2"
              style={{ left: `${safeSentiment.positive + safeSentiment.negative / 2}%` }}
            >
              {safeSentiment.negative}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}