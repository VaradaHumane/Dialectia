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

// Positive/Negative tone trend chart using recharts
export default function SentimentChart({ arguments: allArguments = [], maxRounds = 0 }) {
  // Guard against undefined data on initial render
  if (!allArguments || !Array.isArray(allArguments)) {
    return null
  }

  // Include closing statement round if present
  const totalRounds = Math.max(maxRounds, ...allArguments.map(a => a.round || 0))

  // Prepare data for chart - one entry per round with both sides' sentiment
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
        <div
          className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl"
          style={{ minWidth: '180px' }}
        >
          <p className="text-sm font-medium text-slate-200 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p
              key={index}
              className="text-sm flex items-center gap-2"
              style={{ color: entry.color }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              {entry.name}: {entry.value !== null ? `${entry.value}% positive` : '—'}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-200">Tone Trend</h3>
      <p className="text-sm text-slate-500 mb-4">
        Positive emotional tone across rounds. Higher = more optimistic/constructive tone.
      </p>
      <div className="h-72" style={{ backgroundColor: '#1a1a24', borderRadius: '0.75rem', padding: '1rem' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#2a2a3a"
              vertical={false}
            />
            <XAxis
              dataKey="round"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#2a2a3a' }}
            />
            <YAxis
              domain={[0, 100]}
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#2a2a3a' }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              content={<CustomTooltip />}
              wrapperStyle={{ outline: 'none' }}
            />
            <Legend
              layout="horizontal"
              align="center"
              verticalAlign="top"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ paddingTop: '10px', color: '#94a3b8' }}
              formatter={(value) => value === 'for' ? 'FOR' : 'AGAINST'}
            />
            <Line
              type="monotone"
              dataKey="for"
              stroke="#22c55e"
              strokeWidth={2.5}
              dot={{ r: 5, strokeWidth: 2, fill: '#0f0f13' }}
              activeDot={{ r: 7, strokeWidth: 3 }}
              name="FOR"
              connectNulls={true}
            />
            <Line
              type="monotone"
              dataKey="against"
              stroke="#ef4444"
              strokeWidth={2.5}
              dot={{ r: 5, strokeWidth: 2, fill: '#0f0f13' }}
              activeDot={{ r: 7, strokeWidth: 3 }}
              name="AGAINST"
              connectNulls={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}