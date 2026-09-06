import React, { useState, useEffect, useCallback, useRef } from 'react'
import ArgumentCard from './ArgumentCard'
import SkeletonCard from './SkeletonCard'
import SentimentHeatmap from './SentimentHeatmap'
import SentimentChart from './SentimentChart'
import ErrorBoundary from './ErrorBoundary'
import { runFullDebate } from '../utils/debateEngine'

// Main debate screen - orchestrates rounds and state
export default function DebateContainer({ topic, maxRounds, onReset }) {
  const [debateArguments, setArguments] = useState([])
  const [currentRound, setCurrentRound] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingSide, setLoadingSide] = useState(null) // 'for' or 'against'
  const [error, setError] = useState(null)
  const [isComplete, setIsComplete] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const debateRef = useRef(null)

  // Progress calculation - include closing round (maxRounds + 1)
  const totalRounds = maxRounds + 1 // +1 for closing statements
  const progress = isComplete ? 100 : (currentRound / totalRounds) * 100

  const handleForArgument = useCallback((arg) => {
    setArguments(prev => [...prev, arg])
    setLoadingSide(null)
  }, [])

  const handleAgainstArgument = useCallback((arg) => {
    setArguments(prev => [...prev, arg])
    setLoadingSide(null)
  }, [])

  const handleRoundStart = useCallback((round) => {
    setCurrentRound(round)
    setLoadingSide('for')
    setError(null)
    setIsClosing(round > maxRounds)
  }, [maxRounds])

  const handleRoundComplete = useCallback((round) => {
    // Round complete, next round will start automatically
  }, [])

  const handleError = useCallback((errorMsg) => {
    setError(errorMsg)
    setIsLoading(false)
    setLoadingSide(null)
  }, [])

  const handleComplete = useCallback((allArgs) => {
    setIsComplete(true)
    setIsLoading(false)
    setLoadingSide(null)
    setIsClosing(false)
  }, [])

  // Start debate on mount
  useEffect(() => {
    let mounted = true

    async function startDebate() {
      setIsLoading(true)
      setError(null)
      setArguments([])
      setCurrentRound(0)
      setIsComplete(false)

      try {
        await runFullDebate(topic, maxRounds, {
          onRoundStart: handleRoundStart,
          onForArgument: handleForArgument,
          onAgainstArgument: handleAgainstArgument,
          onRoundComplete: handleRoundComplete,
          onError: handleError,
          onComplete: handleComplete,
        })
      } catch (err) {
        if (mounted) {
          handleError(err.message)
        }
      }
    }

    startDebate()

    return () => {
      mounted = false
    }
  }, [topic, maxRounds, handleRoundStart, handleForArgument, handleAgainstArgument, handleRoundComplete, handleError, handleComplete])

  // Retry failed round
  const handleRetry = useCallback(() => {
    // For simplicity, restart the whole debate
    // In a more complex version, we could resume from the failed round
    setError(null)
    setArguments([])
    setCurrentRound(0)
    setIsComplete(false)
    // Trigger re-run by updating a key or state
    window.location.reload()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Sticky top navbar */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-white">Dialectia</h1>
          <div className="flex items-center gap-4">
            {/* Round badge */}
            <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25">
              {isComplete ? `Complete (${maxRounds} Rounds + Closing)` : isClosing ? `Closing Statements` : `Round ${currentRound} of ${maxRounds}`}
            </div>
            {/* Reset button */}
            <button
              onClick={onReset}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              New Debate
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-slate-800 overflow-hidden" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-progress"
            style={{ width: `${progress}%`, '--progress-width': `${progress}%` }}
          ></div>
        </div>
      </nav>

      {/* Debate content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Topic header */}
        <div className="mb-8 text-center">
          <p className="text-sm text-slate-500 mb-1">Debating:</p>
          <h2 className="text-2xl font-bold text-white max-w-3xl mx-auto">{topic}</h2>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-3 text-red-400">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
              <span>{error}</span>
            </div>
            <button
              onClick={handleRetry}
              className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 font-medium hover:bg-red-500/30 transition-all"
            >
              Retry
            </button>
          </div>
        )}

        {/* Debate columns */}
        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          {/* FOR column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-semibold">FOR</span>
            </div>
            <div className="space-y-4">
              {/* Regular rounds */}
              {Array.from({ length: maxRounds }, (_, i) => i + 1).map(round => {
                const arg = debateArguments.find(a => a.round === round && a.side === 'for')
                const isCurrentLoading = isLoading && loadingSide === 'for' && currentRound === round

                if (isCurrentLoading) {
                  return <SkeletonCard key={`for-${round}-loading`} side="for" />
                }

                if (arg) {
                  return <ArgumentCard key={`for-${round}`} argument={arg} index={round - 1} />
                }

                // Empty placeholder for future rounds
                if (round > currentRound || (round === currentRound && loadingSide !== 'for')) {
                  return (
                    <div
                      key={`for-${round}-empty`}
                      className="bg-slate-900/30 border border-slate-700/50 border-l-4 border-l-green-500/50 rounded-2xl p-6 min-h-[200px] opacity-50"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-green-500/10 text-green-500/50">
                          FOR — Round {round}
                        </span>
                      </div>
                      <p className="text-slate-500 text-sm">Waiting for argument...</p>
                    </div>
                  )
                }

                return null
              })}
              {/* Closing statement round */}
              {isComplete && (
                <React.Fragment>
                  {debateArguments.find(a => a.round === maxRounds + 1 && a.side === 'for') ? (
                    debateArguments
                      .filter(a => a.round === maxRounds + 1 && a.side === 'for')
                      .map((arg, idx) => (
                        <ArgumentCard key={`for-closing-${idx}`} argument={arg} index={maxRounds + idx} />
                      ))
                  ) : (
                    <div
                      key={`for-closing-empty`}
                      className="bg-slate-900/30 border border-slate-700/50 border-l-4 border-l-green-500/50 rounded-2xl p-6 min-h-[200px] opacity-50"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-green-500/10 text-green-500/50">
                          FOR — Closing Statement
                        </span>
                      </div>
                      <p className="text-slate-500 text-sm">Waiting for closing statement...</p>
                    </div>
                  )}
                </React.Fragment>
              )}
            </div>
          </div>

          {/* Center VS divider */}
          <div className="hidden lg:flex flex-col items-center justify-start pt-8">
            <div className="w-1 h-full bg-slate-700/50 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-700 border-2 border-slate-600"></div>
            </div>
            <span className="mt-4 px-3 py-1 text-xs font-bold tracking-wider text-slate-500 bg-slate-900 border border-slate-700 rounded-full">
              VS
            </span>
            <div className="w-1 h-full bg-slate-700/50 relative">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 rounded-full bg-slate-700 border-2 border-slate-600"></div>
            </div>
          </div>

          {/* AGAINST column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm font-semibold">AGAINST</span>
            </div>
            <div className="space-y-4">
              {/* Regular rounds */}
              {Array.from({ length: maxRounds }, (_, i) => i + 1).map(round => {
                const arg = debateArguments.find(a => a.round === round && a.side === 'against')
                const isCurrentLoading = isLoading && loadingSide === 'against' && currentRound === round

                if (isCurrentLoading) {
                  return <SkeletonCard key={`against-${round}-loading`} side="against" />
                }

                if (arg) {
                  return <ArgumentCard key={`against-${round}`} argument={arg} index={round - 1} />
                }

                // Empty placeholder for future rounds
                if (round > currentRound || (round === currentRound && loadingSide !== 'against')) {
                  return (
                    <div
                      key={`against-${round}-empty`}
                      className="bg-slate-900/30 border border-slate-700/50 border-l-4 border-l-red-500/50 rounded-2xl p-6 min-h-[200px] opacity-50"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-red-500/10 text-red-500/50">
                          AGAINST — Round {round}
                        </span>
                      </div>
                      <p className="text-slate-500 text-sm">Waiting for argument...</p>
                    </div>
                  )
                }

                return null
              })}
              {/* Closing statement round */}
              {isComplete && (
                <React.Fragment>
                  {debateArguments.find(a => a.round === maxRounds + 1 && a.side === 'against') ? (
                    debateArguments
                      .filter(a => a.round === maxRounds + 1 && a.side === 'against')
                      .map((arg, idx) => (
                        <ArgumentCard key={`against-closing-${idx}`} argument={arg} index={maxRounds + idx} />
                      ))
                  ) : (
                    <div
                      key={`against-closing-empty`}
                      className="bg-slate-900/30 border border-slate-700/50 border-l-4 border-l-red-500/50 rounded-2xl p-6 min-h-[200px] opacity-50"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-red-500/10 text-red-500/50">
                          AGAINST — Closing Statement
                        </span>
                      </div>
                      <p className="text-slate-500 text-sm">Waiting for closing statement...</p>
                    </div>
                  )}
                </React.Fragment>
              )}
            </div>
          </div>
        </div>

        {/* Mobile VS divider - only show on mobile between cards */}
        <div className="lg:hidden space-y-4">
          {Array.from({ length: maxRounds + 1 }, (_, i) => i + 1).map(round => {
            const forArg = debateArguments.find(a => a.round === round && a.side === 'for')
            const againstArg = debateArguments.find(a => a.round === round && a.side === 'against')
            const showDivider = forArg || againstArg

            return showDivider ? (
              <div key={`mobile-divider-${round}`} className="flex items-center justify-center gap-4 py-2">
                <span className="px-2 py-0.5 text-xs font-bold tracking-wider text-slate-500 bg-slate-900 border border-slate-700 rounded-full">VS</span>
              </div>
            ) : null
          })}
        </div>

        {/* Visualizations */}
        {(debateArguments.length > 0 || isComplete) && (
          <div className="grid lg:grid-cols-2 gap-6 mt-8">
            <ErrorBoundary>
              <SentimentHeatmap arguments={debateArguments} maxRounds={maxRounds} />
            </ErrorBoundary>
            <ErrorBoundary>
              <SentimentChart arguments={debateArguments} maxRounds={maxRounds} />
            </ErrorBoundary>
          </div>
        )}

        {/* Completion message */}
        {isComplete && (
          <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 text-center animate-fade-in">
            <svg className="w-12 h-12 mx-auto text-indigo-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <h3 className="text-xl font-bold text-white mb-2">Debate Complete</h3>
            <p className="text-slate-400">All {maxRounds} rounds completed. Review the sentiment analysis above.</p>
          </div>
        )}
      </main>
    </div>
  )
}