import React from 'react'

// Full-width consensus summary card
// Shows average sentiment across all arguments with a prominent bar
export default function ConsensusSummary({ arguments: allArguments = [], maxRounds = 3 }) {
  if (!allArguments || allArguments.length === 0) return null

  const forArgs = allArguments.filter(a => a.side === 'for')
  const againstArgs = allArguments.filter(a => a.side === 'against')

  const avgForPositive = forArgs.length > 0
    ? forArgs.reduce((sum, a) => sum + (a.sentiment?.positive || 50), 0) / forArgs.length
    : 50

  const avgAgainstPositive = againstArgs.length > 0
    ? againstArgs.reduce((sum, a) => sum + (a.sentiment?.positive || 50), 0) / againstArgs.length
    : 50

  // Convert to supporting/opposing percentages for the bar
  const avgSentiment = avgForPositive + avgAgainstPositive
  const supportingPct = Math.round((avgForPositive / avgSentiment) * 100)
  const opposingPct = 100 - supportingPct

  const roundsAnalysed = allArguments.length

  return (
    <div className="bg-[#12121b] border border-[#22222e] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#22222e] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
          <h3 className="text-sm font-semibold text-slate-200 tracking-tight">Policy consensus summary</h3>
        </div>
        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
          {roundsAnalysed} arguments analysed
        </span>
      </div>

      <div className="px-6 py-5 space-y-4">
        {/* Consensus bar */}
        <div>
          <div className="h-4 rounded-full overflow-hidden bg-slate-800 flex shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-green-600 to-green-500 transition-all duration-700 flex items-center justify-end pr-2"
              style={{ width: `${supportingPct}%` }}
            >
              <span className="text-[10px] font-bold text-green-950">{supportingPct}%</span>
            </div>
            <div
              className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-700 flex items-center justify-start pl-2"
              style={{ width: `${opposingPct}%` }}
            >
              <span className="text-[10px] font-bold text-red-950">{opposingPct}%</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[12px] font-medium text-green-400">Supporting arguments</span>
            <span className="text-[12px] font-medium text-red-400">Opposing arguments</span>
          </div>
        </div>

        {/* Summary text */}
        <div className="pt-3 border-t border-slate-800/50">
          <p className="text-[14px] text-slate-400 leading-relaxed">
            {forArgs.length > 0 && againstArgs.length > 0 ? (
              <>
                Across {roundsAnalysed} arguments,{' '}
                <span className="text-green-400 font-medium">supporting</span> positions scored an average emotional tone of{' '}
                <span className="text-slate-200 font-semibold">{Math.round(avgForPositive)}%</span> positive, while{' '}
                <span className="text-red-400 font-medium">opposing</span> positions averaged{' '}
                <span className="text-slate-200 font-semibold">{Math.round(avgAgainstPositive)}%</span> positive tone.
                {' '}
                {supportingPct > opposingPct
                  ? 'The debate skewed toward a more supportive consensus overall.'
                  : opposingPct > supportingPct
                    ? 'The debate leaned toward a more critical or opposing consensus overall.'
                    : 'The debate maintained a balanced emotional tone across both sides.'}
              </>
            ) : (
              'Awaiting more arguments to form a consensus analysis.'
            )}
          </p>
        </div>
      </div>
    </div>
  )
}