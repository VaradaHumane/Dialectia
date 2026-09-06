import React from 'react'
import { getDominantSentiment } from '../utils/sentimentAnalysis'

// Sentiment heatmap - grid of rounds x sides
export default function SentimentHeatmap({ arguments: allArguments = [], maxRounds = 0 }) {
  // Guard against undefined data on initial render
  if (!allArguments || !Array.isArray(allArguments)) {
    return null
  }

  // Organize arguments by round and side
  const argsByRound = {}
  allArguments.forEach(arg => {
    if (!argsByRound[arg.round]) {
      argsByRound[arg.round] = { for: null, against: null }
    }
    argsByRound[arg.round][arg.side] = arg
  })

  const getCellColor = (sentiment) => {
    if (!sentiment) return 'bg-slate-700/30'
    const dominant = getDominantSentiment(sentiment)
    if (dominant === 'positive') return 'bg-green-500/60'
    return 'bg-red-500/60'
  }

  const getCellText = (sentiment) => {
    if (!sentiment) return '—'
    const { positive, negative } = sentiment
    const dominant = getDominantSentiment(sentiment)
    if (dominant === 'positive') return `${Math.round(positive)}%`
    return `${Math.round(negative)}%`
  }

  const getTextColor = (sentiment) => {
    if (!sentiment) return 'text-slate-500'
    const dominant = getDominantSentiment(sentiment)
    if (dominant === 'positive') return 'text-white'
    return 'text-white'
  }

  // Include closing statement round if present
  const totalRounds = Math.max(maxRounds, ...allArguments.map(a => a.round || 0))

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-200">Tone Heatmap</h3>
      <p className="text-sm text-slate-500 mb-4">
        Emotional tone per round per agent. Green = Positive tone, Red = Negative tone.
      </p>

      {/* Header row */}
      <div className="grid grid-cols-3 gap-2 text-xs font-medium text-slate-400 mb-2">
        <div className="text-center">Round</div>
        <div className="text-center text-green-400">FOR</div>
        <div className="text-center text-red-400">AGAINST</div>
      </div>

      {/* Round rows */}
      <div className="space-y-2">
        {Array.from({ length: totalRounds }, (_, i) => i + 1).map(round => {
          const roundData = argsByRound[round]
          const forArg = roundData?.for
          const againstArg = roundData?.against

          const isClosing = round > maxRounds
          const roundLabel = isClosing ? 'Closing' : `R${round}`

          return (
            <div key={round} className="grid grid-cols-3 gap-2 items-center">
              <div className="text-center text-sm font-medium text-slate-300 px-3 py-2">
                {roundLabel}
              </div>
              <div
                className={`rounded-lg px-3 py-2 text-center text-sm font-bold transition-all duration-300 ${getCellColor(forArg?.sentiment)} ${getTextColor(forArg?.sentiment)}`}
                style={{ minWidth: '80px' }}
              >
                {getCellText(forArg?.sentiment)}
              </div>
              <div
                className={`rounded-lg px-3 py-2 text-center text-sm font-bold transition-all duration-300 ${getCellColor(againstArg?.sentiment)} ${getTextColor(againstArg?.sentiment)}`}
                style={{ minWidth: '80px' }}
              >
                {getCellText(againstArg?.sentiment)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}