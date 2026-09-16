import React, { useState, useEffect, useCallback } from 'react'
import ArgumentCard from './ArgumentCard'
import SkeletonCard from './SkeletonCard'
import DebateTimeline from './DebateTimeline'
import SentimentAnalytics from './SentimentAnalytics'
import ConsensusSummary from './ConsensusSummary'
import { runFullDebate } from '../utils/debateEngine'

// Main debate screen — policy deliberation layout
export default function DebateContainer({ topic, maxRounds, onReset }) {
  const [debateArguments, setArguments] = useState([])
  const [currentRound, setCurrentRound] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingSide, setLoadingSide] = useState(null)
  const [error, setError] = useState(null)
  const [isComplete, setIsComplete] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const totalSteps = maxRounds + 1
  const progress = isComplete ? 100 : (currentRound / totalSteps) * 100

  // Callbacks
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

  const handleError = useCallback((msg) => {
    setError(msg)
    setIsLoading(false)
    setLoadingSide(null)
  }, [])

  const handleComplete = useCallback(() => {
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
          onRoundComplete: () => {},
          onError: handleError,
          onComplete: handleComplete,
        })
      } catch (err) {
        if (mounted) handleError(err.message)
      }
    }

    startDebate()
    return () => { mounted = false }
  }, [topic, maxRounds, handleRoundStart, handleForArgument, handleAgainstArgument, handleError, handleComplete])

  const handleRetry = () => {
    setError(null)
    setArguments([])
    setCurrentRound(0)
    setIsComplete(false)
    window.location.reload()
  }

  // Separate regular rounds from closing
  const regularArguments = debateArguments.filter(a => a.round <= maxRounds)
  const closingArguments = debateArguments.filter(a => a.round === maxRounds + 1)
  const hasClosing = closingArguments.length > 0

  return (
    <div className="min-h-screen">
      {/* ─── NAVBAR ─── */}
      <nav className="sticky top-0 z-50 bg-[#0a0a10]/90 backdrop-blur-md border-b border-[#1c1c2a]">
        <div className="max-w-5xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-bold tracking-tight text-white">Dialectia</h1>
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 text-[11px] font-semibold border border-indigo-500/20">
                {isComplete
                  ? `${maxRounds} rounds + closing`
                  : isClosing
                    ? 'Closing statements'
                    : `Round ${currentRound} of ${maxRounds}`}
              </span>
            </div>
          </div>
          <button
            onClick={onReset}
            className="px-4 py-1.5 rounded-lg bg-slate-800/80 text-slate-300 text-[12px] font-semibold hover:bg-slate-700 hover:text-white transition-all border border-slate-700/50"
          >
            New Debate
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-slate-800/50">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-5 py-6">
        {/* ─── ROUND TIMELINE ─── */}
        <div className="mb-6">
          <DebateTimeline
            maxRounds={maxRounds}
            currentRound={currentRound}
            isComplete={isComplete}
            isClosing={isClosing}
          />
        </div>

        {/* ─── POLICY BAR ─── */}
        <div className="mb-8 flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
          <p className="text-sm text-slate-400">
            <span className="text-slate-300 font-medium">Policy:</span>{' '}
            {topic}
            {isComplete
              ? ' — debate concluded'
              : ' — debate in progress'}
            {' '}across {maxRounds} rounds
          </p>
        </div>

        {/* ─── ERROR ─── */}
        {error && (
          <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-3 text-red-400 text-sm">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
            <button onClick={handleRetry} className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/30 transition-all">
              Retry
            </button>
          </div>
        )}

        {/* ─── MAIN DEBATE SECTION ─── */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-5 bg-slate-700 rounded-full"></div>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Debate</h2>
          </div>

          {/* Desktop staggered layout — Supporting left, Opposing right */}
          <div className="hidden md:block space-y-4">
            {Array.from({ length: maxRounds }, (_, i) => i + 1).map(round => {
              const forArg = regularArguments.find(a => a.round === round && a.side === 'for')
              const againstArg = regularArguments.find(a => a.round === round && a.side === 'against')
              const isCurrentLoading = isLoading && currentRound === round

              return (
                <React.Fragment key={`round-${round}`}>
                  {/* Supporting — left-aligned */}
                  <div className="flex">
                    <div className="w-[72%]">
                      {isCurrentLoading && loadingSide === 'for' ? (
                        <SkeletonCard side="for" />
                      ) : forArg ? (
                        <ArgumentCard argument={forArg} index={round - 1} />
                      ) : (
                        <EmptyCard side="for" round={round} />
                      )}
                    </div>
                  </div>

                  {/* Opposing — offset right */}
                  <div className="flex">
                    <div className="ml-auto w-[72%]">
                      {isCurrentLoading && loadingSide === 'against' ? (
                        <SkeletonCard side="against" />
                      ) : againstArg ? (
                        <ArgumentCard argument={againstArg} index={round - 1} />
                      ) : (
                        <EmptyCard side="against" round={round} />
                      )}
                    </div>
                  </div>
                </React.Fragment>
              )
            })}
          </div>

          {/* Mobile stacked layout — Supporting first, Opposing second */}
          <div className="md:hidden space-y-4">
            {Array.from({ length: maxRounds }, (_, i) => i + 1).map(round => {
              const forArg = regularArguments.find(a => a.round === round && a.side === 'for')
              const againstArg = regularArguments.find(a => a.round === round && a.side === 'against')
              const isCurrentLoading = isLoading && currentRound === round

              return (
                <React.Fragment key={`mobile-round-${round}`}>
                  {isCurrentLoading && loadingSide === 'for' ? (
                    <SkeletonCard side="for" />
                  ) : forArg ? (
                    <ArgumentCard argument={forArg} index={round - 1} />
                  ) : (
                    <EmptyCard side="for" round={round} />
                  )}

                  {isCurrentLoading && loadingSide === 'against' ? (
                    <SkeletonCard side="against" />
                  ) : againstArg ? (
                    <ArgumentCard argument={againstArg} index={round - 1} />
                  ) : (
                    <EmptyCard side="against" round={round} />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>

        {/* ─── ANALYTICS ─── */}
        {debateArguments.length > 0 && (
          <div className="mb-10">
            <SentimentAnalytics arguments={debateArguments} maxRounds={maxRounds} />
          </div>
        )}

        {/* ─── CONSENSUS ─── */}
        {isComplete && (
          <div className="mb-10 animate-fade-in">
            <ConsensusSummary arguments={debateArguments} maxRounds={maxRounds} />
          </div>
        )}

        {/* ─── CLOSING STATEMENTS ─── */}
        {(isClosing || isComplete || hasClosing) && (
          <div className="mb-10 animate-fade-in">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-5 bg-indigo-500 rounded-full"></div>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Closing Statements</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {closingArguments.find(a => a.side === 'for') ? (
                <ArgumentCard
                  argument={closingArguments.find(a => a.side === 'for')}
                  index={maxRounds}
                />
              ) : (
                <EmptyCard side="for" round={maxRounds + 1} closing />
              )}

              {closingArguments.find(a => a.side === 'against') ? (
                <ArgumentCard
                  argument={closingArguments.find(a => a.side === 'against')}
                  index={maxRounds + 1}
                />
              ) : (
                <EmptyCard side="against" round={maxRounds + 1} closing />
              )}
            </div>
          </div>
        )}

        {/* ─── COMPLETE BANNER ─── */}
        {isComplete && (
          <div className="mb-12 mt-8 p-5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center animate-fade-in">
            <svg className="w-10 h-10 mx-auto text-indigo-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-base font-bold text-white mb-1">Debate Complete</h3>
            <p className="text-sm text-slate-400">
              {maxRounds} rounds + closing statements delivered.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

// Empty placeholder card for future rounds
function EmptyCard({ side, round, closing = false }) {
  const isFor = side === 'for'
  const accentColor = isFor ? '#22c55e' : '#ef4444'
  const badgeBg = isFor ? 'bg-green-500/10 text-green-500/40' : 'bg-red-500/10 text-red-500/40'
  const badgeText = isFor ? 'Supporting' : 'Opposing'
  const roundLabel = closing ? 'Closing' : `Round ${round}`

  return (
    <div className="relative bg-[#12121b]/60 border border-[#22222e]/50 rounded-xl overflow-hidden">
      {/* Faint accent edge */}
      <div className="absolute top-0 left-0 right-0 h-[2px] opacity-30" style={{ background: accentColor }}></div>

      <div className="px-6 py-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${badgeBg}`}>
              {badgeText}
            </span>
            {!closing && (
              <span className="text-[11px] text-slate-600 font-medium">{roundLabel}</span>
            )}
            {closing && (
              <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400/40 text-[10px] font-semibold uppercase tracking-wider">
                Closing
              </span>
            )}
          </div>
          <span className="text-xs font-bold text-slate-700/50 tracking-wide">{roundLabel}</span>
        </div>
        <p className="text-[14px] text-slate-600 italic">Awaiting argument...</p>
      </div>
    </div>
  )
}