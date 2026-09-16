import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { getDominantSentiment } from '../utils/sentimentAnalysis'
import ErrorBoundary from './ErrorBoundary'

// Unified analytics section: chart + heatmap in one cohesive panel
export default function SentimentAnalytics({ arguments: allArguments = [], maxRounds = 0 }) {
  if (!allArguments || !Array.isArray(allArguments) || allArguments.length === 0) return null

  const totalRounds = Math.max(maxRounds, ...allArguments.map(a => a.round || 0))

  // Prepare chart data
  const chartData = []
  for (let round = 1; round <= totalRounds; round++) {
    const forArg = allArguments.find(a => a.round === round && a.side === 'for')
    const againstArg = allArguments.find(a => a.round === round && a.side === 'against')
    chartData.push({
      round: round > maxRounds ? 'Closing' : `R${round}`,
      for: forArg ? forArg.sentiment?.positive ?? null : null,
      against: againstArg ? againstArg.sentiment?.positive ?? null : null,
      forSentiment: forArg?.sentiment,
      againstSentiment: againstArg?.sentiment,
    })
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#181824] border border-[#2a2a3a] rounded-lg p-3 shadow-xl" style={{ minWidth: '180px' }}>
          <p className="text-sm font-semibold text-slate-200 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm flex items-center gap-2" style={{ color: entry.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              {entry.name}: {entry.value !== null ? `${entry.value}%` : '—'}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Heatmap helpers
  const argsByRound = {}
  allArguments.forEach(arg => {
    if (!argsByRound[arg.round]) argsByRound[arg.round] = { for: null, against: null }
    argsByRound[arg.round][arg.side] = arg
  })

  const getCellColor = (sentiment) => {
    if (!sentiment) return 'bg-slate-800'
    return getDominantSentiment(sentiment) === 'positive' ? 'bg-green-500/50' : 'bg-red-500/50'
  }

  const getCellText = (sentiment) => {
    if (!sentiment) return '—'
    const dominant = getDominantSentiment(sentiment)
    return dominant === 'positive' ? `${Math.round(sentiment.positive)}%` : `${Math.round(sentiment.negative)}%`
  }

  return (
    <div className="space-y-8">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
        <h2 className="text-lg font-semibold text-slate-200 tracking-tight">Sentiment Analysis</h2>
      </div>

      {/* Chart */}
      <ErrorBoundary>
        <div className="bg-[#12121b] border border-[#22222e] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-1">Argument sentiment over rounds</h3>
          <p className="text-[12px] text-slate-500 mb-4">Positive emotional tone by side — higher = more optimistic tone</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2c" vertical={false} />
                <XAxis
                  dataKey="round"
                  stroke="#4a4a5a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#2a2a3a' }}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="#4a4a5a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#2a2a3a' }}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip content={<CustomTooltip />} wrapperStyle={{ outline: 'none' }} />
                <Legend
                  layout="horizontal"
                  align="center"
                  verticalAlign="top"
                  iconType="circle"
                  iconSize={7}
                  wrapperStyle={{ paddingTop: '8px', fontSize: '12px' }}
                  formatter={(v) => v === 'for' ? 'Supporting' : 'Opposing'}
                />
                <Line
                  type="monotone"
                  dataKey="for"
                  stroke="#22c55e"
                  strokeWidth={2.5}
                  dot={{ r: 5, strokeWidth: 2, fill: '#12121b' }}
                  activeDot={{ r: 7, strokeWidth: 3 }}
                  name="for"
                  connectNulls={true}
                />
                <Line
                  type="monotone"
                  dataKey="against"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  dot={{ r: 5, strokeWidth: 2, fill: '#12121b' }}
                  activeDot={{ r: 7, strokeWidth: 3 }}
                  name="against"
                  connectNulls={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </ErrorBoundary>

      {/* Heatmap */}
      <ErrorBoundary>
        <div className="bg-[#12121b] border border-[#22222e] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-1">Tone heatmap</h3>
          <p className="text-[12px] text-slate-500 mb-4">Dominant emotional tone per round per side</p>

          <div className="grid grid-cols-3 gap-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3 px-1">
            <div className="text-center">Round</div>
            <div className="text-center text-green-400">Supporting</div>
            <div className="text-center text-red-400">Opposing</div>
          </div>

          <div className="space-y-1.5">
            {Array.from({ length: totalRounds }, (_, i) => i + 1).map(round => {
              const roundData = argsByRound[round]
              const forArg = roundData?.for
              const againstArg = roundData?.against
              const isClosing = round > maxRounds
              const roundLabel = isClosing ? 'Closing' : `R${round}`

              return (
                <div key={round} className="grid grid-cols-3 gap-2 items-center">
                  <div className="text-center text-sm font-medium text-slate-400 py-2">{roundLabel}</div>
                  <div className={`rounded-lg px-3 py-2 text-center text-sm font-bold transition-all duration-300 ${getCellColor(forArg?.sentiment)} text-white`}>
                    {getCellText(forArg?.sentiment)}
                  </div>
                  <div className={`rounded-lg px-3 py-2 text-center text-sm font-bold transition-all duration-300 ${getCellColor(againstArg?.sentiment)} text-white`}>
                    {getCellText(againstArg?.sentiment)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </ErrorBoundary>
    </div>
  )
}